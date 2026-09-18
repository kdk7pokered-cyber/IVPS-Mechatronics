from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User, Machine, ContactUnlock, Payment
from app.schemas.schemas import (
    ContactUnlockOrderRequest, PaymentInitiateResponse,
    PaymentVerifyRequest, UnlockedBrokerContact
)
from app.services.payment_service import (
    initiate_contact_unlock_payment, verify_and_unlock_contact, get_effective_machine_fee
)

router = APIRouter(prefix="/unlock", tags=["Broker Contact Unlock & Protection"])

@router.post("/initiate", response_model=PaymentInitiateResponse)
def initiate_unlock(
    request: ContactUnlockOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    machine = db.query(Machine).filter(Machine.id == request.machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine listing not found")

    if machine.broker_id == current_user.id:
        raise HTTPException(status_code=400, detail="You are the listing broker for this machine")

    payment = initiate_contact_unlock_payment(
        db=db,
        buyer=current_user,
        machine=machine,
        payment_method=request.payment_method
    )

    broker_name = machine.broker.name if machine.broker else "IVPS Verified Broker"

    return PaymentInitiateResponse(
        payment_id=payment.id,
        transaction_id=payment.transaction_id,
        amount=payment.amount,
        currency="INR",
        status=payment.status,
        machine_id=machine.id,
        machine_title=machine.title,
        broker_name=broker_name,
        provider=payment.provider
    )

@router.post("/verify")
def verify_unlock(
    request: PaymentVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = verify_and_unlock_contact(
        db=db,
        payment_id=request.payment_id,
        buyer_id=current_user.id,
        simulate_status=request.simulate_status
    )

    if not result.get("success"):
        return {
            "success": False,
            "status": result.get("status", "failed"),
            "message": result.get("message", "Payment verification could not be completed"),
            "contact": None
        }

    payment = result.get("payment")
    machine = db.query(Machine).filter(Machine.id == payment.machine_id).first()
    broker = machine.broker

    contact_data = UnlockedBrokerContact(
        broker_id=broker.id,
        broker_name=broker.name,
        company=broker.company,
        phone=broker.phone,
        whatsapp=broker.whatsapp or broker.phone,
        email=broker.email,
        city=machine.city,
        state=machine.state,
        country=machine.country,
        address=machine.address,
        is_verified=broker.is_verified
    )

    return {
        "success": True,
        "status": "success",
        "message": "Broker contact details successfully unlocked!",
        "contact": contact_data
    }

@router.get("/status/{machine_id}")
def check_unlock_status(
    machine_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    is_broker_owner = (machine.broker_id == current_user.id)
    is_admin = (current_user.role == "admin")

    unlock = db.query(ContactUnlock).filter(
        ContactUnlock.buyer_id == current_user.id,
        ContactUnlock.machine_id == machine_id,
        ContactUnlock.status == "active"
    ).first()

    return {
        "is_unlocked": bool(unlock or is_broker_owner or is_admin),
        "is_owner": is_broker_owner,
        "unlocked_at": unlock.unlocked_at if unlock else None
    }
