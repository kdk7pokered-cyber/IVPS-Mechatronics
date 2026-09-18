import uuid
from typing import Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import Payment, ContactUnlock, Machine, User, SystemSetting
from app.core.config import settings

def get_platform_default_fee(db: Session) -> float:
    setting = db.query(SystemSetting).filter(SystemSetting.key == "default_contact_unlock_fee").first()
    if setting:
        try:
            return float(setting.value)
        except Exception:
            pass
    return settings.DEFAULT_CONTACT_UNLOCK_FEE

def get_effective_machine_fee(db: Session, machine: Machine) -> float:
    if machine.contact_unlock_fee is not None and machine.contact_unlock_fee > 0:
        return float(machine.contact_unlock_fee)
    return get_platform_default_fee(db)


class PaymentGatewayInterface:
    def create_order(self, amount: float, currency: str, reference_id: str, metadata: dict) -> Dict[str, Any]:
        raise NotImplementedError

    def verify_payment(self, transaction_id: str, verification_payload: dict) -> Dict[str, Any]:
        raise NotImplementedError


class SimulatedPaymentGateway(PaymentGatewayInterface):
    def create_order(self, amount: float, currency: str, reference_id: str, metadata: dict) -> Dict[str, Any]:
        tx_id = f"IVPS-UPI-{uuid.uuid4().hex[:10].upper()}"
        return {
            "transaction_id": tx_id,
            "amount": amount,
            "currency": currency,
            "status": "pending",
            "provider": "simulated",
            "metadata": metadata
        }

    def verify_payment(self, transaction_id: str, verification_payload: dict) -> Dict[str, Any]:
        simulated_state = verification_payload.get("simulate_status", "success")
        if simulated_state == "success":
            return {
                "success": True,
                "status": "success",
                "transaction_id": transaction_id,
                "reason": None
            }
        elif simulated_state == "failed":
            return {
                "success": False,
                "status": "failed",
                "transaction_id": transaction_id,
                "reason": "Payment authorization declined by user UPI/Bank."
            }
        elif simulated_state == "cancelled":
            return {
                "success": False,
                "status": "cancelled",
                "transaction_id": transaction_id,
                "reason": "Transaction cancelled during payment flow."
            }
        else:
            return {
                "success": False,
                "status": "failed",
                "transaction_id": transaction_id,
                "reason": "Invalid transaction payload."
            }


payment_gateway = SimulatedPaymentGateway()

def initiate_contact_unlock_payment(
    db: Session,
    buyer: User,
    machine: Machine,
    payment_method: str = "upi"
) -> Payment:
    # Check if buyer already has an active unlock for this machine
    existing_unlock = db.query(ContactUnlock).filter(
        ContactUnlock.buyer_id == buyer.id,
        ContactUnlock.machine_id == machine.id,
        ContactUnlock.status == "active"
    ).first()
    if existing_unlock:
        existing_pay = db.query(Payment).filter(Payment.id == existing_unlock.payment_id).first()
        if existing_pay:
            return existing_pay

    fee = get_effective_machine_fee(db, machine)

    order = payment_gateway.create_order(
        amount=fee,
        currency="INR",
        reference_id=f"M_{machine.id}_B_{buyer.id}",
        metadata={"buyer_id": buyer.id, "machine_id": machine.id, "broker_id": machine.broker_id}
    )

    payment = Payment(
        user_id=buyer.id,
        machine_id=machine.id,
        amount=order["amount"],
        currency="INR",
        provider=order["provider"],
        payment_method=payment_method,
        transaction_id=order["transaction_id"],
        status="pending"
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

def verify_and_unlock_contact(
    db: Session,
    payment_id: int,
    buyer_id: int,
    simulate_status: str = "success"
) -> Dict[str, Any]:
    payment = db.query(Payment).filter(Payment.id == payment_id, Payment.user_id == buyer_id).first()
    if not payment:
        return {"success": False, "message": "Payment record not found"}

    if payment.status == "success":
        unlock = db.query(ContactUnlock).filter(ContactUnlock.payment_id == payment.id).first()
        return {"success": True, "status": "success", "unlock_id": unlock.id if unlock else None, "payment": payment}

    result = payment_gateway.verify_payment(payment.transaction_id, {"simulate_status": simulate_status})
    
    if result["status"] == "success":
        payment.status = "success"
        payment.failure_reason = None
        db.commit()

        machine = db.query(Machine).filter(Machine.id == payment.machine_id).first()
        if machine:
            unlock = db.query(ContactUnlock).filter(
                ContactUnlock.buyer_id == buyer_id,
                ContactUnlock.machine_id == machine.id
            ).first()
            if not unlock:
                unlock = ContactUnlock(
                    buyer_id=buyer_id,
                    broker_id=machine.broker_id,
                    machine_id=machine.id,
                    payment_id=payment.id,
                    amount=payment.amount,
                    currency="INR",
                    status="active",
                    unlocked_at=datetime.utcnow()
                )
                db.add(unlock)
                db.commit()
                db.refresh(unlock)
            return {"success": True, "status": "success", "unlock_id": unlock.id, "payment": payment}
    elif result["status"] == "failed":
        payment.status = "failed"
        payment.failure_reason = result["reason"]
        db.commit()
        return {"success": False, "status": "failed", "message": result["reason"], "payment": payment}
    elif result["status"] == "cancelled":
        payment.status = "cancelled"
        payment.failure_reason = result["reason"]
        db.commit()
        return {"success": False, "status": "cancelled", "message": result["reason"], "payment": payment}

    return {"success": False, "status": "unknown", "message": "Unhandled status", "payment": payment}
