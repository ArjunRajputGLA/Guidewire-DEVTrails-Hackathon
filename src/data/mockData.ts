// ============ TEAM MEMBERS ============
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
}

export const teamMembers: TeamMember[] = [
  { id: "tm1", name: "Arjun Mehta", role: "Lead Engineer", avatar: "AM", email: "arjun@gigshield.in" },
  { id: "tm2", name: "Priya Sharma", role: "Data Scientist", avatar: "PS", email: "priya@gigshield.in" },
  { id: "tm3", name: "Rahul Verma", role: "Backend Dev", avatar: "RV", email: "rahul@gigshield.in" },
  { id: "tm4", name: "Sneha Patel", role: "Frontend Dev", avatar: "SP", email: "sneha@gigshield.in" },
  { id: "tm5", name: "Vikram Singh", role: "DevOps", avatar: "VS", email: "vikram@gigshield.in" },
  { id: "tm6", name: "Ananya Gupta", role: "QA Engineer", avatar: "AG", email: "ananya@gigshield.in" },
];

// ============ WORKERS ============
export interface Worker {
  id: string;
  name: string;
  phone: string;
  platform: string;
  city: string;
  zone: string;
  tenure: number;
  dailyAvgEarnings: number;
  status: "active" | "inactive" | "suspended";
  lastActive: string;
}

export const workers: Worker[] = [
  { id: "W001", name: "Rahul Yadav", phone: "+91 98765 43210", platform: "Zomato", city: "Mumbai", zone: "Andheri West", tenure: 14, dailyAvgEarnings: 850, status: "active", lastActive: "2026-03-25" },
  { id: "W002", name: "Priya Kumari", phone: "+91 87654 32109", platform: "Zomato", city: "Delhi", zone: "Karol Bagh", tenure: 8, dailyAvgEarnings: 720, status: "active", lastActive: "2026-03-25" },
  { id: "W003", name: "Ramesh Pandey", phone: "+91 76543 21098", platform: "Blinkit", city: "Delhi", zone: "Dwarka", tenure: 22, dailyAvgEarnings: 980, status: "active", lastActive: "2026-03-24" },
  { id: "W004", name: "Sunita Devi", phone: "+91 65432 10987", platform: "Zomato", city: "Bengaluru", zone: "Koramangala", tenure: 5, dailyAvgEarnings: 650, status: "inactive", lastActive: "2026-03-20" },
  { id: "W005", name: "Vikash Kumar", phone: "+91 54321 09876", platform: "Swiggy", city: "Hyderabad", zone: "Madhapur", tenure: 11, dailyAvgEarnings: 790, status: "active", lastActive: "2026-03-25" },
  { id: "W006", name: "Anjali Singh", phone: "+91 43210 98765", platform: "Zomato", city: "Mumbai", zone: "Bandra", tenure: 3, dailyAvgEarnings: 600, status: "suspended", lastActive: "2026-03-15" },
  { id: "W007", name: "Deepak Sharma", phone: "+91 32109 87654", platform: "Swiggy", city: "Bengaluru", zone: "HSR Layout", tenure: 18, dailyAvgEarnings: 920, status: "active", lastActive: "2026-03-25" },
  { id: "W008", name: "Kavita Joshi", phone: "+91 21098 76543", platform: "Zomato", city: "Mumbai", zone: "Dadar", tenure: 9, dailyAvgEarnings: 770, status: "active", lastActive: "2026-03-24" },
];

// ============ POLICIES ============
export interface Policy {
  id: string;
  workerId: string;
  workerName: string;
  tier: "Starter" | "Standard" | "Pro";
  weeklyPremium: number;
  maxPayout: number;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
}

export const policies: Policy[] = [
  { id: "POL-001", workerId: "W001", workerName: "Rahul Yadav", tier: "Standard", weeklyPremium: 49, maxPayout: 2500, startDate: "2026-03-24", endDate: "2026-03-30", status: "active" },
  { id: "POL-002", workerId: "W002", workerName: "Priya Kumari", tier: "Starter", weeklyPremium: 29, maxPayout: 1500, startDate: "2026-03-24", endDate: "2026-03-30", status: "active" },
  { id: "POL-003", workerId: "W003", workerName: "Ramesh Pandey", tier: "Pro", weeklyPremium: 79, maxPayout: 4000, startDate: "2026-03-24", endDate: "2026-03-30", status: "active" },
  { id: "POL-004", workerId: "W005", workerName: "Vikash Kumar", tier: "Standard", weeklyPremium: 49, maxPayout: 2500, startDate: "2026-03-17", endDate: "2026-03-23", status: "expired" },
  { id: "POL-005", workerId: "W004", workerName: "Sunita Devi", tier: "Starter", weeklyPremium: 29, maxPayout: 1500, startDate: "2026-03-10", endDate: "2026-03-16", status: "cancelled" },
  { id: "POL-006", workerId: "W007", workerName: "Deepak Sharma", tier: "Pro", weeklyPremium: 79, maxPayout: 4000, startDate: "2026-03-24", endDate: "2026-03-30", status: "active" },
  { id: "POL-007", workerId: "W008", workerName: "Kavita Joshi", tier: "Standard", weeklyPremium: 49, maxPayout: 2500, startDate: "2026-03-24", endDate: "2026-03-30", status: "active" },
];

// ============ CLAIMS ============
export interface Claim {
  id: string;
  workerId: string;
  workerName: string;
  triggerType: string;
  triggerIcon: string;
  amount: number;
  status: "auto-approved" | "pending-review" | "rejected" | "paid";
  fraudScore: number;
  filedAt: string;
  resolvedAt?: string;
}

