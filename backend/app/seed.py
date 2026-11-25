"""
Database Seed Script for CIVIC-सेवा
Creates demo data: users, departments, complaints across India
All records labeled as DEMO DATA
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models
from app.auth import get_password_hash
from datetime import datetime, timedelta, timezone
import random

DEMO_COMPLAINTS = [
    # Maharashtra - Mumbai
    {"title": "Large pothole on SV Road Bandra", "desc": "There is a massive pothole on SV Road near Bandra station causing accidents daily. Two-wheelers have already been injured.", "cat": "road_pothole", "state": "Maharashtra", "district": "Mumbai", "city": "Mumbai", "lat": 19.0596, "lng": 72.8295, "priority": "critical", "status": "submitted"},
    {"title": "Garbage not collected in Andheri West", "desc": "Garbage has not been collected for 10 days in Andheri West sector 4. Foul smell spreading, health hazard.", "cat": "garbage_sanitation", "state": "Maharashtra", "district": "Mumbai", "city": "Mumbai", "lat": 19.1136, "lng": 72.8697, "priority": "high", "status": "in_progress"},
    {"title": "Water supply contaminated in Thane", "desc": "Contaminated water supply in Thane West area. Brown colored water from taps. Many residents falling sick.", "cat": "water_supply", "state": "Maharashtra", "district": "Thane", "city": "Thane", "lat": 19.2183, "lng": 72.9781, "priority": "critical", "status": "escalated"},
    {"title": "Broken streetlight in Pune Kothrud", "desc": "5 streetlights not working in Kothrud sector 12 for 3 weeks. Area very dark at night, crime risk.", "cat": "electricity_streetlight", "state": "Maharashtra", "district": "Pune", "city": "Pune", "lat": 18.5074, "lng": 73.8077, "priority": "medium", "status": "pending"},
    {"title": "Open drain overflowing in Nashik", "desc": "Open drain overflowing near Nashik market area causing sewage to spill onto road. Severe smell.", "cat": "drainage_sewage", "state": "Maharashtra", "district": "Nashik", "city": "Nashik", "lat": 20.0059, "lng": 73.7898, "priority": "high", "status": "in_progress"},
    # Delhi
    {"title": "Road completely damaged in Rohini", "desc": "Rohini Sector 8 main road is in terrible condition with multiple deep potholes. School bus stuck daily.", "cat": "road_pothole", "state": "Delhi", "district": "North West Delhi", "city": "Delhi", "lat": 28.7167, "lng": 77.1167, "priority": "critical", "status": "submitted"},
    {"title": "Illegal dumping near Dwarka park", "desc": "Construction waste being illegally dumped near children's park in Dwarka Sector 10.", "cat": "garbage_sanitation", "state": "Delhi", "district": "South West Delhi", "city": "Delhi", "lat": 28.5921, "lng": 77.0460, "priority": "high", "status": "pending"},
    {"title": "Water pipeline burst in Lajpat Nagar", "desc": "Major water pipeline burst on main road in Lajpat Nagar. Water flooding road for 2 days.", "cat": "water_supply", "state": "Delhi", "district": "South Delhi", "city": "Delhi", "lat": 28.5706, "lng": 77.2353, "priority": "critical", "status": "in_progress"},
    {"title": "Exposed electric wire in East Delhi", "desc": "Dangerous exposed electric wire hanging low on road in Preet Vihar. Very dangerous for pedestrians.", "cat": "electricity_streetlight", "state": "Delhi", "district": "East Delhi", "city": "Delhi", "lat": 28.6442, "lng": 77.3012, "priority": "critical", "status": "submitted"},
    {"title": "Manhole cover missing in Saket", "desc": "Manhole cover missing on main road in Saket, Delhi. Fall risk for pedestrians especially at night.", "cat": "drainage_sewage", "state": "Delhi", "district": "South Delhi", "city": "Delhi", "lat": 28.5245, "lng": 77.2066, "priority": "high", "status": "resolved"},
    # Karnataka - Bangalore
    {"title": "Pothole on Outer Ring Road Bangalore", "desc": "Very deep pothole on ORR near Marathahalli junction causing accidents. 3 vehicles damaged this week.", "cat": "road_pothole", "state": "Karnataka", "district": "Bengaluru Urban", "city": "Bangalore", "lat": 12.9591, "lng": 77.6974, "priority": "critical", "status": "escalated"},
    {"title": "Stray dogs menace in HSR Layout", "desc": "Pack of stray dogs attacking pedestrians in HSR Layout Sector 2 every evening. Very dangerous.", "cat": "public_infrastructure", "state": "Karnataka", "district": "Bengaluru Urban", "city": "Bangalore", "lat": 12.9121, "lng": 77.6446, "priority": "high", "status": "pending"},
    {"title": "Water shortage in Whitefield", "desc": "No piped water supply in Whitefield area for 5 days. Residents depending on expensive tankers.", "cat": "water_supply", "state": "Karnataka", "district": "Bengaluru Urban", "city": "Bangalore", "lat": 12.9698, "lng": 77.7499, "priority": "high", "status": "in_progress"},
    {"title": "Garbage pile near Koramangala lake", "desc": "Huge garbage pile near Koramangala lake causing mosquito breeding and pollution.", "cat": "garbage_sanitation", "state": "Karnataka", "district": "Bengaluru Urban", "city": "Bangalore", "lat": 12.9279, "lng": 77.6271, "priority": "medium", "status": "submitted"},
    {"title": "Blocked storm drain causing flood in Indiranagar", "desc": "Storm drain completely blocked in Indiranagar 100ft road. Last rain caused severe flooding.", "cat": "drainage_sewage", "state": "Karnataka", "district": "Bengaluru Urban", "city": "Bangalore", "lat": 12.9784, "lng": 77.6408, "priority": "high", "status": "resolved"},
    # Tamil Nadu - Chennai
    {"title": "Road flooded every rain in Velachery", "desc": "Velachery main road gets flooded with every rain due to poor drainage. Business and homes affected.", "cat": "drainage_sewage", "state": "Tamil Nadu", "district": "Chennai", "city": "Chennai", "lat": 12.9815, "lng": 80.2180, "priority": "high", "status": "in_progress"},
    {"title": "Broken streetlights in Anna Nagar", "desc": "15 streetlights not working in Anna Nagar West for over a month. Night crime incidents increasing.", "cat": "electricity_streetlight", "state": "Tamil Nadu", "district": "Chennai", "city": "Chennai", "lat": 13.0850, "lng": 80.2101, "priority": "medium", "status": "pending"},
    {"title": "Garbage collection stopped in Tambaram", "desc": "BBMP garbage collection stopped in Tambaram area. Waste piling up for 2 weeks.", "cat": "garbage_sanitation", "state": "Tamil Nadu", "district": "Chengalpattu", "city": "Tambaram", "lat": 12.9249, "lng": 80.1000, "priority": "high", "status": "submitted"},
    # Telangana - Hyderabad
    {"title": "Road cave-in in Hitech City", "desc": "Road has caved in near Hitech City Madhapur. Big pit formed. Very dangerous for traffic.", "cat": "road_pothole", "state": "Telangana", "district": "Hyderabad", "city": "Hyderabad", "lat": 17.4474, "lng": 78.3762, "priority": "critical", "status": "submitted"},
    {"title": "Water contamination in Secunderabad", "desc": "Sewage mixing with drinking water in Secunderabad East. Many families sick with stomach infections.", "cat": "water_supply", "state": "Telangana", "district": "Hyderabad", "city": "Secunderabad", "lat": 17.4399, "lng": 78.4983, "priority": "critical", "status": "escalated"},
    {"title": "Public toilet broken in Charminar area", "desc": "Only public toilet near Charminar market completely broken and unusable. Huge inconvenience.", "cat": "public_infrastructure", "state": "Telangana", "district": "Hyderabad", "city": "Hyderabad", "lat": 17.3616, "lng": 78.4747, "priority": "medium", "status": "pending"},
    # Gujarat - Ahmedabad
    {"title": "Pothole causing accident near ISCON", "desc": "Deep pothole near ISCON crossroads Ahmedabad. 2 accidents reported this week. Urgent repair needed.", "cat": "road_pothole", "state": "Gujarat", "district": "Ahmedabad", "city": "Ahmedabad", "lat": 23.0409, "lng": 72.5050, "priority": "critical", "status": "in_progress"},
    {"title": "No electricity for 3 days in Vastral", "desc": "Transformer damaged in Vastral area. 3000 families without electricity for 3 days in summer heat.", "cat": "electricity_streetlight", "state": "Gujarat", "district": "Ahmedabad", "city": "Ahmedabad", "lat": 22.9956, "lng": 72.6554, "priority": "critical", "status": "escalated"},
    {"title": "Sewage overflow in Surat SURAT", "desc": "Sewage overflowing on main road in Surat Adajan area. Health emergency situation.", "cat": "drainage_sewage", "state": "Gujarat", "district": "Surat", "city": "Surat", "lat": 21.1702, "lng": 72.8311, "priority": "high", "status": "submitted"},
    # Rajasthan - Jaipur
    {"title": "Road repair needed in Pink City area", "desc": "Multiple potholes on road near Hawa Mahal area in Jaipur causing traffic jams and accidents.", "cat": "road_pothole", "state": "Rajasthan", "district": "Jaipur", "city": "Jaipur", "lat": 26.9240, "lng": 75.8267, "priority": "medium", "status": "pending"},
    {"title": "Water supply erratic in Mansarovar", "desc": "Water supply very irregular in Mansarovar Jaipur. Coming only 2 days a week. Need resolution.", "cat": "water_supply", "state": "Rajasthan", "district": "Jaipur", "city": "Jaipur", "lat": 26.8544, "lng": 75.7421, "priority": "medium", "status": "in_progress"},
    # Uttar Pradesh - Lucknow
    {"title": "Road completely broken after monsoon Lucknow", "desc": "Gomti Nagar road completely destroyed after monsoon. Deep craters everywhere. Dangerous.", "cat": "road_pothole", "state": "Uttar Pradesh", "district": "Lucknow", "city": "Lucknow", "lat": 26.8467, "lng": 81.0012, "priority": "high", "status": "submitted"},
    {"title": "Sewage pipe broken in Hazratganj", "desc": "Main sewage pipe broken in Hazratganj causing sewage water to flow on road near market.", "cat": "drainage_sewage", "state": "Uttar Pradesh", "district": "Lucknow", "city": "Lucknow", "lat": 26.8558, "lng": 80.9472, "priority": "high", "status": "in_progress"},
    {"title": "Garbage dump near school in Kanpur", "desc": "Illegal garbage dump created near primary school in Kanpur causing health risk to children.", "cat": "garbage_sanitation", "state": "Uttar Pradesh", "district": "Kanpur", "city": "Kanpur", "lat": 26.4499, "lng": 80.3319, "priority": "high", "status": "pending"},
    # West Bengal - Kolkata
    {"title": "Broken road in Salt Lake Sector V", "desc": "Salt Lake Sector V main IT park road full of potholes. Thousands of IT employees affected daily.", "cat": "road_pothole", "state": "West Bengal", "district": "North 24 Parganas", "city": "Kolkata", "lat": 22.5744, "lng": 88.4342, "priority": "high", "status": "submitted"},
    {"title": "Drainage overflow in Howrah", "desc": "Severe drainage overflow on Howrah main road. Sewage mixed with rainwater on road causing disease.", "cat": "drainage_sewage", "state": "West Bengal", "district": "Howrah", "city": "Howrah", "lat": 22.5958, "lng": 88.2636, "priority": "critical", "status": "escalated"},
    # Punjab - Amritsar
    {"title": "Broken roads near Golden Temple area", "desc": "Roads near Golden Temple in poor condition causing difficulty for pilgrims and tourists.", "cat": "road_pothole", "state": "Punjab", "district": "Amritsar", "city": "Amritsar", "lat": 31.6340, "lng": 74.8723, "priority": "medium", "status": "in_progress"},
    {"title": "Electricity fluctuation in Ludhiana", "desc": "Constant voltage fluctuation in Ludhiana Model Town damaging expensive appliances of residents.", "cat": "electricity_streetlight", "state": "Punjab", "district": "Ludhiana", "city": "Ludhiana", "lat": 30.9010, "lng": 75.8573, "priority": "medium", "status": "pending"},
    # Madhya Pradesh - Indore
    {"title": "Pothole on AB Road Indore", "desc": "Large pothole on AB Road near Vijay Nagar crossroads causing severe traffic issues.", "cat": "road_pothole", "state": "Madhya Pradesh", "district": "Indore", "city": "Indore", "lat": 22.7196, "lng": 75.8577, "priority": "high", "status": "resolved"},
    {"title": "Water shortage in Bhopal Arera Colony", "desc": "No water supply in Arera Colony Bhopal for 4 days. 500+ families affected.", "cat": "water_supply", "state": "Madhya Pradesh", "district": "Bhopal", "city": "Bhopal", "lat": 23.2332, "lng": 77.4347, "priority": "high", "status": "in_progress"},
    # Kerala - Kochi
    {"title": "Flood water stagnating in Kochi", "desc": "Flood water stagnating in Ernakulam North areas due to blocked drains. Mosquito breeding.", "cat": "drainage_sewage", "state": "Kerala", "district": "Ernakulam", "city": "Kochi", "lat": 9.9312, "lng": 76.2673, "priority": "high", "status": "submitted"},
    {"title": "Street dog attacks in Thiruvananthapuram", "desc": "Stray dog attacks increasing near school in Thiruvananthapuram. 3 children bitten this month.", "cat": "public_infrastructure", "state": "Kerala", "district": "Thiruvananthapuram", "city": "Thiruvananthapuram", "lat": 8.5241, "lng": 76.9366, "priority": "critical", "status": "submitted"},
    # Haryana - Gurugram
    {"title": "Severe pothole problem on NH48 Gurugram", "desc": "NH48 near Gurugram has extremely bad road conditions with deep potholes causing major accidents.", "cat": "road_pothole", "state": "Haryana", "district": "Gurugram", "city": "Gurugram", "lat": 28.4595, "lng": 77.0266, "priority": "critical", "status": "escalated"},
    {"title": "Water contamination in Faridabad", "desc": "Water supply highly contaminated in Faridabad NIT area. Yellow water from taps.", "cat": "water_supply", "state": "Haryana", "district": "Faridabad", "city": "Faridabad", "lat": 28.4089, "lng": 77.3178, "priority": "critical", "status": "submitted"},
    # Bihar - Patna
    {"title": "Broken roads in Patna City area", "desc": "Patna City old area roads in extremely bad condition. Ambulances unable to reach emergencies.", "cat": "road_pothole", "state": "Bihar", "district": "Patna", "city": "Patna", "lat": 25.5941, "lng": 85.1376, "priority": "critical", "status": "submitted"},
    {"title": "No electricity in Muzaffarpur for 8 hours daily", "desc": "Load shedding in Muzaffarpur going to 8 hours a day. Unbearable in summer heat.", "cat": "electricity_streetlight", "state": "Bihar", "district": "Muzaffarpur", "city": "Muzaffarpur", "lat": 26.1209, "lng": 85.3647, "priority": "high", "status": "pending"},
    # Assam - Guwahati
    {"title": "Road collapsed in Guwahati after rain", "desc": "Part of road near Dispur area has collapsed after heavy rain. Major traffic disruption.", "cat": "road_pothole", "state": "Assam", "district": "Kamrup Metropolitan", "city": "Guwahati", "lat": 26.1445, "lng": 91.7362, "priority": "high", "status": "submitted"},
    # Odisha - Bhubaneswar
    {"title": "Drainage block causing flooding in Bhubaneswar", "desc": "Major drain blocked in Nayapalli area Bhubaneswar causing street flooding every rain.", "cat": "drainage_sewage", "state": "Odisha", "district": "Khordha", "city": "Bhubaneswar", "lat": 20.2961, "lng": 85.8245, "priority": "medium", "status": "in_progress"},
    # Chhattisgarh - Raipur
    {"title": "Garbage pile near Raipur central market", "desc": "Garbage collection stopped near central market Raipur. Huge pile creating health hazard.", "cat": "garbage_sanitation", "state": "Chhattisgarh", "district": "Raipur", "city": "Raipur", "lat": 21.2514, "lng": 81.6296, "priority": "medium", "status": "pending"},
    # Jharkhand - Ranchi
    {"title": "Street lights not working in Ranchi", "desc": "Major roads in Ranchi city without working street lights for weeks. Night accidents increasing.", "cat": "electricity_streetlight", "state": "Jharkhand", "district": "Ranchi", "city": "Ranchi", "lat": 23.3441, "lng": 85.3096, "priority": "medium", "status": "submitted"},
    # Uttarakhand - Dehradun
    {"title": "Road damage near Dehradun market", "desc": "Central road near Paltan Bazaar Dehradun in very bad shape. Emergency repair needed.", "cat": "road_pothole", "state": "Uttarakhand", "district": "Dehradun", "city": "Dehradun", "lat": 30.3165, "lng": 78.0322, "priority": "medium", "status": "pending"},
    # Himachal Pradesh - Shimla
    {"title": "Water supply problem in Shimla upper areas", "desc": "Water supply completely stopped in Upper Shimla area. Tourism also affected.", "cat": "water_supply", "state": "Himachal Pradesh", "district": "Shimla", "city": "Shimla", "lat": 31.1048, "lng": 77.1734, "priority": "high", "status": "in_progress"},
    # Additional duplicates for testing
    {"title": "Pothole on SV Road near Bandra", "desc": "Another report of pothole on SV Road Bandra. Very dangerous for cyclists and bikes.", "cat": "road_pothole", "state": "Maharashtra", "district": "Mumbai", "city": "Mumbai", "lat": 19.0599, "lng": 72.8290, "priority": "high", "status": "submitted"},
    {"title": "Garbage accumulation Andheri West again", "desc": "Garbage still not collected in Andheri West. Same location as before. Duplicate issue.", "cat": "garbage_sanitation", "state": "Maharashtra", "district": "Mumbai", "city": "Mumbai", "lat": 19.1140, "lng": 72.8700, "priority": "medium", "status": "submitted"},
    {"title": "Water pipe leakage Ring Road Bangalore", "desc": "Water pipe burst on Outer Ring Road near Marathahalli causing heavy water wastage.", "cat": "water_supply", "state": "Karnataka", "district": "Bengaluru Urban", "city": "Bangalore", "lat": 12.9594, "lng": 77.6970, "priority": "high", "status": "submitted"},
]


def seed_database():
    """Seed the database with demo data"""
    db: Session = SessionLocal()
    try:
        # Check if already seeded
        if db.query(models.User).count() > 0:
            db.close()
            return

        print("🌱 Seeding CIVIC-सेवा database with demo data...")

        # ── 1. Departments ──
        departments_data = [
            {"name": "Road Maintenance", "code": "ROAD", "description": "Handles road repair, potholes and infrastructure"},
            {"name": "Sanitation", "code": "SANIT", "description": "Garbage collection and cleanliness management"},
            {"name": "Water Supply", "code": "WATER", "description": "Drinking water distribution and pipe maintenance"},
            {"name": "Drainage", "code": "DRAIN", "description": "Drainage system and sewage management"},
            {"name": "Electricity", "code": "ELEC", "description": "Street lighting and electricity distribution"},
            {"name": "Public Infrastructure", "code": "INFRA", "description": "Parks, public buildings and civic facilities"},
            {"name": "Administration", "code": "ADMIN", "description": "General administration and coordination"},
        ]
        depts = {}
        for d_data in departments_data:
            dept = models.Department(**d_data)
            db.add(dept)
            db.flush()
            depts[d_data["code"]] = dept

        # ── 2. Users ──
        # Admin
        admin = models.User(
            full_name="Admin Civic Seva",
            email="admin@civicseva.in",
            phone="9000000001",
            hashed_password=get_password_hash("Admin@123"),
            role=models.UserRole.admin,
            state="Maharashtra",
            city="Mumbai",
        )
        db.add(admin)

        # Department officers
        dept_user_map = {}
        dept_officer_data = [
            ("Road Officer", "road@civicseva.in", "ROAD", "Maharashtra", "Mumbai"),
            ("Sanitation Officer", "sanitation@civicseva.in", "SANIT", "Karnataka", "Bangalore"),
            ("Water Officer", "water@civicseva.in", "WATER", "Tamil Nadu", "Chennai"),
            ("Drainage Officer", "drainage@civicseva.in", "DRAIN", "Delhi", "Delhi"),
            ("Electricity Officer", "electricity@civicseva.in", "ELEC", "Gujarat", "Ahmedabad"),
        ]
        for name, email, dept_code, state, city in dept_officer_data:
            u = models.User(
                full_name=name,
                email=email,
                phone="900000000" + str(len(dept_user_map) + 2),
                hashed_password=get_password_hash("Dept@123"),
                role=models.UserRole.department,
                department_id=depts[dept_code].id,
                state=state,
                city=city,
            )
            db.add(u)
            dept_user_map[dept_code] = u

        # Demo citizens
        citizen_names = [
            ("Priya Sharma", "priya@example.com", "9811111111", "Maharashtra", "Mumbai"),
            ("Amit Kumar", "amit@example.com", "9811111112", "Delhi", "Delhi"),
            ("Meera Reddy", "meera@example.com", "9811111113", "Karnataka", "Bangalore"),
            ("Rahul Verma", "rahul@example.com", "9811111114", "Tamil Nadu", "Chennai"),
            ("Sunita Patel", "sunita@example.com", "9811111115", "Gujarat", "Ahmedabad"),
        ]
        citizens = []
        for name, email, phone, state, city in citizen_names:
            c = models.User(
                full_name=name,
                email=email,
                phone=phone,
                hashed_password=get_password_hash("Citizen@123"),
                role=models.UserRole.citizen,
                state=state,
                city=city,
            )
            db.add(c)
            citizens.append(c)

        db.flush()

        # ── 3. Indian States ──
        states_data = [
            ("Andhra Pradesh", "AP", False, 15.9129, 79.7400),
            ("Arunachal Pradesh", "AR", False, 28.2180, 94.7278),
            ("Assam", "AS", False, 26.2006, 92.9376),
            ("Bihar", "BR", False, 25.0961, 85.3131),
            ("Chhattisgarh", "CG", False, 21.2787, 81.8661),
            ("Goa", "GA", False, 15.2993, 74.1240),
            ("Gujarat", "GJ", False, 22.2587, 71.1924),
            ("Haryana", "HR", False, 29.0588, 76.0856),
            ("Himachal Pradesh", "HP", False, 31.1048, 77.1734),
            ("Jharkhand", "JH", False, 23.6102, 85.2799),
            ("Karnataka", "KA", False, 15.3173, 75.7139),
            ("Kerala", "KL", False, 10.8505, 76.2711),
            ("Madhya Pradesh", "MP", False, 22.9734, 78.6569),
            ("Maharashtra", "MH", False, 19.7515, 75.7139),
            ("Manipur", "MN", False, 24.6637, 93.9063),
            ("Meghalaya", "ML", False, 25.4670, 91.3662),
            ("Mizoram", "MZ", False, 23.1645, 92.9376),
            ("Nagaland", "NL", False, 26.1584, 94.5624),
            ("Odisha", "OD", False, 20.9517, 85.0985),
            ("Punjab", "PB", False, 31.1471, 75.3412),
            ("Rajasthan", "RJ", False, 27.0238, 74.2179),
            ("Sikkim", "SK", False, 27.5330, 88.5122),
            ("Tamil Nadu", "TN", False, 11.1271, 78.6569),
            ("Telangana", "TS", False, 18.1124, 79.0193),
            ("Tripura", "TR", False, 23.9408, 91.9882),
            ("Uttar Pradesh", "UP", False, 26.8467, 80.9462),
            ("Uttarakhand", "UK", False, 30.0668, 79.0193),
            ("West Bengal", "WB", False, 22.9868, 87.8550),
            ("Andaman and Nicobar Islands", "AN", True, 11.7401, 92.6586),
            ("Chandigarh", "CH", True, 30.7333, 76.7794),
            ("Delhi", "DL", True, 28.7041, 77.1025),
            ("Jammu and Kashmir", "JK", True, 33.7782, 76.5762),
            ("Ladakh", "LA", True, 34.1526, 77.5771),
            ("Lakshadweep", "LD", True, 10.5667, 72.6417),
            ("Puducherry", "PY", True, 11.9416, 79.8083),
        ]
        state_obj_map = {}
        for name, code, is_ut, lat, lng in states_data:
            s = models.IndianState(name=name, code=code, is_union_territory=is_ut, latitude=lat, longitude=lng)
            db.add(s)
            state_obj_map[name] = s

        db.flush()

        # Sample districts for major states
        districts_data = {
            "Maharashtra": [("Mumbai", 19.0760, 72.8777), ("Pune", 18.5204, 73.8567), ("Nashik", 20.0059, 73.7898), ("Thane", 19.2183, 72.9781), ("Nagpur", 21.1458, 79.0882)],
            "Delhi": [("Central Delhi", 28.6517, 77.2219), ("South Delhi", 28.5245, 77.2066), ("North West Delhi", 28.7167, 77.1167), ("East Delhi", 28.6442, 77.3012), ("South West Delhi", 28.5921, 77.0460)],
            "Karnataka": [("Bengaluru Urban", 12.9716, 77.5946), ("Mysuru", 12.2958, 76.6394), ("Mangaluru", 12.9141, 74.8560)],
            "Tamil Nadu": [("Chennai", 13.0827, 80.2707), ("Coimbatore", 11.0168, 76.9558), ("Chengalpattu", 12.6921, 80.0073)],
            "Telangana": [("Hyderabad", 17.3850, 78.4867), ("Rangareddy", 17.2403, 78.0294)],
            "Gujarat": [("Ahmedabad", 23.0225, 72.5714), ("Surat", 21.1702, 72.8311), ("Vadodara", 22.3072, 73.1812)],
            "Uttar Pradesh": [("Lucknow", 26.8467, 80.9462), ("Kanpur", 26.4499, 80.3319), ("Agra", 27.1767, 78.0081)],
            "West Bengal": [("Kolkata", 22.5726, 88.3639), ("North 24 Parganas", 22.8541, 88.3900), ("Howrah", 22.5958, 88.2636)],
            "Rajasthan": [("Jaipur", 26.9124, 75.7873), ("Jodhpur", 26.2389, 73.0243)],
            "Madhya Pradesh": [("Indore", 22.7196, 75.8577), ("Bhopal", 23.2599, 77.4126)],
            "Punjab": [("Amritsar", 31.6340, 74.8723), ("Ludhiana", 30.9010, 75.8573)],
            "Haryana": [("Gurugram", 28.4595, 77.0266), ("Faridabad", 28.4089, 77.3178)],
            "Bihar": [("Patna", 25.5941, 85.1376), ("Muzaffarpur", 26.1209, 85.3647)],
            "Assam": [("Kamrup Metropolitan", 26.1445, 91.7362)],
            "Odisha": [("Khordha", 20.2961, 85.8245)],
            "Chhattisgarh": [("Raipur", 21.2514, 81.6296)],
            "Jharkhand": [("Ranchi", 23.3441, 85.3096)],
            "Uttarakhand": [("Dehradun", 30.3165, 78.0322)],
            "Himachal Pradesh": [("Shimla", 31.1048, 77.1734)],
            "Kerala": [("Ernakulam", 9.9312, 76.2673), ("Thiruvananthapuram", 8.5241, 76.9366)],
        }

        district_obj_map = {}
        for state_name, dist_list in districts_data.items():
            state_obj = state_obj_map.get(state_name)
            if not state_obj:
                continue
            for d_name, lat, lng in dist_list:
                d = models.District(name=d_name, state_id=state_obj.id, latitude=lat, longitude=lng)
                db.add(d)
                district_obj_map[d_name] = d

        db.flush()

        # Sample cities for key districts
        cities_data = {
            "Mumbai": [("Mumbai", "municipal_corporation", 19.0760, 72.8777)],
            "Pune": [("Pune", "municipal_corporation", 18.5204, 73.8567)],
            "Nashik": [("Nashik", "municipal_corporation", 20.0059, 73.7898)],
            "Thane": [("Thane", "municipal_corporation", 19.2183, 72.9781)],
            "Central Delhi": [("Delhi", "municipal_corporation", 28.6517, 77.2219)],
            "Bengaluru Urban": [("Bangalore", "municipal_corporation", 12.9716, 77.5946)],
            "Chennai": [("Chennai", "municipal_corporation", 13.0827, 80.2707)],
            "Chengalpattu": [("Tambaram", "municipality", 12.9249, 80.1000)],
            "Hyderabad": [("Hyderabad", "municipal_corporation", 17.3850, 78.4867), ("Secunderabad", "municipality", 17.4399, 78.4983)],
            "Ahmedabad": [("Ahmedabad", "municipal_corporation", 23.0225, 72.5714)],
            "Surat": [("Surat", "municipal_corporation", 21.1702, 72.8311)],
            "Lucknow": [("Lucknow", "municipal_corporation", 26.8467, 80.9462)],
            "Kanpur": [("Kanpur", "municipal_corporation", 26.4499, 80.3319)],
            "Kolkata": [("Kolkata", "municipal_corporation", 22.5726, 88.3639)],
            "Howrah": [("Howrah", "municipal_corporation", 22.5958, 88.2636)],
            "Jaipur": [("Jaipur", "municipal_corporation", 26.9124, 75.7873)],
            "Indore": [("Indore", "municipal_corporation", 22.7196, 75.8577)],
            "Bhopal": [("Bhopal", "municipal_corporation", 23.2599, 77.4126)],
            "Amritsar": [("Amritsar", "municipal_corporation", 31.6340, 74.8723)],
            "Ludhiana": [("Ludhiana", "municipal_corporation", 30.9010, 75.8573)],
            "Gurugram": [("Gurugram", "municipal_corporation", 28.4595, 77.0266)],
            "Faridabad": [("Faridabad", "municipal_corporation", 28.4089, 77.3178)],
            "Patna": [("Patna", "municipal_corporation", 25.5941, 85.1376)],
            "Muzaffarpur": [("Muzaffarpur", "municipality", 26.1209, 85.3647)],
            "Kamrup Metropolitan": [("Guwahati", "municipal_corporation", 26.1445, 91.7362)],
            "Khordha": [("Bhubaneswar", "municipal_corporation", 20.2961, 85.8245)],
            "Raipur": [("Raipur", "municipal_corporation", 21.2514, 81.6296)],
            "Ranchi": [("Ranchi", "municipal_corporation", 23.3441, 85.3096)],
            "Dehradun": [("Dehradun", "municipal_corporation", 30.3165, 78.0322)],
            "Shimla": [("Shimla", "municipality", 31.1048, 77.1734)],
            "Ernakulam": [("Kochi", "municipal_corporation", 9.9312, 76.2673)],
            "Thiruvananthapuram": [("Thiruvananthapuram", "municipal_corporation", 8.5241, 76.9366)],
        }
        for dist_name, city_list in cities_data.items():
            dist_obj = district_obj_map.get(dist_name)
            if not dist_obj:
                continue
            for c_name, c_type, lat, lng in city_list:
                city = models.City(name=c_name, district_id=dist_obj.id, city_type=c_type, latitude=lat, longitude=lng)
                db.add(city)

        db.flush()

        # ── 4. Complaints ──
        from app.services.ai_categorizer import categorize_complaint
        from app.services.severity import calculate_severity
        from app.routers.complaints import generate_complaint_id, PRIORITY_DEADLINES

        CATEGORY_DEPT_CODE = {
            "road_pothole": "ROAD",
            "garbage_sanitation": "SANIT",
            "water_supply": "WATER",
            "drainage_sewage": "DRAIN",
            "electricity_streetlight": "ELEC",
            "public_infrastructure": "INFRA",
            "other": "ADMIN",
        }

        all_citizens = [citizens[0], citizens[1], citizens[2], citizens[3], citizens[4]]

        for i, cd in enumerate(DEMO_COMPLAINTS):
            citizen = all_citizens[i % len(all_citizens)]
            ai = categorize_complaint(cd["title"], cd["desc"])
            sev = calculate_severity(cd["cat"], cd["desc"], cd.get("lat"), cd.get("lng"))

            priority = models.Priority(cd["priority"])
            deadline = datetime.now(timezone.utc) + PRIORITY_DEADLINES[cd["priority"]]

            dept_code = CATEGORY_DEPT_CODE.get(cd["cat"], "ADMIN")
            dept = depts.get(dept_code)

            # Random past date
            days_ago = random.randint(1, 90)
            created = datetime.now(timezone.utc) - timedelta(days=days_ago)

            resolved_at = None
            if cd["status"] == "resolved":
                resolved_at = created + timedelta(days=random.randint(1, 10))

            c = models.Complaint(
                complaint_id=generate_complaint_id(),
                title=cd["title"],
                description=cd["desc"],
                category=models.ComplaintCategory(cd["cat"]),
                status=models.ComplaintStatus(cd["status"]),
                priority=priority,
                ai_category=models.ComplaintCategory(ai["predicted_category"]),
                ai_confidence=ai["confidence"],
                severity_score=sev["score"],
                latitude=cd.get("lat"),
                longitude=cd.get("lng"),
                state=cd.get("state"),
                district=cd.get("district"),
                city=cd.get("city"),
                image_urls=[],
                citizen_id=citizen.id,
                department_id=dept.id if dept else None,
                is_demo=True,
                deadline=deadline,
                resolved_at=resolved_at,
            )
            db.add(c)
            db.flush()

            # Initial history
            h = models.ComplaintHistory(
                complaint_id=c.id,
                new_status=models.ComplaintStatus(cd["status"]),
                note="[DEMO DATA] Complaint recorded",
                updated_by_id=admin.id,
            )
            db.add(h)

            # Notification for citizen
            n = models.Notification(
                user_id=citizen.id,
                complaint_id=c.id,
                title="Complaint Submitted",
                message=f"[DEMO] {cd['title']} - ID: {c.complaint_id}",
                notification_type="success",
            )
            db.add(n)

        # Escalate overdue complaints
        all_complaints = db.query(models.Complaint).filter(
            models.Complaint.status.in_(["submitted", "pending"]),
            models.Complaint.priority.in_(["critical", "high"]),
        ).all()
        for comp in all_complaints[:5]:  # Escalate first 5 overdue critical/high
            comp.status = models.ComplaintStatus.escalated
            esc = models.EscalationRecord(
                complaint_id=comp.id,
                escalation_level=1,
                reason="Deadline exceeded - auto escalated",
                escalated_to="Senior Administrator",
            )
            db.add(esc)

        db.commit()
        print("✅ Demo data seeded successfully!")
        print("   Admin: admin@civicseva.in / Admin@123")
        print("   Citizen: priya@example.com / Citizen@123")
        print("   Department: road@civicseva.in / Dept@123")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()
