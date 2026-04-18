<div align="center">

<img src="https://img.shields.io/badge/GigShield-Income%20Protection-6366f1?style=for-the-badge&logo=shield&logoColor=white" alt="GigShield" height="45"/>

# 🛡️ GigShield
### *Parametric Income Insurance for India's Gig Workers*

> **Built for the Guidewire DEVTrails 2026 Hackathon**  
> Protecting 15 million+ gig workers from uncontrollable income disruptions — automatically.

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Express.js](https://img.shields.io/badge/Express.js-REST%20API-000000?style=flat-square&logo=express)](https://expressjs.com/)

<br/>

[🚀 Live Demo](#-getting-started) · [📸 Screenshots](#-screenshots) · [🏗️ Architecture](#-architecture) · [📖 Docs](#-parametric-triggers)

---

</div>

## 🎯 The Problem

India's food & grocery delivery partners — riding for **Zomato, Swiggy, Zepto, Amazon** — earn daily wages that can vanish overnight. When heavy rain hits, a platform goes down, or a curfew is imposed, these workers lose 20–30% of their monthly income with **zero recourse**.

Traditional insurance won't touch this. It's too granular, too instant, and too informal for the existing system to handle.

**GigShield does.**

---

## 💡 The Solution

GigShield is a **condition-based parametric insurance platform** designed from the ground up for India's gig economy. Instead of claims forms and waiting periods, GigShield uses real-world data triggers to automatically detect disruptions and fire payouts — within minutes, to a worker's UPI ID.

```
Trigger Detected → AI Credibility Check → Instant UPI Payout
        (< 5 minutes end-to-end)
```

No paperwork. No call centres. No delays.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🌧️ **Parametric Triggers** | Auto-payouts on rainfall ≥ 50mm, heat index ≥ 45°C, AQI ≥ 400, curfews, or platform outages |
| 🤖 **AI Fraud Detection** | Credibility scoring engine catches GPS spoofing, fake weather claims, duplicate submissions |
| 👷 **Worker Dashboard** | Active coverage, trigger alerts, claim history, weekly payout tracker |
| 🛠️ **Admin Dashboard** | KPI cards, claims trend charts, fraud alert queue, live trigger monitoring |
| ⚡ **UPI Payouts** | Payout to worker's UPI ID within 5 minutes of trigger approval |
| 🔒 **5-Step KYC Onboarding** | Mobile OTP → Personal Info → Aadhaar/PAN → Gig Platform → Income & Zone |
| 📊 **Risk-Based Pricing** | Dynamic weekly premiums adjusted for city zone, season, and worker history |

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        GigShield                           │
│                                                            │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐   │
│  │  Next.js 16  │    │  Express.js  │    │  Supabase   │   │
│  │  App Router  │◄──►│  REST API    │◄──►│  PostgreSQL │   │
│  │  TypeScript  │    │  Node.js     │    │  Auth + RLS │   │
│  └──────┬───────┘    └──────┬───────┘    └──────┬──────┘   │
│         │                   │                   │          │
│  ┌──────▼───────────────────▼───────────────────▼──────┐   │
│  │            External Integrations (Mock/Live)        │   │
│  │  🌦 Weather API  |  📡 Platform APIs  |  💸 UPI    |   |
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Screenshots

> ### Login Page
> Two-panel design with product highlights and secure sign-in. Clean, professional, and built for trust.

> ### Worker Dashboard  
> At-a-glance view of active coverage, weekly premium, live trigger status, and recent payout history.

> ### Admin Dashboard  
> Full operational control — KPI cards, claims trend charts, fraud alerts, and real-time trigger monitoring across all zones.

> ### Onboarding Flow  
> 5-step guided onboarding built for low-friction mobile completion: Mobile OTP → Personal Info → KYC → Gig Platform → Income & Zone.

---

## 🌧️ Parametric Triggers

GigShield monitors these conditions automatically using real-time and mock APIs:

| Trigger | Threshold | Coverage Type |
|---|---|---|
| 🌧️ Heavy Rainfall | ≥ 50mm in 3 hours | Income Replacement |
| 🌡️ Extreme Heat | Feels-like ≥ 45°C for 4+ hours | Income Replacement |
| 😷 Severe AQI | AQI ≥ 400 + GRAP Stage IV | Income Replacement |
| 🚫 Curfew / Bandh | Official government order issued | Income Replacement |
| 📵 Platform Outage | App down ≥ 2 hours (verified via mock API) | Income Replacement |

> ⚠️ **Coverage is strictly for lost income only.** Vehicle repairs, health, and accidents are excluded by design.

---

## 💰 Coverage Tiers

| Tier | Weekly Earnings | Weekly Premium | Max Weekly Payout |
|---|---|---|---|
| 🔵 Starter | < ₹3,500 | **₹29** | ₹1,500 |
| 🟠 Standard | ₹3,500 – ₹5,500 | **₹49** | ₹2,500 |
| 🟣 Pro | > ₹5,500 | **₹79** | ₹4,000 |

> Premium is dynamically adjusted based on city risk zone and seasonal weather factors via the AI pricing engine.

---

## 🤖 AI & Fraud Detection

GigShield's credibility scoring system runs on every claim to detect and prevent fraud before payout:

- **GPS Spoofing Detection** — Cross-references claimed location against historical delivery zone data
- **Weather Claim Validation** — Compares claim timestamp with official API weather records for the worker's zone
- **Duplicate Claim Prevention** — Deduplication logic prevents re-filing the same event
- **Anomaly Scoring** — ML-powered score flags unusual claim patterns for admin review
- **Auto-approve vs. Flagged Review** — Low-risk claims go straight to UPI payout; high-risk claims enter a manual review queue

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** — App Router, server components, SSR
- **TypeScript** — Full end-to-end type safety
- **Tailwind CSS 4** — Utility-first styling
- **Recharts** — Analytics visualizations on admin dashboard

### Backend
- **Express.js** — REST API for premium calculation and UPI verification
- **Node.js v22+** — Runtime

### Infrastructure
- **Supabase** — PostgreSQL database, Row Level Security, Auth, Storage
- **Supabase Auth** — Email + session management
- **Supabase Storage** — KYC document uploads (Aadhaar, PAN, selfie)
- **Row Level Security** — Per-user data isolation enforced at DB level

---

## 📁 Project Structure

```
GigShield/
├── Guidewire-DEVTrails-Hackathon/          # Frontend (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/                     # Login & Signup pages
│   │   │   │   ├── login/
│   │   │   │   └── signup/
│   │   │   ├── admin/                      # Admin dashboard & sub-pages
│   │   │   │   ├── claims/                 # Claims management
│   │   │   │   ├── dashboard/              # KPIs & analytics
│   │   │   │   ├── fraud/                  # Fraud alert queue
│   │   │   │   ├── policies/               # Policy management
│   │   │   │   ├── settings/
│   │   │   │   ├── triggers/               # Live trigger monitoring
│   │   │   │   └── workers/                # Worker management
│   │   │   ├── api/
│   │   │   │   ├── send-otp/               # OTP delivery
│   │   │   │   └── verify-otp/             # OTP verification
│   │   │   ├── auth/callback/              # Email confirmation handler
│   │   │   ├── onboarding/                 # 5-step onboarding flow
│   │   │   │   ├── step-1/                 # Mobile verification
│   │   │   │   ├── step-2/                 # Personal details
│   │   │   │   ├── step-3/                 # KYC documents
│   │   │   │   ├── step-4/                 # Gig platform details
│   │   │   │   └── step-5/                 # Income & zone
│   │   │   └── worker/                     # Worker-facing app
│   │   │       ├── dashboard/              # Main worker dashboard
│   │   │       ├── my-claims/              # Claim history
│   │   │       ├── my-policy/              # Active policy details
│   │   │       ├── profile/                # Worker profile
│   │   │       └── weekly-payout/          # Payout tracker
│   │   ├── components/                     # Shared UI components
│   │   ├── context/                        # Auth context
│   │   ├── data/                           # Mock data for admin demo
│   │   └── lib/                            # Supabase browser/server clients
│   └── middleware.ts                       # Route protection
│
└── backend/                                # Express.js API
    └── src/
        ├── config/
        ├── controllers/
        ├── middleware/
        └── routes/
            ├── claims.ts                   # Claims processing
            └── onboarding.ts               # Premium calc, UPI verify
```

---

## 🗃️ Database Schema

Key tables in Supabase PostgreSQL:

| Table | Purpose |
|---|---|
| `worker_profiles` | User profile, onboarding status, city, mobile |
| `kyc_documents` | Aadhaar/PAN uploads, selfie, dashboard screenshot |
| `gig_profiles` | Platform, vehicle type, working hours, tenure |
| `income_data` | Daily earnings, working days, zone, tier classification |
| `payment_info` | UPI ID or bank account for payouts |

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

Run in your Supabase SQL Editor:

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

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔐 Authentication Flow

```
Signup → Confirm Email → /auth/callback
  → /onboarding/step-1 (Mobile OTP)
  → /onboarding/step-2 (Personal Details)
  → /onboarding/step-3 (KYC Documents)
  → /onboarding/step-4 (Gig Platform)
  → /onboarding/step-5 (Income & Zone)
  → /worker/dashboard ✅

Login → Check onboarding_complete
  → true  → /worker/dashboard
  → false → Resume from last saved onboarding_step
```

---

## 🧪 Demo Credentials

For testing the worker onboarding flow:

- **Mobile OTP:** Use any 10-digit mobile number → Enter `123456` as OTP
- **Admin Dashboard:** Use the pre-seeded admin account configured in your Supabase auth provider

---

## 🗓️ Hackathon Journey

This project was built across 6 weeks as part of the **Guidewire DEVTrails 2026** Hackathon:

| Phase | Theme | Deliverable |
|---|---|---|
| **Week 1–2** | Ideate & Know Your Worker | Idea doc, personas, tech plan, 2-min video |
| **Week 3–4** | Protect Your Worker | Registration, policy management, dynamic premiums, claims |
| **Week 5–6** | Perfect for Your Worker | Fraud detection, instant payouts, full dashboards, final pitch |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

Built for the **Guidewire DEVTrails 2026 Hackathon**.

---

<div align="center">

**Built with ❤️ for India's 15 million+ gig workers**

*"GigShield brings financial security and stability to gig workers by protecting their income against unpredictable disruptions — automatically, fairly, and within minutes."*

</div>
