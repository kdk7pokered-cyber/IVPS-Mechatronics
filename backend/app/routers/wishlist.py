import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User, Machine, SavedMachine
from app.schemas.schemas import WishlistToggleRequest, MachineCard
from app.services.payment_service import get_effective_machine_fee

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.get("", response_model=List[MachineCard])
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved_entries = db.query(SavedMachine).filter(SavedMachine.user_id == current_user.id).order_by(SavedMachine.created_at.desc()).all()
    results = []
    for entry in saved_entries:
        m = entry.machine
        if not m:
            continue
        imgs = []
        try:
            imgs = json.loads(m.images) if m.images else []
        except Exception:
            imgs = []
        primary_img = imgs[0] if imgs else None
        fee = get_effective_machine_fee(db, m)

        results.append(
            MachineCard(
                id=m.id,
                title=m.title,
                category=m.category,
                listing_type=m.listing_type,
                manufacturer=m.manufacturer,
                model=m.model,
                year=m.year,
                condition=m.condition,
                usage_hours=m.usage_hours,
                price=m.price,
                negotiable=m.negotiable,
                city=m.city,
                state=m.state,
                country=m.country,
                primary_image=primary_img,
                is_featured=m.is_featured,
                status=m.status,
                broker_id=m.broker.id if m.broker else 0,
                broker_name=m.broker.name if m.broker else "IVPS Verified Broker",
                broker_company=m.broker.company if m.broker else None,
                broker_verified=m.broker.is_verified if m.broker else True,
                contact_unlock_fee=fee,
                views_count=m.views_count,
                created_at=m.created_at
            )
        )
    return results

@router.get("/ids")
def get_wishlist_ids(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved_entries = db.query(SavedMachine.machine_id).filter(SavedMachine.user_id == current_user.id).all()
    return [item[0] for item in saved_entries]

@router.post("/toggle")
def toggle_wishlist(
    req: WishlistToggleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    machine = db.query(Machine).filter(Machine.id == req.machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    existing = db.query(SavedMachine).filter(
        SavedMachine.user_id == current_user.id,
        SavedMachine.machine_id == req.machine_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False, "machine_id": req.machine_id}
    else:
        new_save = SavedMachine(user_id=current_user.id, machine_id=req.machine_id)
        db.add(new_save)
        db.commit()
        return {"saved": True, "machine_id": req.machine_id}
