import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User, Machine, Enquiry
from app.schemas.schemas import EnquiryCreate, EnquiryResponse

router = APIRouter(prefix="/enquiries", tags=["Commercial RFQs & Enquiries"])

@router.post("", response_model=EnquiryResponse)
def send_enquiry(
    enquiry_in: EnquiryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    machine = db.query(Machine).filter(Machine.id == enquiry_in.machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    if machine.broker_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send enquiry on your own listing")

    enquiry = Enquiry(
        buyer_id=current_user.id,
        broker_id=machine.broker_id,
        machine_id=machine.id,
        name=enquiry_in.name,
        email=enquiry_in.email,
        phone=enquiry_in.phone or current_user.phone,
        message=enquiry_in.message,
        requirement=enquiry_in.requirement,
        quantity=enquiry_in.quantity,
        preferred_contact_method=enquiry_in.preferred_contact_method,
        status="new"
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)

    imgs = []
    try:
        imgs = json.loads(machine.images) if machine.images else []
    except Exception:
        imgs = []
    primary_image = imgs[0] if imgs else None

    return EnquiryResponse(
        id=enquiry.id,
        buyer_id=enquiry.buyer_id,
        broker_id=enquiry.broker_id,
        machine_id=enquiry.machine_id,
        machine_title=machine.title,
        machine_image=primary_image,
        name=enquiry.name,
        email=enquiry.email,
        phone=enquiry.phone,
        message=enquiry.message,
        requirement=enquiry.requirement,
        quantity=enquiry.quantity,
        preferred_contact_method=enquiry.preferred_contact_method,
        status=enquiry.status,
        created_at=enquiry.created_at
    )

@router.get("/received", response_model=List[EnquiryResponse])
def get_received_enquiries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    enquiries = db.query(Enquiry).filter(Enquiry.broker_id == current_user.id).order_by(Enquiry.created_at.desc()).all()
    results = []
    for eq in enquiries:
        machine = db.query(Machine).filter(Machine.id == eq.machine_id).first()
        primary_image = None
        if machine and machine.images:
            try:
                imgs = json.loads(machine.images)
                primary_image = imgs[0] if imgs else None
            except Exception:
                pass

        results.append(
            EnquiryResponse(
                id=eq.id,
                buyer_id=eq.buyer_id,
                broker_id=eq.broker_id,
                machine_id=eq.machine_id,
                machine_title=machine.title if machine else "Machine Listing",
                machine_image=primary_image,
                name=eq.name,
                email=eq.email,
                phone=eq.phone,
                message=eq.message,
                requirement=eq.requirement,
                quantity=eq.quantity,
                preferred_contact_method=eq.preferred_contact_method,
                status=eq.status,
                created_at=eq.created_at
            )
        )
    return results

@router.get("/sent", response_model=List[EnquiryResponse])
def get_sent_enquiries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    enquiries = db.query(Enquiry).filter(Enquiry.buyer_id == current_user.id).order_by(Enquiry.created_at.desc()).all()
    results = []
    for eq in enquiries:
        machine = db.query(Machine).filter(Machine.id == eq.machine_id).first()
        primary_image = None
        if machine and machine.images:
            try:
                imgs = json.loads(machine.images)
                primary_image = imgs[0] if imgs else None
            except Exception:
                pass

        results.append(
            EnquiryResponse(
                id=eq.id,
                buyer_id=eq.buyer_id,
                broker_id=eq.broker_id,
                machine_id=eq.machine_id,
                machine_title=machine.title if machine else "Machine Listing",
                machine_image=primary_image,
                name=eq.name,
                email=eq.email,
                phone=eq.phone,
                message=eq.message,
                requirement=eq.requirement,
                quantity=eq.quantity,
                preferred_contact_method=eq.preferred_contact_method,
                status=eq.status,
                created_at=eq.created_at
            )
        )
    return results

@router.patch("/{enquiry_id}/status")
def update_enquiry_status(
    enquiry_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id, Enquiry.broker_id == current_user.id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")

    enquiry.status = status
    db.commit()
    return {"success": True, "status": enquiry.status}
