from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("Starting IVPS Mechatronics Verification Suite...")

# 1. Real User Registration (Buyer)
import time

test_email = f"karthik_{int(time.time())}@procurement.com"

reg_payload = {
    "name": "Karthik Nambiar",
    "email": test_email,
    "phone": "+919876543210",
    "password": "Password@123",
    "confirm_password": "Password@123",
    "role": "buyer",
    "company": "Nambiar Heavy Tooling Ltd."
}
r = client.post('/api/auth/register', json=reg_payload)
assert r.status_code == 200, f"Register failed: {r.text}"
reg_res = r.json()
assert reg_res["requires_verification"] == True, "Registration must require OTP verification"
otp = reg_res["dev_otp"]
print(f"Test 1 Passed: User registration created unverified account with OTP: {otp}")

# 2. Duplicate Email Prevention
r_dup = client.post('/api/auth/register', json=reg_payload)
assert r_dup.status_code == 400, "Duplicate email should be rejected"
assert "already exists" in r_dup.json()["detail"], "Expected duplicate email message"
print("Test 2 Passed: Duplicate email was strictly rejected.")

# 3. Login Attempt Before Verification Fails
r_login_unverified = client.post('/api/auth/login', json={
    "email": reg_payload["email"],
    "password": reg_payload["password"]
})
assert r_login_unverified.status_code == 403, "Unverified account should not be allowed to log in"
print("Test 3 Passed: Unverified login was prevented (HTTP 403).")

# 4. OTP Email Verification
r_verify = client.post('/api/auth/verify-otp', json={
    "email": reg_payload["email"],
    "otp": otp
})
assert r_verify.status_code == 200, f"OTP verification failed: {r_verify.text}"
buyer_token = r_verify.json()["access_token"]
buyer_headers = {"Authorization": f"Bearer {buyer_token}"}
print("Test 4 Passed: Account verified via 6-digit OTP, JWT issued.")

# 5. Buyer CANNOT post machine (Only Brokers can!)
r_post_buyer = client.post('/api/machines', json={
    "title": "Unauthorized Listing Test",
    "category": "CNC Machines",
    "listing_type": "new",
    "manufacturer": "Test",
    "model": "Test",
    "year": 2024,
    "price": 500000.0,
    "description": "Test description"
}, headers=buyer_headers)
assert r_post_buyer.status_code == 403, "Buyer should be forbidden from posting machines"
print("Test 5 Passed: Buyer was forbidden from listing machinery (HTTP 403).")

# 6. Public Visitor Access to Machine #1 (Contact is Locked)
r_public_mach = client.get('/api/machines/1')
assert r_public_mach.status_code == 200
mach_data = r_public_mach.json()
assert mach_data["is_contact_unlocked"] == False, "Contact must be locked for public"
assert mach_data["unlocked_contact"] is None, "Broker phone/email must NEVER be returned publicly"
assert mach_data["contact_unlock_fee"] > 0, "Contact unlock fee must be present"
initial_fee = mach_data["contact_unlock_fee"]
print(f"Test 6 Passed: Public contact protection verified. Fee: INR {initial_fee}")

# 7. Admin Login & Fee Control
r_admin_login = client.post('/api/auth/login', json={
    "email": "admin@ivpsmechatronics.com",
    "password": "admin123"
})
assert r_admin_login.status_code == 200, "Admin login failed"
admin_token = r_admin_login.json()["access_token"]
admin_headers = {"Authorization": f"Bearer {admin_token}"}

# Admin changes platform default fee to ₹149
r_update_fee = client.put('/api/admin/settings/fee', json={"default_fee": 149.0}, headers=admin_headers)
assert r_update_fee.status_code == 200
print("Test 7 Passed: Admin updated platform default fee to INR 149.")

# Admin sets custom machine fee on machine #1 to INR 1490
r_custom_fee = client.put('/api/admin/machines/1/fee', json={"contact_unlock_fee": 1490.0}, headers=admin_headers)
assert r_custom_fee.status_code == 200
mach_custom = client.get('/api/machines/1').json()
assert mach_custom["contact_unlock_fee"] == 1490.0, f"Expected custom fee 1490, got {mach_custom['contact_unlock_fee']}"
print("Test 7.1 Passed: Machine-specific custom fee verified as INR 1490.")