export const claims: Claim[] = [
  { id: "CLM-001", workerId: "W001", workerName: "Rahul Yadav", triggerType: "Heavy Rainfall", triggerIcon: "🌧️", amount: 350, status: "paid", fraudScore: 12, filedAt: "2026-03-23", resolvedAt: "2026-03-23" },
  { id: "CLM-002", workerId: "W002", workerName: "Priya Kumari", triggerType: "Curfew", triggerIcon: "🚧", amount: 420, status: "auto-approved", fraudScore: 8, filedAt: "2026-03-24" },
  { id: "CLM-003", workerId: "W003", workerName: "Ramesh Pandey", triggerType: "Severe AQI", triggerIcon: "😷", amount: 580, status: "pending-review", fraudScore: 65, filedAt: "2026-03-25" },
  { id: "CLM-004", workerId: "W005", workerName: "Vikash Kumar", triggerType: "Platform Outage", triggerIcon: "📵", amount: 280, status: "paid", fraudScore: 5, filedAt: "2026-03-22", resolvedAt: "2026-03-22" },
  { id: "CLM-005", workerId: "W006", workerName: "Anjali Singh", triggerType: "Extreme Heat", triggerIcon: "🌡️", amount: 450, status: "rejected", fraudScore: 88, filedAt: "2026-03-21", resolvedAt: "2026-03-22" },
  { id: "CLM-006", workerId: "W007", workerName: "Deepak Sharma", triggerType: "Heavy Rainfall", triggerIcon: "🌧️", amount: 520, status: "auto-approved", fraudScore: 15, filedAt: "2026-03-25" },
];

// ============ TRIGGERS ============
export interface TriggerEvent {
  id: string;
  type: string;
  icon: string;
  location: string;
  threshold: string;
  currentValue: string;
  status: "active" | "monitoring" | "resolved";
  affectedWorkers: number;
  detectedAt: string;
}

export const triggers: TriggerEvent[] = [
  { id: "TRG-001", type: "Heavy Rainfall", icon: "🌧️", location: "Mumbai - Andheri", threshold: "≥ 50mm/3hrs", currentValue: "72mm/3hrs", status: "active", affectedWorkers: 34, detectedAt: "2026-03-25 14:30" },
  { id: "TRG-002", type: "Severe AQI", icon: "😷", location: "Delhi - Dwarka", threshold: "AQI ≥ 400", currentValue: "AQI 438", status: "active", affectedWorkers: 28, detectedAt: "2026-03-25 08:00" },
  { id: "TRG-003", type: "Extreme Heat", icon: "🌡️", location: "Hyderabad - Madhapur", threshold: "≥ 45°C for 4hrs", currentValue: "43°C", status: "monitoring", affectedWorkers: 0, detectedAt: "2026-03-25 11:00" },
  { id: "TRG-004", type: "Platform Outage", icon: "📵", location: "Bengaluru - All Zones", threshold: "Down ≥ 2hrs", currentValue: "Recovered", status: "resolved", affectedWorkers: 156, detectedAt: "2026-03-24 19:45" },
  { id: "TRG-005", type: "Curfew / Strike", icon: "🚫", location: "Delhi - Karol Bagh", threshold: "Official Order", currentValue: "Active until 8PM", status: "active", affectedWorkers: 42, detectedAt: "2026-03-25 06:00" },
];

// ============ FRAUD ALERTS ============
export interface FraudAlert {
  id: string;
  workerId: string;
  workerName: string;
  type: string;
  riskScore: number;
  detectionLayer: string;
  description: string;
  status: "investigating" | "confirmed" | "cleared";
  detectedAt: string;
}

export const fraudAlerts: FraudAlert[] = [
  { id: "FRD-001", workerId: "W006", workerName: "Anjali Singh", type: "GPS Spoofing", riskScore: 92, detectionLayer: "L1: GPS Validation", description: "GPS location inconsistent with cell tower data. Worker claims disruption in Bandra but device pinged from Thane.", status: "confirmed", detectedAt: "2026-03-21" },
  { id: "FRD-002", workerId: "W003", workerName: "Ramesh Pandey", type: "Claim Frequency Anomaly", riskScore: 65, detectionLayer: "L3: Isolation Forest", description: "Worker filed 4 claims in 2 weeks — 3× zone average. Pattern under review.", status: "investigating", detectedAt: "2026-03-25" },
  { id: "FRD-003", workerId: "W005", workerName: "Vikash Kumar", type: "Time Anomaly", riskScore: 45, detectionLayer: "L4: Time Anomaly", description: "Claim filed at 3 AM for disruption at 2 PM. Timing irregular but within tolerance.", status: "cleared", detectedAt: "2026-03-22" },
];

// ============ CHART DATA ============
export const claimsChartData = [
  { week: "W1", claims: 12, payouts: 4200 },
  { week: "W2", claims: 18, payouts: 6300 },
  { week: "W3", claims: 8, payouts: 2800 },
  { week: "W4", claims: 24, payouts: 8400 },
  { week: "W5", claims: 15, payouts: 5250 },
  { week: "W6", claims: 21, payouts: 7350 },
  { week: "W7", claims: 30, payouts: 10500 },
  { week: "W8", claims: 19, payouts: 6650 },
];

export const premiumRevenueData = [
  { week: "W1", revenue: 14500, claims: 4200 },
  { week: "W2", revenue: 15200, claims: 6300 },
  { week: "W3", revenue: 16800, claims: 2800 },
  { week: "W4", revenue: 17500, claims: 8400 },
  { week: "W5", revenue: 18200, claims: 5250 },
  { week: "W6", revenue: 19100, claims: 7350 },
  { week: "W7", revenue: 20500, claims: 10500 },
  { week: "W8", revenue: 21200, claims: 6650 },
];
