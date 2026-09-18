from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User, Payment, Machine
from app.schemas.schemas import PaymentResponse

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.get("/my-payments", response_model=List[PaymentResponse])
def get_my_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payments = db.query(Payment).filter(Payment.user_id == current_user.id).order_by(Payment.created_at.desc()).all()
    results = []
    for p in payments:
        machine_title = None
        if p.machine_id:
            m = db.query(Machine).filter(Machine.id == p.machine_id).first()
            if m:
                machine_title = m.title
        results.append(
            PaymentResponse(
                id=p.id,
                amount=p.amount,
                currency=p.currency,
                provider=p.provider,
                payment_method=p.payment_method,
                transaction_id=p.transaction_id,
                status=p.status,
                failure_reason=p.failure_reason,
                created_at=p.created_at,
                machine_id=p.machine_id,
                machine_title=machine_title
            )
        )
    return results