# 8. Contact Unlock Flow (Buyer pays fee & gets broker contact)
r_unlock_init = client.post('/api/unlock/initiate', json={"machine_id": 1, "payment_method": "upi"}, headers=buyer_headers)
assert r_unlock_init.status_code == 200, f"Unlock initiation failed: {r_unlock_init.text}"
pay_info = r_unlock_init.json()
assert pay_info["amount"] == 1490.0, "Initiated payment must match the configured fee"
payment_id = pay_info["payment_id"]

# Verify payment
r_unlock_verify = client.post('/api/unlock/verify', json={"payment_id": payment_id, "simulate_status": "success"}, headers=buyer_headers)
assert r_unlock_verify.status_code == 200
verify_res = r_unlock_verify.json()
assert verify_res["success"] == True
broker_contact = verify_res["contact"]
assert broker_contact["phone"] is not None and len(broker_contact["phone"]) > 0, "Broker mobile must now be returned"
print(f"Test 8 Passed: Contact unlocked! Broker Mobile: {broker_contact['phone']}")

# 9. Verify authenticated machine view now shows unlocked contact
r_mach_unlocked = client.get('/api/machines/1', headers=buyer_headers)
assert r_mach_unlocked.status_code == 200
unlocked_data = r_mach_unlocked.json()
assert unlocked_data["is_contact_unlocked"] == True
assert unlocked_data["unlocked_contact"]["phone"] == broker_contact["phone"]
print("Test 9 Passed: Machine profile returns unlocked contact to authorized buyer.")

# ==============================================================================
# GOOGLE OAUTH 2.0 / OPENID CONNECT AUTHENTICATION TEST SUITE
# ==============================================================================

# 10. First-Time Google Sign-In Without Role -> Prompts Role Selection
g_sub_1 = f"goog_sub_{int(time.time())}_1"
g_email_1 = f"alex.buyer.{int(time.time())}@gmail.com"
g_name_1 = "Alex Buyer Google"
g_token_1 = f"test_google_{g_sub_1}___{g_email_1}___{g_name_1}"

r_g1 = client.post('/api/auth/google', json={"id_token": g_token_1})
assert r_g1.status_code == 200, f"Google auth failed: {r_g1.text}"
res_g1 = r_g1.json()
assert res_g1["needs_role_selection"] == True, "First time Google login must prompt role selection"
assert res_g1["google_sub"] == g_sub_1, "Google sub must match"
assert res_g1["email"] == g_email_1, "Google verified email must match"
print("Test 10 Passed: First-time Google user without preset role prompted for role selection.")

# 11. Complete Google Registration as Industrial Buyer
r_g1_complete = client.post('/api/auth/google/complete-registration', json={
    "google_sub": g_sub_1,
    "email": g_email_1,
    "name": g_name_1,
    "role": "buyer",
    "phone": "+919811122233",
    "company": "Buyer Dynamics Pvt Ltd"
})
assert r_g1_complete.status_code == 200, f"Complete registration failed: {r_g1_complete.text}"
g1_user = r_g1_complete.json()["user"]
g1_token = r_g1_complete.json()["access_token"]
assert g1_user["is_google_verified"] == True, "User must be marked as Google verified"
assert g1_user["verified_email"] == g_email_1, "Verified email must equal Google email"
assert g1_user["google_sub"] == g_sub_1, "Permanent Google sub must be stored"
assert g1_user["role"] == "buyer", "Role must be buyer"
assert g1_user["is_verified"] == True, "Google accounts are pre-verified without OTP"
print("Test 11 Passed: Google account registration completed as Industrial Buyer with verified_email & google_sub.")

