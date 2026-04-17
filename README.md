# 🛡️ GigShield — Income Protection for Gig Workers

> **Parametric insurance designed for delivery partners. Get paid within minutes when heavy rain, extreme heat, or platform outages stop your work.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38BDF8?logo=tailwindcss)](https://tailwindcss.com)

---

## 📌 The Problem

Gig workers — delivery partners on Zomato, Swiggy, and similar platforms — earn daily. But unpredictable events like **heavy rainfall**, **extreme heat**, **platform outages**, or **government curfews** can instantly wipe out a day's income.

Traditional insurance doesn't cover this. GigShield does.

---

## 💡 The Solution

GigShield is a **condition-based parametric insurance platform** that:

- Automatically detects when a trigger condition is met (e.g., rainfall ≥ 50mm)
- Processes payouts **within minutes** — no paperwork, no manual claims
- Uses a **credibility scoring system** to detect and prevent fraud
- Covers the most vulnerable workers starting at just **₹29/week**

---

## ✨ Key Features

| Feature | Description |
|--------|-------------|
| 🌧️ **Parametric Triggers** | Auto-payouts based on rainfall, heat index, AQI, curfews, platform downtime |
| 🤖 **Smart Claim System** | AI-based credibility scoring for instant or flagged review |
| 👷 **Worker Dashboard** | View policies, active alerts, submit claims, track payouts |
| 🛠️ **Admin Dashboard** | Manage workers, review flagged claims, monitor fraud alerts |
| ⚡ **UPI Payouts** | Instant payout to worker's UPI ID within 5 minutes of approval |
| 🔒 **Secure Onboarding** | 5-step KYC flow with document upload and mobile verification |

---

## 🖥️ Screenshots

### Login Page
> Two-panel design with product highlights and secure sign-in

### Worker Dashboard
> Active coverage status, weekly premium, parametric triggers, and activity overview

### Admin Dashboard
> KPI cards, claims trend charts, fraud alerts, and active trigger monitoring

### Onboarding Flow
> 5-step guided onboarding: mobile verify → personal info → KYC → gig platform → income & zone

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** — App Router, server components
- **TypeScript** — Full type safety
- **Tailwind CSS 4** — Utility-first styling
- **Recharts** — Data visualization for admin analytics
- **Supabase SSR** — Server-side auth and data fetching

### Backend
- **Express.js** — REST API for premium calculation and UPI verification
- **Supabase** — PostgreSQL database, Row Level Security, Auth
- **Node.js** — Runtime

### Infrastructure
- **Supabase Auth** — Email + session management
- **Supabase Storage** — KYC document uploads
- **Row Level Security** — Per-user data isolation

---

## 📁 Project Structure

```
GigShield/
├── Guidewire-DEVTrails-Hackathon/     # Frontend (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/                # Login & Signup pages
│   │   │   ├── admin/                 # Admin dashboard & sub-pages
│   │   │   ├── auth/callback/         # Email confirmation handler
│   │   │   ├── onboarding/            # 5-step onboarding flow
│   │   │   │   ├── step-1/            # Mobile verification
│   │   │   │   ├── step-2/            # Personal details
│   │   │   │   ├── step-3/            # KYC documents
│   │   │   │   ├── step-4/            # Gig platform details
│   │   │   │   └── step-5/            # Income & zone
│   │   │   └── worker/                # Worker dashboard
│   │   ├── components/                # Shared UI components
│   │   ├── context/                   # Auth context
│   │   ├── data/                      # Mock data for admin demo
│   │   └── lib/                       # Supabase browser/server clients
│   └── middleware.ts                  # Route protection
│
└── backend/                           # Express.js API
    └── src/
        └── routes/
            └── onboarding.ts          # Premium calculation, UPI verify
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v22+
- npm
- A [Supabase](https://supabase.com) project

### 1. Clone the repository

```bash
git clone https://github.com/your-username/gigshield.git
cd gigshield
```

### 2. Set up the frontend

```bash
cd Guidewire-DEVTrails-Hackathon
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up the database

Run the following in your Supabase SQL Editor:

```sql
-- Auto-create worker profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.worker_profiles (id, onboarding_step)
  VALUES (NEW.id, 1)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Set up the backend

```bash
cd ../backend
npm install
```

Create `.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=4000
```

```bash
npm run dev
```

### 5. Run the frontend

```bash
cd ../Guidewire-DEVTrails-Hackathon
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Authentication Flow

```
Signup → Check inbox → Click confirmation link
  → /auth/callback → /onboarding/step-1
  → Complete 5 steps → /worker/dashboard

Login → Check onboarding_complete
  → true  → /worker/dashboard
  → false → Resume from last onboarding_step
```

---

## 🛡️ Parametric Triggers

GigShield monitors the following conditions automatically:

| Trigger | Threshold | Coverage |
|---------|-----------|----------|
| 🌧️ Heavy Rainfall | ≥ 50mm in 3 hours | Income replacement |
| 🌡️ Extreme Heat | Feels-like ≥ 45°C for 4+ hours | Income replacement |
| 😷 Severe AQI | AQI ≥ 400 + GRAP Stage IV | Income replacement |
| 🚫 Curfew / Bandh | Official government order | Income replacement |
| 📵 Platform Outage | App down ≥ 2 hours | Income replacement |

---

## 💰 Coverage Tiers

| Tier | Weekly Earnings | Weekly Premium | Max Weekly Payout |
|------|----------------|----------------|-------------------|
| 🔵 Starter | < ₹3,500 | ₹29 | ₹1,500 |
| 🟠 Standard | ₹3,500 – ₹5,500 | ₹49 | ₹2,500 |
| 🟣 Pro | > ₹5,500 | ₹79 | ₹4,000 |

Premium is further adjusted by city risk zone and seasonal factors.

---

## 🗃️ Database Schema

Key tables in Supabase:

- `worker_profiles` — User profile, onboarding status, city, mobile
- `kyc_documents` — Aadhaar/PAN uploads, selfie, dashboard screenshot
- `gig_profiles` — Platform, vehicle type, working hours, tenure
- `income_data` — Daily earnings, working days, zone, tier classification
- `payment_info` — UPI ID or bank account for payouts

---

## 🧪 Demo Credentials

For testing the worker onboarding flow:

- **OTP**: Use any 10-digit mobile number, then enter `123456` as the OTP

For the admin dashboard, use the pre-seeded admin account configured in your auth provider.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 🆕 Latest Progress

- **Real-Time Data Integration:** Set up real-time WebSockets tracking for policy updates and claims (`fix_realtime.sql`).
- **AI Fraud Detection:** Integrated Google Gemini for AI-based fraud evaluation and claims verification (`test_gemini.js`, `setup_fraud_trigger.sql`).
- **Claims Management & Seeding:** Built robust claim lifecycle logic, including seeding initial data and validating records (`seed_claims.js`, `check_claims.js`).
- **Notifications System:** Added automated alerts for pending actions and payouts (`setup_notifications.sql`, `update_notifications.sql`).
- **Admin Roles & Coverage Tools:** Extended the admin dashboard capabilities and worker income calculations (`setup_admin.sql`, `fix_income.js`).
- **Enhanced Security & Auth:** Fixed OTP validation flows and enhanced password safety configurations.
- **UI Enhancements:** Fixed the worker dashboard calamities display to accurately render parametric triggers.

---

## 📄 License

This project was built for the **Guidewire DEVTrails Hackathon**.

---

## 👥 Team

Built with ❤️ for India's 15 million+ gig workers.

---

> *"GigShield aims to bring financial security and stability to gig workers by protecting their income against unpredictable disruptions."*
