import json
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_user_optional, require_broker
from app.models.models import Machine, User, ContactUnlock, SystemSetting
from app.services.payment_service import get_effective_machine_fee
from app.schemas.schemas import (
    MachineCreate, MachineUpdate, MachineCard, MachineDetailResponse,
    UnlockedBrokerContact
)

router = APIRouter(prefix="/machines", tags=["Machinery Catalog & Listings"])

CATEGORIES_METADATA = [
    {"name": "CNC Machines", "icon": "Cpu", "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"},
    {"name": "Lathe Machines", "icon": "Disc", "image": "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80"},
    {"name": "Milling Machines", "icon": "Layers", "image": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"},
    {"name": "Drilling Machines", "icon": "Anchor", "image": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"},
    {"name": "Hydraulic Machines", "icon": "Activity", "image": "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=600&q=80"},
    {"name": "Welding Machines", "icon": "Flame", "image": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80"},
    {"name": "Construction Equipment", "icon": "Truck", "image": "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80"},
    {"name": "Agricultural Machinery", "icon": "Wheat", "image": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80"},
    {"name": "Industrial Compressors", "icon": "Wind", "image": "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=600&q=80"},
    {"name": "Generators", "icon": "Zap", "image": "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=600&q=80"},
    {"name": "Heavy Equipment", "icon": "Box", "image": "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80"},
    {"name": "Electrical Machines", "icon": "Cpu", "image": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80"},
    {"name": "Manufacturing Equipment", "icon": "Cog", "image": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80"},
    {"name": "Other Machinery", "icon": "Settings", "image": "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=600&q=80"}
]

@router.get("/categories/summary")
def get_categories_summary(db: Session = Depends(get_db)):
    counts_query = db.query(Machine.category, func.count(Machine.id)).filter(Machine.status == "approved").group_by(Machine.category).all()
    counts_dict = {cat: count for cat, count in counts_query}
    
    result = []
    for cat in CATEGORIES_METADATA:
        name = cat["name"]
        result.append({
            "name": name,
            "icon": cat["icon"],
            "image": cat["image"],
            "count": counts_dict.get(name, 0)
        })
    return result

@router.get("", response_model=Dict[str, Any])
def list_machines(
    q: Optional[str] = Query(None, description="Search query"),
    listing_type: Optional[str] = Query(None, description="new or second_hand"),
    category: Optional[str] = None,
    manufacturer: Optional[str] = None,
    condition: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_year: Optional[int] = None,
    max_year: Optional[int] = None,
    max_hours: Optional[int] = None,
    location: Optional[str] = None,
    is_featured: Optional[bool] = None,
    sort_by: Optional[str] = Query("newest", description="newest, price_asc, price_desc, year_desc, views"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Machine).join(User, Machine.broker_id == User.id).filter(Machine.status == "approved")

    if listing_type:
        query = query.filter(Machine.listing_type == listing_type)
    if category:
        query = query.filter(Machine.category == category)
    if manufacturer:
        query = query.filter(Machine.manufacturer.ilike(f"%{manufacturer}%"))
    if condition:
        query = query.filter(Machine.condition == condition)
    if min_price is not None:
        query = query.filter(Machine.price >= min_price)
    if max_price is not None:
        query = query.filter(Machine.price <= max_price)
    if min_year is not None:
        query = query.filter(Machine.year >= min_year)
    if max_year is not None:
        query = query.filter(Machine.year <= max_year)
    if max_hours is not None:
        query = query.filter(Machine.usage_hours <= max_hours)
    if location:
        query = query.filter(
            or_(
                Machine.city.ilike(f"%{location}%"),
                Machine.state.ilike(f"%{location}%"),
                Machine.country.ilike(f"%{location}%")
            )
        )
    if is_featured is not None:
        query = query.filter(Machine.is_featured == is_featured)

    # Search keyword
    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Machine.title.ilike(term),
                Machine.manufacturer.ilike(term),
                Machine.model.ilike(term),
                Machine.category.ilike(term),
                Machine.city.ilike(term),
                Machine.state.ilike(term),
                Machine.description.ilike(term),
                Machine.specifications.ilike(term)
            )
        )

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(asc(Machine.price))
    elif sort_by == "price_desc":
        query = query.order_by(desc(Machine.price))
    elif sort_by == "year_desc":
        query = query.order_by(desc(Machine.year))
    elif sort_by == "views":
        query = query.order_by(desc(Machine.views_count))
    else:
        query = query.order_by(desc(Machine.created_at))

    total = query.count()
    machines = query.offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for m in machines:
        imgs = []
        try:
            imgs = json.loads(m.images) if m.images else []
        except Exception:
            imgs = []
        primary_img = imgs[0] if (imgs and len(imgs) > 0) else None

        fee = get_effective_machine_fee(db, m)

        items.append(
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

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
        "items": items
    }

@router.get("/{machine_id}", response_model=MachineDetailResponse)
def get_machine_detail(
    machine_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    machine.views_count += 1
    db.commit()

    try:
        specs = json.loads(machine.specifications) if machine.specifications else {}
    except Exception:
        specs = {}

    try:
        images = json.loads(machine.images) if machine.images else []
    except Exception:
        images = []

    fee = get_effective_machine_fee(db, machine)

    # Server-side Contact Protection Authorization Check
    is_unlocked = False
    unlocked_contact_info = None

    if current_user:
        # If caller is the machine's broker OR platform admin:
        if current_user.id == machine.broker_id or current_user.role == "admin":
            is_unlocked = True
        else:
            # Check verified payment unlock record
            unlock_record = db.query(ContactUnlock).filter(
                ContactUnlock.buyer_id == current_user.id,
                ContactUnlock.machine_id == machine.id,
                ContactUnlock.status == "active"
            ).first()
            if unlock_record:
                is_unlocked = True

    broker = machine.broker
    if is_unlocked and broker:
        unlocked_contact_info = UnlockedBrokerContact(
            broker_id=broker.id,
            broker_name=broker.name,
            company=broker.company,
            phone=broker.phone, # Revealed only after verified unlock!
            whatsapp=broker.whatsapp or broker.phone,
            email=broker.email,
            city=machine.city,
            state=machine.state,
            country=machine.country,
            address=machine.address,
            is_verified=broker.is_verified,
            unlocked_at=unlock_record.unlocked_at if 'unlock_record' in locals() and unlock_record else None
        )

    return MachineDetailResponse(
        id=machine.id,
        broker_id=machine.broker_id,
        broker_name=broker.name if broker else "IVPS Verified Broker",
        broker_company=broker.company if broker else None,
        broker_verified=broker.is_verified if broker else True,
        title=machine.title,
        category=machine.category,
        listing_type=machine.listing_type,
        manufacturer=machine.manufacturer,
        model=machine.model,
        year=machine.year,
        condition=machine.condition,
        usage_hours=machine.usage_hours,
        price=machine.price,
        negotiable=machine.negotiable,
        country=machine.country,
        state=machine.state,
        city=machine.city,
        address=machine.address if is_unlocked else None,
        description=machine.description,
        history=machine.history,
        service_history=machine.service_history,
        reason_for_selling=machine.reason_for_selling,
        included_accessories=machine.included_accessories,
        availability=machine.availability,
        specifications=specs,
        images=images,
        status=machine.status,
        is_featured=machine.is_featured,
        views_count=machine.views_count,
        created_at=machine.created_at,
        updated_at=machine.updated_at,
        contact_unlock_fee=fee,
        currency="INR",
        is_contact_unlocked=is_unlocked,
        unlocked_contact=unlocked_contact_info
    )

@router.post("", response_model=MachineDetailResponse)
def create_machine(
    machine_in: MachineCreate,
    current_user: User = Depends(require_broker), # STRICT: Only Brokers (or Admin) can post!
    db: Session = Depends(get_db)
):
    initial_status = "approved" if current_user.role == "admin" else "pending_approval"

    machine = Machine(
        broker_id=current_user.id,
        title=machine_in.title,
        category=machine_in.category,
        listing_type=machine_in.listing_type,
        manufacturer=machine_in.manufacturer,
        model=machine_in.model,
        year=machine_in.year,
        condition=machine_in.condition,
        usage_hours=machine_in.usage_hours,
        price=machine_in.price,
        negotiable=machine_in.negotiable,
        contact_unlock_fee=machine_in.contact_unlock_fee,
        country=machine_in.country,
        state=machine_in.state,
        city=machine_in.city,
        address=machine_in.address,
        description=machine_in.description,
        history=machine_in.history,
        service_history=machine_in.service_history,
        reason_for_selling=machine_in.reason_for_selling,
        included_accessories=machine_in.included_accessories,
        availability=machine_in.availability,
        specifications=json.dumps(machine_in.specifications),
        images=json.dumps(machine_in.images),
        status=initial_status,
        is_featured=False
    )
    db.add(machine)
    db.commit()
    db.refresh(machine)

    return get_machine_detail(machine.id, db, current_user)

@router.put("/{machine_id}", response_model=MachineDetailResponse)
def update_machine(
    machine_id: int,
    machine_in: MachineUpdate,
    current_user: User = Depends(require_broker),
    db: Session = Depends(get_db)
):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    if current_user.role != "admin" and machine.broker_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to edit this listing")

    update_data = machine_in.model_dump(exclude_unset=True)
    if "specifications" in update_data and update_data["specifications"] is not None:
        machine.specifications = json.dumps(update_data.pop("specifications"))
    if "images" in update_data and update_data["images"] is not None:
        machine.images = json.dumps(update_data.pop("images"))

    for field, value in update_data.items():
        setattr(machine, field, value)

    db.commit()
    db.refresh(machine)
    return get_machine_detail(machine.id, db, current_user)

@router.delete("/{machine_id}")
def delete_machine(
    machine_id: int,
    current_user: User = Depends(require_broker),
    db: Session = Depends(get_db)
):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    if current_user.role != "admin" and machine.broker_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this listing")

    db.delete(machine)
    db.commit()
    return {"success": True, "message": "Machine listing successfully deleted"}
