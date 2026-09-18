import json
import os
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import User, Machine, Payment, ContactUnlock, Enquiry, SavedMachine, SystemSetting

def seed():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Initialize Platform Default Contact Unlock Fee
        fee_setting = db.query(SystemSetting).filter(SystemSetting.key == "default_contact_unlock_fee").first()
        if not fee_setting:
            fee_setting = SystemSetting(
                key="default_contact_unlock_fee",
                value="99.0",
                description="Platform default contact unlock fee in INR (₹)"
            )
            db.add(fee_setting)
            db.commit()

        # Check if administrative and broker accounts are already created
        if db.query(User).count() > 0:
            print("Database already contains registered accounts. Skipping re-seed.")
            return

        print("Initializing IVPS Mechatronics operational entities...")

        # 1. Platform Operations Administrator
        admin_user = User(
            name="Rajesh Sharma",
            email="admin@ivpsmechatronics.com",
            phone="+919820011223",
            whatsapp="+919820011223",
            hashed_password=get_password_hash("admin123"),
            company="IVPS Mechatronics Operations",
            role="admin",
            is_verified=True, # Operational root account
            is_active=True
        )
        db.add(admin_user)

        # 2. Registered & Verified Machinery Broker #1
        broker_one = User(
            name="Sunil Patil",
            email="precision.machinery@dealer.com",
            phone="+919820144552",
            whatsapp="+919820144552",
            hashed_password=get_password_hash("broker123"),
            company="Precision Machine Tools Pvt. Ltd.",
            role="broker",
            is_verified=True,
            is_active=True,
            business_description="Authorized industrial equipment broker specializing in CNC machining centers, turning centers, and metal cutting automation across Western India."
        )
        db.add(broker_one)

        # 3. Registered & Verified Machinery Broker #2
        broker_two = User(
            name="Vikramaditya Rao",
            email="apex.brokers@machinery.com",
            phone="+919840277881",
            whatsapp="+919840277881",
            hashed_password=get_password_hash("broker123"),
            company="Apex Heavy Industrial Brokers",
            role="broker",
            is_verified=True,
            is_active=True,
            business_description="Heavy construction, earthmoving, hydraulic press, and power generation broker network serving manufacturing plants nationwide."
        )
        db.add(broker_two)

        db.commit()
        db.refresh(admin_user)
        db.refresh(broker_one)
        db.refresh(broker_two)

        print("Seeding machinery listings under registered brokers...")

        machines_data = [
            {
                "broker_id": broker_one.id,
                "title": "Haas VF-2 Vertical Machining Center 30-Tool",
                "category": "CNC Machines",
                "listing_type": "new",
                "manufacturer": "Haas Automation",
                "model": "VF-2",
                "year": 2024,
                "condition": "Brand New",
                "usage_hours": 0,
                "price": 5480000.0, # ₹54.8 Lakhs
                "negotiable": True,
                "contact_unlock_fee": 99.0, # Default ₹99
                "country": "India",
                "state": "Maharashtra",
                "city": "Pune",
                "address": "Bhosari Industrial Area, Sector 10",
                "description": "Brand new Haas VF-2 Vertical Machining Center. The industry benchmark workhorse featuring high-performance 30+1 side-mount tool changer, 12,000 RPM inline vector drive spindle, high-speed machining software, and chip conveyor. Factory warranty included.",
                "history": "Direct factory allocation with 2-year manufacturer warranty and on-site commissioning.",
                "service_history": "Pre-delivery inspection completed. Zero run hours on spindle.",
                "reason_for_selling": "Commercial broker inventory allocation for immediate delivery.",
                "included_accessories": "Haas Visual Programming System, Renishaw WIPS wireless probe, 4th-axis drive pre-wire, 55-gallon coolant tank.",
                "availability": "In Stock",
                "is_featured": True,
                "specifications": {
                    "X-Axis Travel": "762 mm",
                    "Y-Axis Travel": "406 mm",
                    "Z-Axis Travel": "508 mm",
                    "Spindle Speed": "12,000 RPM",
                    "Spindle Power": "30 HP (22.4 kW)",
                    "Tool Changer": "30+1 Side-Mount",
                    "Table Size": "914 x 356 mm",
                    "Max Table Load": "680 kg",
                    "Voltage": "415 V 3-Phase",
                    "Weight": "3540 kg"
                },
                "images": [
                    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80"
                ]
            },
            {
                "broker_id": broker_two.id,
                "title": "Mazak Integrex i-200H ST 9-Axis Multi-Tasking Center",
                "category": "CNC Machines",
                "listing_type": "second_hand",
                "manufacturer": "Yamazaki Mazak",
                "model": "Integrex i-200H ST",
                "year": 2021,
                "condition": "Excellent",
                "usage_hours": 3120,
                "price": 11500000.0, # ₹1.15 Cr
                "negotiable": True,
                "contact_unlock_fee": 149.0, # Custom fee ₹149
                "country": "India",
                "state": "Gujarat",
                "city": "Ahmedabad",
                "address": "GIDC Industrial Estate, Vatva",
                "description": "High-precision 9-axis multi-tasking CNC machine combining turning center and machining center capabilities with second spindle and lower turret. Ideal for complex aerospace, defense, and high-precision medical parts.",
                "history": "Single aerospace tier-1 supplier owner from new. Always operated in climate-controlled ISO-certified facility.",
                "service_history": "Serviced every 500 hours by certified Mazak engineers. Original maintenance logs available.",
                "reason_for_selling": "Facility upgrading to automated multi-pallet cell.",
                "included_accessories": "SmoothX CNC controller, 72-tool magazine, upper milling spindle 12,000 RPM, lower 12-station turret, dual 8-inch hydraulic chucks.",
                "availability": "Ready to Ship",
                "is_featured": True,
                "specifications": {
                    "Max Machining Diameter": "658 mm",
                    "Max Machining Length": "1011 mm",
                    "Main Spindle Speed": "5,000 RPM",
                    "Second Spindle Speed": "5,000 RPM",
                    "Milling Spindle Speed": "12,000 RPM",
                    "Tool Storage": "72 Tools Capto C6",
                    "Power": "45 kW Connected",
                    "Voltage": "415 V",
                    "Weight": "12,800 kg"
                },
                "images": [
                    "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"
                ]
            },
            {
                "broker_id": broker_one.id,
                "title": "Doosan Puma 2600SY II Sub-Spindle CNC Turning Center",
                "category": "Lathe Machines",
                "listing_type": "second_hand",
                "manufacturer": "Doosan Machine Tools",
                "model": "Puma 2600SY II",
                "year": 2020,
                "condition": "Very Good",
                "usage_hours": 4650,
                "price": 4350000.0, # ₹43.5 Lakhs
                "negotiable": False,
                "contact_unlock_fee": 99.0,
                "country": "India",
                "state": "Tamil Nadu",
                "city": "Coimbatore",
                "address": "SIDCO Industrial Estate",
                "description": "Rigid heavy-duty CNC turning center with Y-axis and sub-spindle for complete single-setup parts manufacturing. Features box guideways on all axes for superior damping and rigidity during heavy roughing cuts.",
                "history": "Used for precision automotive component manufacturing.",
                "service_history": "Regular hydraulic filter replacements and turret alignment check completed 2 months ago.",
                "reason_for_selling": "Production line completed automotive contract.",
                "included_accessories": "Fanuc 0i-TF control, Kitagawa 10-inch chuck on main, 6-inch on sub, 24-station live turret, chip conveyor.",
                "availability": "In Stock",
                "is_featured": False,
                "specifications": {
                    "Max Turning Diameter": "376 mm",
                    "Max Turning Length": "760 mm",
                    "Chuck Size": "10 in (Main) / 6 in (Sub)",
                    "Spindle Motor": "22 kW",
                    "Spindle Speed": "3,500 RPM",
                    "Y-Axis Travel": "+/- 52.5 mm",
                    "Weight": "6,400 kg"
                },
                "images": [
                    "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80"
                ]
            },
            {
                "broker_id": broker_two.id,
                "title": "Caterpillar 320D Hydraulic Crawler Excavator",
                "category": "Construction Equipment",
                "listing_type": "second_hand",
                "manufacturer": "Caterpillar",
                "model": "320D L",
                "year": 2019,
                "condition": "Good",
                "usage_hours": 6200,
                "price": 6250000.0, # ₹62.5 Lakhs
                "negotiable": True,
                "contact_unlock_fee": 99.0,
                "country": "India",
                "state": "Karnataka",
                "city": "Bengaluru",
                "address": "Peenya Industrial Area Stage 3",
                "description": "Reliable heavy earthmoving equipment fitted with Cat C6.4 ACERT diesel engine. Robust undercarriage with 70% track life remaining. Hydraulic system operates at peak pressure with zero cylinder seal leaks.",
                "history": "Operated by certified operator on highway infrastructure and earth cut projects.",
                "service_history": "Complete engine overhaul and turbo inspection at 5,000 hours by Cat dealer.",
                "reason_for_selling": "Fleet renewal for upcoming mining contract.",
                "included_accessories": "1.0 m³ heavy duty rock bucket, quick coupler, rock breaker piping kit, enclosed air-conditioned ROPS cab.",
                "availability": "Ready to Ship",
                "is_featured": True,
                "specifications": {
                    "Operating Weight": "21,800 kg",
                    "Engine Model": "Cat C6.4 ACERT",
                    "Engine Power": "148 HP (110 kW) @ 1800 RPM",
                    "Max Digging Depth": "6.72 m",
                    "Max Reach": "9.86 m",
                    "Bucket Capacity": "1.0 m³"
                },
                "images": [
                    "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80"
                ]
            },
            {
                "broker_id": broker_one.id,
                "title": "Atlas Copco GA 37+ VSD Rotary Screw Air Compressor",
                "category": "Industrial Compressors",
                "listing_type": "new",
                "manufacturer": "Atlas Copco",
                "model": "GA 37+ VSD",
                "year": 2024,
                "condition": "Brand New",
                "usage_hours": 0,
                "price": 2280000.0, # ₹22.8 Lakhs
                "negotiable": False,
                "contact_unlock_fee": 99.0,
                "country": "India",
                "state": "Haryana",
                "city": "Gurugram",
                "address": "Manesar IMT Sector 8",
                "description": "State-of-the-art Variable Speed Drive (VSD) oil-injected rotary screw compressor delivering up to 35% energy savings. Integrated air dryer, Elektronikon Touch controller, and SmartLink 24/7 remote monitoring.",
                "history": "Brand new direct from Atlas Copco distributor with complete warranty and technical documentation.",
                "service_history": "Factory pre-commissioned, zero hours.",
                "reason_for_selling": "Commercial broker distribution.",
                "included_accessories": "Integrated refrigerant air dryer, heavy-duty oil separator, SMARTLINK remote telemetry module.",
                "availability": "In Stock",
                "is_featured": False,
                "specifications": {
                    "Motor Power": "37 kW (50 HP)",
                    "Free Air Delivery (FAD)": "38.5 to 228 CFM",
                    "Working Pressure": "4 to 13 bar",
                    "Noise Level": "67 dB(A)",
                    "Voltage": "415 V / 50 Hz",
                    "Weight": "845 kg"
                },
                "images": [
                    "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
                ]
            },
            {
                "broker_id": broker_two.id,
                "title": "Kirloskar 250 kVA Acoustic Silent Diesel Generator Set",
                "category": "Generators",
                "listing_type": "second_hand",
                "manufacturer": "Kirloskar Oil Engines",
                "model": "KG1-250WS",
                "year": 2022,
                "condition": "Very Good",
                "usage_hours": 1420,
                "price": 1580000.0, # ₹15.8 Lakhs
                "negotiable": True,
                "contact_unlock_fee": 99.0,
                "country": "India",
                "state": "Maharashtra",
                "city": "Thane",
                "address": "Wagle Estate Road No. 16",
                "description": "CPCB-II compliant soundproof diesel generator set powered by 6-cylinder turbocharged Kirloskar engine. Equipped with Stamford alternator and advanced AMF/auto-start microprocessor controller.",
                "history": "Used strictly as standby emergency backup generator for pharmaceutical R&D facility with minimal actual load hours.",
                "service_history": "Serviced on scheduled calendar dates by authorized KOEL service partner. All oil and filters fresh.",
                "reason_for_selling": "Facility connected to dedicated express industrial feeder line.",
                "included_accessories": "Auto Mains Failure (AMF) panel, 500-liter in-base fuel tank, residential exhaust silencer, battery charger.",
                "availability": "Ready to Ship",
                "is_featured": True,
                "specifications": {
                    "Prime Rating": "250 kVA / 200 kWe",
                    "Standby Rating": "275 kVA",
                    "Voltage / Phase": "415 V / 3 Phase",
                    "Engine Speed": "1500 RPM",
                    "Cooling": "Water Cooled with Radiator",
                    "Weight": "3650 kg"
                },
                "images": [
                    "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=1200&q=80"
                ]
            },
            {
                "broker_id": broker_two.id,
                "title": "200-Ton High-Speed Deep Drawing Hydraulic Press",
                "category": "Hydraulic Machines",
                "listing_type": "second_hand",
                "manufacturer": "Schuler / Hindustan Hydraulics",
                "model": "HHP-200-DD",
                "year": 2018,
                "condition": "Excellent",
                "usage_hours": 5800,
                "price": 3400000.0, # ₹34 Lakhs
                "negotiable": True,
                "contact_unlock_fee": 99.0,
                "country": "India",
                "state": "Maharashtra",
                "city": "Nashik",
                "address": "Ambad MIDC Area",
                "description": "Heavy-duty 4-pillar hydraulic press specifically built for deep drawing, stamping, and sheet metal forming. Features hydraulic cushion at bottom with proportional pressure controls and dual safety light curtains.",
                "history": "Operated in stainless steel kitchenware manufacturing facility.",
                "service_history": "Hydraulic seals replaced in 2023, Rexroth proportional valves calibrated.",
                "reason_for_selling": "Consolidating factory lines to Pune central plant.",
                "included_accessories": "Siemens S7 PLC touch screen panel, die clamping brackets, hydraulic die cushion (60 tons), oil chiller unit.",
                "availability": "In Stock",
                "is_featured": False,
                "specifications": {
                    "Nominal Capacity": "200 Tons (2000 kN)",
                    "Hydraulic Cushion Capacity": "60 Tons",
                    "Bed Size": "1200 x 1000 mm",
                    "Slide Stroke": "600 mm",
                    "Motor Power": "30 kW (40 HP)",
                    "Weight": "14,500 kg"
                },
                "images": [
                    "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
                ]
            },
            {
                "broker_id": broker_one.id,
                "title": "DMG Mori DMU 50 3rd Gen 5-Axis Universal Milling Machine",
                "category": "Milling Machines",
                "listing_type": "second_hand",
                "manufacturer": "DMG MORI",
                "model": "DMU 50 (3rd Gen)",
                "year": 2022,
                "condition": "Excellent",
                "usage_hours": 2180,
                "price": 13200000.0, # ₹1.32 Cr
                "negotiable": False,
                "contact_unlock_fee": 199.0, # Custom fee ₹199
                "country": "India",
                "state": "Telangana",
                "city": "Hyderabad",
                "address": "Cherlapally Industrial Estate",
                "description": "5-axis simultaneous machining center with integrated swivel rotary table. High dynamic rigidity, CELOS control on Siemens 840D sl, and 20,000 RPM speedMASTER motor spindle.",
                "history": "Used for prototype tool & die manufacturing in certified aerospace incubator.",
                "service_history": "Full DMG Mori annual service contract maintained. Geometrical accuracy laser test verified.",
                "reason_for_selling": "Company moving towards multi-pallet horizontal machining cell.",
                "included_accessories": "CELOS with 21.5-inch control, 60-pocket tool magazine, Blum laser tool measurement, Renishaw probe.",
                "availability": "Ready to Ship",
                "is_featured": True,
                "specifications": {
                    "X / Y / Z Travel": "650 / 520 / 475 mm",
                    "Table Diameter": "630 x 500 mm",
                    "Max Table Load": "300 kg",
                    "Spindle Speed": "20,000 RPM",
                    "Spindle Power": "35 kW",
                    "Weight": "6,800 kg"
                },
                "images": [
                    "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"
                ]
            },
            {
                "broker_id": broker_one.id,
                "title": "Lincoln Electric Robotic MIG/MAG Welding Automation Cell",
                "category": "Welding Machines",
                "listing_type": "new",
                "manufacturer": "Lincoln Electric",
                "model": "System 44 Robotic Cell",
                "year": 2024,
                "condition": "Brand New",
                "usage_hours": 0,
                "price": 7200000.0, # ₹72 Lakhs
                "negotiable": True,
                "contact_unlock_fee": 99.0,
                "country": "India",
                "state": "Maharashtra",
                "city": "Chakan",
                "address": "Auto Cluster Corridor, Chakan MIDC",
                "description": "Pre-engineered dual-station robotic welding cell featuring Fanuc Arc Mate 100iD robot, Power Wave S500 advanced process welder, and safety interlocked pneumatic operator stations.",
                "history": "Complete factory-certified turnkey robotic cell ready for automotive or structural metal manufacturing.",
                "service_history": "Brand new with full factory installation and 3-day technician training.",
                "reason_for_selling": "Authorized automation distributor demonstration system.",
                "included_accessories": "Fanuc Arc Mate 100iD (6-axis), Lincoln Power Wave S500 power source, torch cleaner station, integrated fume extraction hood.",
                "availability": "In Stock",
                "is_featured": False,
                "specifications": {
                    "Welding Process": "MIG, Pulse MIG, STT, Flux-Cored",
                    "Robot Model": "Fanuc Arc Mate 100iD",
                    "Payload": "12 kg",
                    "Current Range": "5 - 550 A",
                    "Voltage": "415 V 3-Phase"
                },
                "images": [
                    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80"
                ]
            },
            {
                "broker_id": broker_two.id,
                "title": "John Deere 5075E 4WD Industrial Agricultural Tractor",
                "category": "Agricultural Machinery",
                "listing_type": "new",
                "manufacturer": "John Deere",
                "model": "5075E 4WD",
                "year": 2024,
                "condition": "Brand New",
                "usage_hours": 0,
                "price": 1950000.0, # ₹19.5 Lakhs
                "negotiable": False,
                "contact_unlock_fee": 99.0,
                "country": "India",
                "state": "Punjab",
                "city": "Ludhiana",
                "address": "GT Road Industrial Zone",
                "description": "High-torque 75 HP 3-cylinder turbocharged engine tractor equipped with 4WD front axle, dual clutch, power steering, and 12F/12R PowrReverser transmission. Excellent for commercial farming and industrial front-loader attachments.",
                "history": "Brand new unit from regional certified dealership.",
                "service_history": "Pre-delivery service completed.",
                "reason_for_selling": "Commercial broker stock.",
                "included_accessories": "Front ballast weights, rear wheel weights, hydraulic canopy, heavy duty drawbar, auxiliary rear remote valves.",
                "availability": "In Stock",
                "is_featured": False,
                "specifications": {
                    "Engine Power": "75 HP @ 2400 RPM",
                    "PTO Power": "63.7 HP",
                    "Drive": "4 Wheel Drive (4WD)",
                    "Hydraulic Lift Capacity": "2000 kg",
                    "Fuel Tank": "68 Liters",
                    "Weight": "2750 kg"
                },
                "images": [
                    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80"
                ]
            },
            {
                "broker_id": broker_two.id,
                "title": "Heavy Duty Radial Arm Drilling Machine 50mm Capacity",
                "category": "Drilling Machines",
                "listing_type": "second_hand",
                "manufacturer": "Batliboi / HMT",
                "model": "RM-65 Heavy Duty",
                "year": 2017,
                "condition": "Needs Maintenance",
                "usage_hours": 8900,
                "price": 680000.0, # ₹6.8 Lakhs
                "negotiable": True,
                "contact_unlock_fee": 99.0,
                "country": "India",
                "state": "Maharashtra",
                "city": "Kolhapur",
                "address": "Shiroli MIDC",
                "description": "Solid cast iron radial drilling machine with 50mm steel drilling capacity and 1600mm arm length. Mechanical clamping and manual gearbox. Needs minor spindle bearing replacement and motor contactor refresh, priced accordingly.",
                "history": "Used in general machinery fabrication shop for 7 years.",
                "service_history": "Lubrication regularly topped up. Spindle bearing has slight runout (~0.05mm).",
                "reason_for_selling": "Upgrading shop to CNC vertical machining center.",
                "included_accessories": "Box table, drill chuck with arbor, reducing sleeves MT5-MT4-MT3, coolant pump.",
                "availability": "In Stock",
                "is_featured": False,
                "specifications": {
                    "Max Drilling Diameter": "50 mm (Steel)",
                    "Spindle Taper": "MT 5",
                    "Arm Length": "1600 mm",
                    "Speed Range": "16 speeds (25 - 2000 RPM)",
                    "Main Motor": "5.5 HP",
                    "Weight": "4,200 kg"
                },
                "images": [
                    "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80"
                ]
            },
            {
                "broker_id": broker_one.id,
                "title": "Bodor 6kW Fiber Laser Metal Sheet Cutting Machine",
                "category": "Manufacturing Equipment",
                "listing_type": "new",
                "manufacturer": "Bodor Laser",
                "model": "C3-6000W",
                "year": 2024,
                "condition": "Brand New",
                "usage_hours": 0,
                "price": 9500000.0, # ₹95 Lakhs
                "negotiable": True,
                "contact_unlock_fee": 199.0, # Custom fee ₹199
                "country": "India",
                "state": "Maharashtra",
                "city": "Pune",
                "address": "Talawade Software & Hardware Park",
                "description": "High-efficiency fiber laser cutting machine with 3000 x 1500 mm dual exchange shuttle table. Maxion 6000W fiber laser source cuts mild steel up to 25mm and stainless steel up to 16mm with extreme edge squareness.",
                "history": "Brand new unit with 3-year warranty on laser generator.",
                "service_history": "Pre-delivery alignment and optical test completed.",
                "reason_for_selling": "Stock broker inventory.",
                "included_accessories": "Dual shuttle table, BodorPro CNC operating software, S&A water chiller, auto lubrication system.",
                "availability": "In Stock",
                "is_featured": True,
                "specifications": {
                    "Laser Power": "6,000 Watts (6 kW)",
                    "Working Area": "3000 x 1500 mm",
                    "Max Positioning Speed": "140 m/min",
                    "Max Mild Steel Cutting": "25 mm",
                    "Weight": "7,500 kg"
                },
                "images": [
                    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
                ]
            }
        ]

        for m_data in machines_data:
            m = Machine(
                broker_id=m_data["broker_id"],
                title=m_data["title"],
                category=m_data["category"],
                listing_type=m_data["listing_type"],
                manufacturer=m_data["manufacturer"],
                model=m_data["model"],
                year=m_data["year"],
                condition=m_data["condition"],
                usage_hours=m_data["usage_hours"],
                price=m_data["price"],
                negotiable=m_data["negotiable"],
                contact_unlock_fee=m_data.get("contact_unlock_fee"),
                country=m_data["country"],
                state=m_data["state"],
                city=m_data["city"],
                address=m_data["address"],
                description=m_data["description"],
                history=m_data["history"],
                service_history=m_data["service_history"],
                reason_for_selling=m_data["reason_for_selling"],
                included_accessories=m_data["included_accessories"],
                availability=m_data["availability"],
                status="approved",
                is_featured=m_data["is_featured"],
                views_count=182,
                specifications=json.dumps(m_data["specifications"]),
                images=json.dumps(m_data["images"])
            )
            db.add(m)

        db.commit()

        # 1 Pending listing in moderation queue for Admin
        pending_machine = Machine(
            broker_id=broker_two.id,
            title="Sany SY215C Heavy Track Excavator 2021 (Pending Moderation)",
            category="Heavy Equipment",
            listing_type="second_hand",
            manufacturer="Sany Heavy Industry",
            model="SY215C",
            year=2021,
            condition="Very Good",
            usage_hours=3800,
            price=5100000.0, # ₹51 Lakhs
            negotiable=True,
            contact_unlock_fee=99.0,
            country="India",
            state="Maharashtra",
            city="Nagpur",
            address="MIDC Butibori Industrial Area",
            description="High-output 21.5-ton hydraulic excavator submitted by broker for platform listing. Awaiting admin documentation verification.",
            history="Operated in road widening project in central India.",
            specifications=json.dumps({"Weight": "21,500 kg", "Power": "140 HP", "Bucket": "0.93 m³"}),
            images=json.dumps(["https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80"]),
            status="pending_approval",
            is_featured=False
        )
        db.add(pending_machine)
        db.commit()

        print("Database initialized successfully with IVPS Mechatronics machinery catalog!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
