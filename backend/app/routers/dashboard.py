import json
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User, Machine, Payment, ContactUnlock, Enquiry, SavedMachine, SystemSetting
from app.services.payment_service import get_platform_default_fee

router = APIRouter(prefix="/dashboard", tags=["Dashboards"])

@router.get("/summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role = current_user.role

    if role == "admin":
        total_users = db.query(User).count()
        active_brokers = db.query(User).filter(User.role == "broker").count()
        total_buyers = db.query(User).filter(User.role == "buyer").count()
        total_machines = db.query(Machine).count()
        new_machines = db.query(Machine).filter(Machine.listing_type == "new").count()
        used_machines = db.query(Machine).filter(Machine.listing_type == "second_hand").count()
        pending_listings = db.query(Machine).filter(Machine.status == "pending_approval").count()
        approved_listings = db.query(Machine).filter(Machine.status == "approved").count()
        
        # Payment stats
        successful_payments = db.query(Payment).filter(Payment.status == "success").all()
        total_transactions = len(successful_payments)
        total_revenue = sum(p.amount for p in successful_payments)
        default_fee = get_platform_default_fee(db)
        
        recent_machines = db.query(Machine).order_by(desc(Machine.created_at)).limit(5).all()
        recent_items = []
        for m in recent_machines:
            recent_items.append({
                "id": m.id,
                "title": m.title,
                "category": m.category,
                "price": m.price,
                "status": m.status,
                "broker": m.broker.name if m.broker else "Unknown",
                "created_at": m.created_at
            })

        return {
            "role": "admin",
            "stats": {
                "total_users": total_users,
                "active_brokers": active_brokers,
                "total_buyers": total_buyers,
                "total_machines": total_machines,
                "new_machines": new_machines,
                "used_machines": used_machines,
                "pending_listings": pending_listings,
                "approved_listings": approved_listings,
                "total_transactions": total_transactions,
                "unlock_revenue": round(total_revenue, 2),
                "default_fee": default_fee,
                "currency": "INR",
                "currency_symbol": "₹"
            },
            "recent_machines": recent_items
        }

    elif role == "broker":
        my_machines = db.query(Machine).filter(Machine.broker_id == current_user.id).all()
        total_machines = len(my_machines)
        active_listings = sum(1 for m in my_machines if m.status == "approved")
        pending_approval = sum(1 for m in my_machines if m.status == "pending_approval")
        sold_machines = sum(1 for m in my_machines if m.status == "sold")
        total_views = sum(m.views_count for m in my_machines)

        enquiries_received = db.query(Enquiry).filter(Enquiry.broker_id == current_user.id).count()
        
        machine_ids = [m.id for m in my_machines]
        unlocks_count = 0
        unlock_revenue = 0.0
        if machine_ids:
            unlocks = db.query(ContactUnlock).filter(ContactUnlock.machine_id.in_(machine_ids)).all()
            unlocks_count = len(unlocks)
            unlock_revenue = sum(u.amount for u in unlocks)

        machine_items = []
        for m in my_machines:
            imgs = []
            try:
                imgs = json.loads(m.images) if m.images else []
            except Exception:
                imgs = []
            machine_items.append({
                "id": m.id,
                "title": m.title,
                "category": m.category,
                "listing_type": m.listing_type,
                "price": m.price,
                "status": m.status,
                "contact_unlock_fee": m.contact_unlock_fee,
                "views_count": m.views_count,
                "primary_image": imgs[0] if imgs else None,
                "created_at": m.created_at
            })

        return {
            "role": "broker",
            "stats": {
                "total_machines": total_machines,
                "active_listings": active_listings,
                "pending_approval": pending_approval,
                "sold_machines": sold_machines,
                "enquiries_received": enquiries_received,
                "total_views": total_views,
                "contact_unlocks_count": unlocks_count,
                "estimated_unlock_revenue": round(unlock_revenue, 2),
                "currency": "INR",
                "currency_symbol": "₹"
            },
            "machines": machine_items
        }

    else: # buyer
        saved_count = db.query(SavedMachine).filter(SavedMachine.user_id == current_user.id).count()
        enquiries_sent = db.query(Enquiry).filter(Enquiry.buyer_id == current_user.id).count()
        
        unlocks = db.query(ContactUnlock).filter(ContactUnlock.buyer_id == current_user.id, ContactUnlock.status == "active").all()
        unlocked_count = len(unlocks)
        total_spent = sum(u.amount for u in unlocks)

        unlocked_items = []
        for u in unlocks:
            m = u.machine
            if m:
                b = m.broker
                imgs = []
                try:
                    imgs = json.loads(m.images) if m.images else []
                except Exception:
                    imgs = []
                unlocked_items.append({
                    "unlock_id": u.id,
                    "machine_id": m.id,
                    "machine_title": m.title,
                    "machine_image": imgs[0] if imgs else None,
                    "price": m.price,
                    "broker_name": b.name if b else "Verified Broker",
                    "broker_company": b.company if b else "",
                    "broker_phone": b.phone if b else "N/A",
                    "broker_whatsapp": b.whatsapp if b else (b.phone if b else "N/A"),
                    "broker_email": b.email if b else "N/A",
                    "city": m.city,
                    "state": m.state,
                    "unlocked_at": u.unlocked_at
                })

        return {
            "role": "buyer",
            "stats": {
                "saved_machines_count": saved_count,
                "unlocked_contacts_count": unlocked_count,
                "enquiries_sent_count": enquiries_sent,
                "total_spent_on_unlocks": round(total_spent, 2),
                "currency": "INR",
                "currency_symbol": "₹"
            },
            "unlocked_contacts": unlocked_items
        }