# 12. Subsequent Sign-In with the Same Google Account -> Signs in immediately
r_g1_login = client.post('/api/auth/google', json={"id_token": g_token_1})
assert r_g1_login.status_code == 200
res_g1_login = r_g1_login.json()
assert res_g1_login["needs_role_selection"] == False, "Existing Google user must NOT prompt role selection"
assert res_g1_login["access_token"] is not None, "Access token must be returned immediately"
assert res_g1_login["user"]["email"] == g_email_1
print("Test 12 Passed: Subsequent Google login signs in immediately without role selection.")

# 13. First-Time Google Sign-In Directly with Role (from Register Page) as Broker
g_sub_2 = f"goog_sub_{int(time.time())}_2"
g_email_2 = f"vikram.broker.{int(time.time())}@gmail.com"
g_name_2 = "Vikram Broker Machinery"
g_token_2 = f"test_google_{g_sub_2}___{g_email_2}___{g_name_2}"

r_g2 = client.post('/api/auth/google', json={
    "id_token": g_token_2,
    "role": "broker",
    "phone": "+919844455566",
    "company": "Vikram Machinery Exchange"
})
assert r_g2.status_code == 200, f"Google broker registration failed: {r_g2.text}"
res_g2 = r_g2.json()
assert res_g2["needs_role_selection"] == False
assert res_g2["user"]["role"] == "broker"
assert res_g2["user"]["is_google_verified"] == True
assert res_g2["user"]["verified_email"] == g_email_2
print("Test 13 Passed: Google registration with preset role 'broker' succeeded in one step.")

# 14. Strict Rejection of 'admin' Role During Google Onboarding
g_sub_3 = f"goog_sub_{int(time.time())}_3"
g_email_3 = f"hacker.{int(time.time())}@gmail.com"
g_token_3 = f"test_google_{g_sub_3}___{g_email_3}___Hacker"

r_g3_illegal = client.post('/api/auth/google', json={
    "id_token": g_token_3,
    "role": "admin"
})
assert r_g3_illegal.status_code == 400, "Admin role in Google login must be rejected"
assert "buyer" in r_g3_illegal.json()["detail"].lower() and "broker" in r_g3_illegal.json()["detail"].lower()

r_g3_illegal_complete = client.post('/api/auth/google/complete-registration', json={
    "google_sub": g_sub_3,
    "email": g_email_3,
    "name": "Hacker",
    "role": "admin"
})
assert r_g3_illegal_complete.status_code == 422 or r_g3_illegal_complete.status_code == 400, "Admin role in complete-registration must be rejected"
print("Test 14 Passed: Attempting to claim 'admin' role via Google auth was strictly rejected (HTTP 400/422).")

# 15. Link Existing Email Account to Google Identity
existing_email = test_email # created in Test 1
g_sub_4 = f"goog_sub_{int(time.time())}_4"
g_token_4 = f"test_google_{g_sub_4}___{existing_email}___KarthikLinked"

r_g4 = client.post('/api/auth/google', json={"id_token": g_token_4})
assert r_g4.status_code == 200, f"Account linking failed: {r_g4.text}"
res_g4 = r_g4.json()
assert res_g4["user"]["email"] == existing_email
assert res_g4["user"]["google_sub"] == g_sub_4
assert res_g4["user"]["is_google_verified"] == True
assert res_g4["user"]["verified_email"] == existing_email
print("Test 15 Passed: Existing email account successfully linked to Google Identity via google_sub.")

# 16. Google Verified Email Immutability
g1_headers = {"Authorization": f"Bearer {g1_token}"}
r_change_email = client.put('/api/auth/profile', json={
    "email": "tampered_email@fake.com",
    "name": "Alex Updated"
}, headers=g1_headers)
# In profile update, verify email cannot be changed
r_me = client.get('/api/auth/me', headers=g1_headers)
assert r_me.status_code == 200
assert r_me.json()["email"] == g_email_1, "Google verified email must not be altered via regular profile update"
assert r_me.json()["verified_email"] == g_email_1
print("Test 16 Passed: Google verified email remains immutable.")

print("\nALL 16 VERIFICATION TESTS COMPLETED WITH 100% SUCCESS!")
