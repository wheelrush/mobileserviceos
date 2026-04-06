# Mobile Service OS

**The operating system for mobile service businesses.**

A mobile-first, multi-tenant, white-label SaaS platform for mobile service businesses.

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Firebase
Copy `.env.example` to `.env` and fill in your Firebase project credentials:
```bash
cp .env.example .env
```

Get your credentials from the Firebase Console → Project Settings → Your apps.

### 3. Set up Firestore security rules
In the Firebase Console → Firestore → Rules, paste the contents of `firestore.rules`.

### 4. Enable Firebase Auth
In the Firebase Console → Authentication → Sign-in method:
- Enable **Email/Password**
- Enable **Google**

### 5. Run the app
```bash
npm run dev
```

---

## Project Structure

```
src/
├── app/                    # Shell, routing, providers
├── auth/                   # Firebase Auth context + hooks
├── business/               # Business/tenant context
├── pages/                  # Screen components
│   ├── Login.jsx           # Auth screens (Login + Signup)
│   ├── Onboarding.jsx      # 10-step onboarding flow
│   ├── Dashboard.jsx       # Main dashboard with KPIs
│   ├── AddJob.jsx          # Job form with live pricing
│   ├── Jobs.jsx            # Jobs list + detail
│   ├── Expenses.jsx        # Expense tracking
│   ├── Payouts.jsx         # Weekly payout engine
│   ├── Invoices.jsx        # Invoice viewer + PDF export
│   └── Settings.jsx        # All settings sections
├── components/             # Shared UI components
├── features/
│   ├── businessModel/      # modelConfigs.js — SINGLE SOURCE OF TRUTH
│   ├── pricing/            # pricingEngine.js
│   └── payouts/            # payoutEngine.js
├── services/               # Firebase service layer
├── config/                 # Theme, constants
└── utils/                  # Date, currency, week helpers
```

---

## Architecture Principles

### Multi-Tenant
All data is scoped under `/businesses/{businessId}/`. Security rules enforce isolation at the database level.

### Model Config System
Industry-specific logic lives **only** in `src/features/businessModel/modelConfigs.js`.
Never hardcode tire-specific logic elsewhere. When adding a new business type, add a config entry and it propagates everywhere.

### Payout Engine Rules
- `materialCost + otherJobCost + laborCost + travelCost` = per-job costs (on job docs)
- `expenses` = separate variable business expenses
- `overhead` = applied **ONCE** at weekly summary level, never per job

### Travel System
- `travelCost` = internal cost (miles × costPerMile)
- `travelFee` = charged to customer (miles × chargePerMile + band surcharge)
- Always tracked separately

### Subscription Gating
Subscription state lives only at `/businesses/{id}/settings/subscription`.
`canWrite(subscription)` controls all write access.

---

## Extending to New Business Models

1. Add a config to `MODEL_CONFIGS` in `modelConfigs.js`
2. Set `active: true`
3. Add conditional field rendering in `AddJob.jsx` if the model has unique fields
4. That's it — pricing, payouts, expenses, and invoices adapt automatically

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

---

## Build for Production

```bash
npm run build
```

Deploy the `dist/` folder to Firebase Hosting, Vercel, Netlify, or GitHub Pages.
