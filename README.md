# IVPS Mechatronics

> **Premier B2B Heavy Machinery Marketplace**  
> *"Find the Right Machine. Build the Future."*

IVPS Mechatronics is a specialized industrial B2B marketplace engineered for buying, selling, comparing, and discovering industrial, mechanical, electrical, construction, manufacturing, and agricultural machinery.

---

## Core Architecture & Business Logic

### 1. Paid Broker Contact System
- **Strict Privacy Enforcement**: The broker's mobile number, WhatsApp line, and private email are strictly hidden on the backend until payment authorization.
- **Configurable Contact Unlock Fee**:
  - Platform default fee (default: **₹99 INR**).
  - Admin-configurable per-machine custom fee overrides (e.g. ₹499 or ₹1,490).
- **Before Payment Experience**:
  - Displays: **Broker Contact**, 🔒 **Contact Locked**, *"Pay the contact access fee to get the broker's contact details."*
  - Shows: **Contact Unlock Fee: ₹99** (or custom machine fee).
  - Primary Action: **Pay ₹99 & Get Broker Contact** button.
  - No private phone numbers, WhatsApp, or private emails are ever visible before authorization.
- **After Payment Experience**:
  - Displays: **✓ Broker Contact Unlocked**
  - Reveals: Broker Name, Mobile Number, WhatsApp, Direct Email, and Plant Inspection Address.
  - One-Click Actions:
    - 📞 **Call Broker** (`tel:+91...`)
    - 💬 **WhatsApp Broker** (`https://wa.me/91...`)
- **Admin Fee Controls & Unlock Ledger**:
  - Platform Fee Management panel in the Admin Dashboard to dynamically update default fees.
  - Per-machine custom fee editor.
  - Unlock Transactions Ledger with revenue tracking in ₹ INR.

---

### 2. Strict 3 User Roles (Zero "Seller" Role)
The platform strictly enforces three user roles:
1. **BUYER**: Industrial procurement managers, factory owners, and engineers. Can browse machinery, compare equipment, save wishlist items, unlock broker contacts, and submit RFQ enquiries. *Buyers cannot list machinery.*
2. **BROKER**: Certified machinery brokers and heavy equipment dealers. Can create equipment listings, manage inventory, receive buyer RFQs, and monitor contact unlock leads.
3. **ADMIN**: Platform operations team. Can configure contact unlock fees, moderate pending machinery submissions, manage registered brokers & buyers, and audit the financial unlock transactions ledger.

---

### 3. Real User Account System & Email OTP Verification
- **Real Registration Fields**: Full Name, Work Email, Mobile Number, Password, Confirm Password, and Role selection (**Buyer** or **Broker**).
- **Email OTP Verification**: Every new account is created in an unverified state and issued a secure 6-digit OTP code (with a 15-minute expiry window).
- **Mandatory Activation**: Unverified accounts cannot sign in (HTTP 403 Forbidden). Only accounts that complete the 6-digit email OTP verification are activated and issued authenticated JWT sessions.
- **Zero Mock Accounts**: Production workflows utilize real, secured accounts.

---

### 4. Google Account Authentication & OAuth 2.0 / OpenID Connect
- **Identity Ownership Verification**: Integrates official Google OAuth 2.0 / OpenID Connect token verification on the backend to guarantee email ownership.
- **Permanent Account Binding (`google_sub`)**: Uses Google's unique subject identifier (`google_sub`) as the permanent identity key.
- **`✓ Google Verified Email` Badge**: Verified Google emails are explicitly badged across the navigation bar, user portal, and admin directories.
- **Email Immutability**: Google-verified emails cannot be manually altered without Google re-authentication.
- **Strict Role Selection for New Accounts**: First-time Google users select their role (**Buyer** or **Broker** ONLY; **Admin** role is strictly prohibited from public onboarding).
- **Existing Account Linking**: If an existing account with the same email already exists, signing in with Google automatically and securely links the Google identity.

---

### 5. Marketplace Categories & Technical Dossiers
- **New Machines**: Factory-new equipment sourced directly from certified manufacturers and primary dealers with warranty parameters and lead times.
- **Second-Hand Machines**: Certified pre-owned machinery with documented operating hours, condition ratings (*Brand New, Excellent, Very Good, Good, Fair, Needs Maintenance*), and service logs.
- **Dynamic Engineering Parameters**: Configurable technical specifications including spindle power, operating voltage, table dimensions, tonnage, and operating weights.
- **Side-by-Side Comparison Matrix**: Compare up to 4 machines simultaneously across specifications, condition, and pricing in ₹ INR.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Vite
- **Backend**: Python FastAPI, SQLAlchemy, Pydantic v2, PyJWT, Passlib (Bcrypt), Google OpenID Connect
- **Database**: SQLite (out-of-the-box zero-config, switchable to PostgreSQL)
- **Currency**: Indian Rupees (₹ INR) throughout all listings, fees, and transactions

---

## Quick Start & Verification

### Unified Full-Stack Run

1. **Start Backend Server**:
   ```powershell
   cd backend
   C:\Users\LENOVO\AppData\Local\Python\pythoncore-3.14-64\python.exe run.py
   ```
   Backend runs at [http://localhost:8000](http://localhost:8000) (serves both API and pre-compiled frontend).

2. **Frontend Development (Hot Reloading)**:
   ```powershell
   cd frontend
   cmd.exe /c "npm run dev"
   ```
   Access dev server at [http://localhost:5173](http://localhost:5173).

---

## Automated Verification Suite

Run the end-to-end automated test suite:
```powershell
cd backend
C:\Users\LENOVO\AppData\Local\Python\pythoncore-3.14-64\python.exe test_api.py
```

All 16 tests verify:
1. User registration generates unverified account with 6-digit OTP.
2. Duplicate email registrations are strictly rejected.
3. Unverified accounts cannot log in (HTTP 403).
4. 6-digit OTP verification activates account and issues JWT.
5. Buyer role is forbidden from posting machinery listings (HTTP 403).
6. Broker contact numbers are masked and protected before payment.
7. Admin updates platform default fee in ₹ INR.
8. Admin sets custom machine fee override in ₹ INR.
9. Contact unlock payment reveals broker cell number and WhatsApp.
10. Machine profile returns unlocked contact to authorized buyer.
11. First-time Google user without preset role is prompted for role selection.
12. Google account registration completes as Industrial Buyer with `verified_email` and `google_sub`.
13. Subsequent Google login signs in immediately without role selection.
14. Google registration with preset role 'broker' succeeds in one step.
15. Attempting to claim 'admin' role via Google onboarding is strictly rejected (HTTP 400/422).
16. Existing email account successfully links to Google identity via `google_sub`, and verified email remains immutable.
