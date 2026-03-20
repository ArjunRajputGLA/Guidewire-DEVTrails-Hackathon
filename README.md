# 🛡️ GigShield
### AI-Powered Parametric Income Protection for India's Gig Economy

> **Guidewire DEVTrails 2026 | University Hackathon | Phase 1 Submission**  
> **Persona:** Food Delivery Partners (Zomato Simulation)

---

## 📋 Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Solution Overview](#2-solution-overview)
3. [Persona & User Scenarios](#3-persona--user-scenarios)
4. [Application Workflow](#4-application-workflow)
5. [Weekly Premium Model](#5-weekly-premium-model)
6. [Parametric Triggers](#6-parametric-triggers)
7. [AI/ML Integration Plan](#7-aiml-integration-plan)
8. [Tech Stack](#8-tech-stack)
9. [Development Plan](#9-development-plan)
10. [Compliance Checklist](#10-compliance-checklist)

---

## 1. Problem Statement

India's 15+ million food delivery partners form the invisible infrastructure of our urban economy. They are the human bridge between restaurants and consumers. Yet, when external disruptions strike — monsoon rains, extreme heat, city-wide curfews, or platform outages — **their income vanishes without warning.**

> These workers lose **20–30% of their monthly earnings** to uncontrollable external events. They have no savings buffer, no income protection, and no recourse. **GigShield exists to fix that.**

> ⚠️ **SCOPE BOUNDARY:** GigShield covers **INCOME LOSS ONLY**.  
> Strictly excluded: health insurance, life insurance, accident coverage, and vehicle repair.

---

## 2. Solution Overview

GigShield is a parametric income protection platform that:

- **Enrols** delivery partners in **2 minutes** using any photo ID + on-spot selfie + **simulated platform API integration** (Zomato / Blinkit) to auto-fetch worker identity, earnings history, and active status — no manual dashboard screenshots required.
- Offers **two coverage options**: regular monthly SIP, or 1–2% charge of monthly earnings (matched against transaction records and monthly payments).
- **Dynamically prices** a weekly premium using AI risk scoring based on worker profile and hyperlocal data.
- **Automatically triggers** claims when verifiable parametric thresholds are met — no paperwork, no phone calls.
- **Pays out** lost wages via UPI after disruption confirmation.
- **Detects and prevents fraud** using GPS validation, platform cross-checks, and ML anomaly detection.

---

## 3. Persona & User Scenarios

### 3.1 Chosen Persona: Food Delivery Partner (Zomato Simulation)

| Attribute | Detail |
|---|---|
| Age Range | > 20 years |
| Location | Tier-1 & Tier-2 urban India (Mumbai, Delhi, Bengaluru, Hyderabad) |
| Daily Earnings | ₹600 – ₹1,200 per day |
| Working Hours | 8–12 hours per day |
| Vehicle | Two-wheeler (petrol or electric) |
| Tech Comfort | Smartphone-native; uses UPI, WhatsApp daily |
| Core Pain | Zero income on disruption days; no financial buffer |

### 3.2 User Scenarios

#### 🌧️ Scenario 1 — The Mumbai Monsoon
Rahul is a Zomato partner in Andheri. At 6 AM, IMD issues a Red Alert. By 9 AM, GigShield detects rainfall exceeding 60mm/hr via weather API and cross-checks Rahul's last GPS ping confirming he is in the affected zone. His order count has dropped to zero. By end of week after analysing weather conditions and his activity, **₹350 is credited to his UPI account** — no app interaction, no form, no waiting.

#### 🚧 Scenario 2 — The Delhi Curfew
Priya is a Zomato partner in Karol Bagh. A sudden local curfew is declared. NewsAPI detects the event; platform order data shows a delivery halt in her area; her GPS confirms she is stationary during her usual working hours. **Payout is triggered by end of week** of disruption confirmation.

#### 😷 Scenario 3 — AQI Emergency (Winter Delhi)
AQI crosses 400 and GRAP Stage IV restrictions are imposed. Ramesh works 6 AM–2 PM. The CPCB AQI API trigger fires; his platform data shows 0 deliveries for the day; **GigShield pays out his average daily income at 60% coverage rate.**

---

## 4. Application Workflow

### 4.1 Onboarding Flow

```
1. Worker opens GigShield app → enters mobile number
2. Submits: Any photo ID + on-spot selfie
3. Worker selects their platform: Zomato / Blinkit / Swiggy
4. GigShield calls Simulated Platform API → auto-fetches:
     - Worker ID & verification status
     - Last 30 days earnings & order history
     - Active city zone & delivery radius
5. City zone confirmed (auto-detected via GPS + platform data)
6. AI risk profiling runs in background (2–3 seconds)
7. Weekly premium displayed → worker pays via UPI
8. Policy certificate issued instantly; coverage begins within minutes
```

### 4.2 Claims Flow (Zero-Touch)

```
[Every 30 min] Real-time monitoring engine checks parametric triggers
        ↓
Threshold breach detected → Validation pipeline fires automatically
        ↓
✔ GPS Verification: Worker location within disruption zone?
✔ Transaction Check: Orders count = 0 during disruption window?
✔ ML Fraud Score computed
        ↓
Score < 60  →  Auto-approve → UPI payout within 5 minutes
Score 60–80 →  Hold for manual review
Score > 80  →  Flagged / Rejected
        ↓
Worker receives push notification confirming payout amount
```

---

## 5. Weekly Premium Model

### 5.1 Pricing Philosophy

Gig workers live and earn week-to-week. A monthly or annual premium is financially inaccessible. GigShield uses a **7-day rolling policy** — the worker pays on Monday morning, is covered through Sunday night, and renews optionally. This aligns with how they receive platform payouts and manage their expenses.

### 5.2 Pricing Formula

```
Weekly Premium = Base Rate × Zone Risk Multiplier × Season Factor × Income Tier Factor
```

### 5.3 Premium Tiers

| Income Tier | Weekly Earnings | Weekly Premium | Max Weekly Payout |
|---|---|---|---|
| Starter | ₹2,500 – ₹3,500 | ₹29 | ₹1,500 |
| Standard | ₹3,500 – ₹5,500 | ₹49 | ₹2,500 |
| Pro | ₹5,500 – ₹8,000 | ₹79 | ₹4,000 |

### 5.4 AI Risk Multipliers

| Risk Factor | Low Risk | Medium Risk | High Risk |
|---|---|---|---|
| City Zone (flood history) | 0.8× | 1.0× | 1.3× |
| Season (monsoon months) | 1.0× | 1.15× | 1.4× |
| Worker Tenure (< 3 months) | 1.1× | 1.0× | 0.95× |
| Historical Claim Rate | 0.85× | 1.0× | 1.2× |

### 5.5 Payout Calculation

```
Payout = (Daily Avg Earnings) × (Disruption Hours ÷ Working Hours) × 60%
```

> Coverage Rate of 60% preserves the incentive to work during partial disruption days.  
> Daily Average is computed from the last 30 days of platform earnings data pulled via API.

---

## 6. Parametric Triggers

All triggers are **objective, verifiable, and fully automated**. No human intervention is required to file or approve a claim.

| Trigger | Data Source | Threshold | Payout Scope |
|---|---|---|---|
| 🌧️ Heavy Rainfall | OpenWeatherMap / IMD | ≥ 50mm in 3 hrs OR Red Alert | Inactive hours during alert |
| 🌡️ Extreme Heat | Weather API | Feels-like ≥ 45°C for ≥ 4 hrs (11 AM–4 PM) | 11 AM–4 PM window |
| 😷 Severe AQI | CPCB API / OpenAQ | AQI ≥ 400 + GRAP Stage IV | Full day if AQI persists ≥ 6 hrs |
| 🚫 Curfew / Strike | NewsAPI + Govt feeds | Official curfew/bandh declared | Declared duration |
| 📵 Platform Outage | Platform API / Downdetector | App down ≥ 2 hrs during active shift | Documented outage window |

---

## 7. AI/ML Integration Plan

### 7.1 Dynamic Premium Engine

**Model Type: Gradient Boosted Decision Tree (XGBoost)**

**Input Features:**
- Worker city zone (lat/lng cluster mapping)
- Historical disruption frequency in zone (last 12 months)
- Season / month of year
- Worker platform tenure (months active)
- Historical claim rate
- 7-day weather forecast for worker's zone

**Output:** Risk Score (0–1) mapped to a premium multiplier applied to the base tier rate.

```python
features = extract_features(worker_profile, zone_data, weather_forecast)
risk_score = xgb_model.predict(features)
premium = base_rate[income_tier] * risk_score_to_multiplier(risk_score)
```

### 7.2 Fraud Detection System

**Model Type: Isolation Forest (Unsupervised Anomaly Detection) + Rule-Based Layer**

| Detection Layer | Method | What It Catches |
|---|---|---|
| L1: GPS Validation | Geofence + movement check | Worker not in disruption zone; GPS spoofing |
| L2: Platform Cross-check | API order count validation | Orders placed in area; app showing activity |
| L3: Claim Frequency | Isolation Forest (15 features) | Unusual claim patterns vs. zone peer group |
| L4: Time Anomaly | Z-score on claim timing | Claims at impossible or irregular hours |
| L5: Network Clustering | Graph analysis | Coordinated fraud rings |

### 7.3 Risk Zone Intelligence

K-Means clustering on historical disruption data, per PIN code. Zone risk scores are **pre-computed and updated weekly**, allowing instant risk retrieval during real-time premium calculation without model inference latency.

---

## 8. Tech Stack

### 8.1 Frontend

| Component | Technology |
|---|---|
| Worker Mobile App | React Native (iOS + Android) |
| Admin / Insurer Dashboard | React.js + TailwindCSS |
| Charts & Analytics | Recharts / D3.js |

### 8.2 Backend

| Component | Technology |
|---|---|
| API Server | Node.js + Express.js |
| Primary Database | PostgreSQL (users, policies, claims) |
| Cache / Queue | Redis + Bull Queue |
| ML Service | Python + FastAPI microservice |
| Authentication | JWT + Aadhaar OTP mock |

### 8.3 AI/ML

| Component | Technology |
|---|---|
| Premium Model | Python + XGBoost + scikit-learn |
| Fraud Detection | Python + Isolation Forest (scikit-learn) |
| Data Pipeline | Pandas + NumPy |
| Model Serving | FastAPI microservice |

### 8.4 External Integrations

| Service | Provider | Mode |
|---|---|---|
| Weather Data | OpenWeatherMap API | Free Tier |
| Air Quality | CPCB AQI / OpenAQ API | Free Tier |
| News & Alerts | NewsAPI | Free Tier |
| Payments | Razorpay Test Mode / UPI Simulator | Sandbox |
| Platform Data — Identity & Earnings | Simulated Zomato API (worker ID, earnings, order history) | Mock / Simulation |
| Platform Data — Activity Verification | Simulated Blinkit API (order count, active zone) | Mock / Simulation |
| Maps & GPS | Google Maps API | Free Tier |

### 8.5 Simulated Platform API — Design

Since real Zomato / Blinkit APIs are not publicly available, GigShield implements a **mock simulation layer** that mirrors how a real integration would behave. This is used for onboarding, earnings verification, and claims validation.

```
Simulated Endpoints (Mock Server — Node.js / JSON Server):

GET  /platform/worker/:phone_number
     → { worker_id, name, platform, city_zone, tenure_months, verified_status }

GET  /platform/worker/:worker_id/earnings?days=30
     → { daily_earnings[], weekly_avg, monthly_avg, active_days }

GET  /platform/worker/:worker_id/orders?date=YYYY-MM-DD
     → { order_count, active_hours, last_ping_lat, last_ping_lng }

GET  /platform/status/:city_zone
     → { platform_active: true/false, outage_reported: true/false }
```

> **Why simulation?** Real platform APIs are partner-restricted. The simulated layer replicates the data contract faithfully so the codebase can be swapped for a live integration when credentials become available — no architectural changes needed.

---

## 9. Development Plan

### Phase 1 — Ideation & Foundation *(March 4–20)*
- [x] Problem analysis and persona selection (Food Delivery — Zomato simulation)
- [x] Architecture design and tech stack finalization
- [x] Parametric trigger definition and weekly pricing model design
- [x] AI/ML workflow planning and dataset identification
- [ ] Repository setup, boilerplate, and initial onboarding flow wireframes
- [ ] Mock API stubs for weather and platform data
- [ ] 2-minute pitch video submission

### Phase 2 — Automation & Protection *(March 21 – April 4)*
- [ ] Worker registration and Aadhaar mock verification
- [ ] Insurance policy management (create, view, renew)
- [ ] Dynamic premium calculator with XGBoost model integration
- [ ] 3–5 automated parametric trigger monitors (weather, AQI, curfew, outage)
- [ ] Claims management module — auto-initiation and status tracking
- [ ] Basic fraud validation (GPS layer + platform data layer)
- [ ] 2-minute demo video

### Phase 3 — Scale & Optimise *(April 5–17)*
- [ ] Advanced fraud detection: Isolation Forest model, GPS spoofing detection
- [ ] Instant payout simulation: Razorpay Test Mode / UPI simulator
- [ ] Worker dashboard: earnings protected, active coverage status, payout history
- [ ] Admin/insurer dashboard: loss ratios, predictive analytics, fraud queue
- [ ] Final pitch deck (PDF) covering persona, AI architecture, business viability
- [ ] 5-minute demo video: end-to-end disruption simulation with automated payout

---

## 10. Compliance Checklist

| Requirement | Status | Implementation |
|---|---|---|
| Coverage: Income Loss ONLY | ✅ Compliant | Parametric income triggers; no health/vehicle/accident coverage |
| Weekly Pricing Model | ✅ Compliant | 7-day rolling policy; UPI premium payment |
| Single Delivery Persona | ✅ Compliant | Food Delivery (Zomato simulation) exclusively |
| AI-Powered Risk Assessment | ✅ Planned | XGBoost premium model + dynamic multipliers |
| Fraud Detection | ✅ Planned | 5-layer system: GPS, platform, Isolation Forest, time anomaly, network |
| Parametric Automation | ✅ Planned | 5 objective triggers; zero-touch claims; instant UPI payout |
| Integration Capabilities | ✅ Planned | Weather, AQI, News, Payment APIs (free/mock tiers) |

---

<div align="center">

**GigShield** | Guidewire DEVTrails 2026 | Phase 1 Submission  
*Protecting the income of India's invisible workforce — one week at a time.*

</div>
