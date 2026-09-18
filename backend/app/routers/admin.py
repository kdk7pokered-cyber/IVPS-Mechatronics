import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.core.database import get_db
from app.core.deps import require_admin
from app.models.models import User, Machine, Payment, ContactUnlock, Enquiry, SystemSetting
from app.schemas.schemas import (
    ModerationAction, FeatureToggle, UserResponse, PlatformFeeUpdate, MachineFeeUpdate
)
from app.services.payment_service import get_platform_default_fee

router = APIRouter(prefix="/admin", tags=["Admin Management & Platform Controls"])

# ----------------- Contact Unlock Fee Controls -----------------
@router.get("/settings/fee")
def get_unlock_fee_settings(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    current_default = get_platform_default_fee(db)
    
    # Also fetch count of machines having custom fees
    custom_count = db.query(Machine).filter(Machine.contact_unlock_fee.isnot(None)).count()

    return {
        "default_contact_unlock_fee": current_default,
        "currency": "INR",
        "currency_symbol": "₹",
        "custom_fee_machines_count": custom_count
    }

@router.put("/settings/fee")
def update_platform_default_fee(
    fee_in: PlatformFeeUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    setting = db.query(SystemSetting).filter(SystemSetting.key == "default_contact_unlock_fee").first()
    if not setting:
        setting = SystemSetting(
            key="default_contact_unlock_fee",
            value=str(fee_in.default_fee),
            description="Platform default contact unlock fee in INR (₹)"
        )
        db.add(setting)
    else:
        setting.value = str(fee_in.default_fee)

    db.commit()
    return {
        "success": True,
        "default_contact_unlock_fee": fee_in.default_fee,
        "currency": "INR",
        "message": f"Default platform contact unlock fee updated to ₹{fee_in.default_fee}"
    }

@router.put("/machines/{machine_id}/fee")
def update_machine_custom_fee(
    machine_id: int,
    fee_in: MachineFeeUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    machine.contact_unlock_fee = fee_in.contact_unlock_fee
    db.commit()
    db.refresh(machine)

    return {
        "success": True,
        "machine_id": machine.id,
        "machine_title": machine.title,
        "contact_unlock_fee": machine.contact_unlock_fee,
        "message": f"Custom fee for '{machine.title}' set to ₹{machine.contact_unlock_fee}" if machine.contact_unlock_fee else "Machine fee reset to platform default."
    }

# ----------------- Contact Unlock Transactions & Revenue -----------------
@router.get("/unlock-transactions")
def get_unlock_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1),
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(ContactUnlock).order_by(desc(ContactUnlock.unlocked_at))
    total = query.count()
    unlocks = query.offset((page - 1) * page_size).limit(page_size).all()

    total_revenue = db.query(func.sum(ContactUnlock.amount)).scalar() or 0.0

    items = []
    for u in unlocks:
        items.append({
            "unlock_id": u.id,
            "buyer_id": u.buyer_id,
            "buyer_name": u.buyer.name if u.buyer else "Unknown",
            "buyer_email": u.buyer.email if u.buyer else "Unknown",
            "broker_id": u.broker_id,
            "broker_name": u.broker.name if u.broker else "Unknown",
            "machine_id": u.machine_id,
            "machine_title": u.machine.title if u.machine else "Machinery Listing",
            "amount": u.amount,
            "currency": u.currency or "INR",
            "unlocked_at": u.unlocked_at
        })

    return {
        "total": total,
        "total_revenue": round(total_revenue, 2),
        "currency": "INR",
        "currency_symbol": "₹",
        "items": items
    }

# ----------------- Listing Moderation Queue -----------------
@router.get("/pending-machines")
def get_pending_machines(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Machine).filter(Machine.status == "pending_approval").order_by(desc(Machine.created_at))
    total = query.count()
    machines = query.offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for m in machines:
        imgs = []
        try:
            imgs = json.loads(m.images) if m.images else []
        except Exception:
            imgs = []
        items.append({
            "id": m.id,
            "title": m.title,
            "category": m.category,
            "listing_type": m.listing_type,
            "manufacturer": m.manufacturer,
            "model": m.model,
            "year": m.year,
            "price": m.price,
            "status": m.status,
            "condition": m.condition,
            "broker_name": m.broker.name if m.broker else "Unknown",
            "broker_email": m.broker.email if m.broker else "Unknown",
            "broker_phone": m.broker.phone if m.broker else "Unknown",
            "primary_image": imgs[0] if imgs else None,
            "created_at": m.created_at
        })

    return {"total": total, "items": items}

@router.post("/machines/{machine_id}/moderate")
def moderate_machine(
    machine_id: int,
    action: ModerationAction,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    machine.status = action.status
    if action.rejection_reason:
        machine.rejection_reason = action.rejection_reason
    db.commit()
    db.refresh(machine)

    return {
        "success": True,
        "machine_id": machine.id,
        "status": machine.status,
        "message": f"Listing successfully updated to '{machine.status}'"
    }

@router.post("/machines/{machine_id}/feature")
def toggle_feature(
    machine_id: int,
    toggle: FeatureToggle,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    machine.is_featured = toggle.is_featured
    db.commit()
    return {"success": True, "machine_id": machine.id, "is_featured": machine.is_featured}

# ----------------- User & Broker Management -----------------
@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    role: Optional[str] = None, # buyer or broker
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    return q.order_by(desc(User.created_at)).all()

@router.post("/users/{user_id}/verify")
def verify_user(
    user_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_verified = not user.is_verified
    db.commit()
    return {"success": True, "user_id": user.id, "is_verified": user.is_verified}
