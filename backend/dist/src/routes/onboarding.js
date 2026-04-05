"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/onboarding.ts
// Place at: GitShield/backend/src/routes/onboarding.ts
const express_1 = require("express");
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
const supabaseAdmin = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
// -------------------------------------------------------
// POST /api/onboarding/verify-upi
// -------------------------------------------------------
router.post('/verify-upi', async (req, res) => {
    const { upi_id } = req.body;
    if (!upi_id || !upi_id.includes('@')) {
        res.status(400).json({ error: 'Invalid UPI ID format' });
        return;
    }
    try {
        const isValid = /^[a-zA-Z0-9._-]+@[a-zA-Z]+$/.test(upi_id);
        if (!isValid) {
            res.status(400).json({ error: 'Invalid UPI ID', verified: false });
            return;
        }
        res.json({ verified: true, upi_id, message: 'UPI ID verified successfully' });
    }
    catch {
        res.status(500).json({ error: 'Verification failed' });
    }
});
// -------------------------------------------------------
// POST /api/onboarding/calculate-premium
// -------------------------------------------------------
router.post('/calculate-premium', async (req, res) => {
    const { avg_daily_earnings, working_days, city_zone, tenure_months, } = req.body;
    const weekly = avg_daily_earnings * working_days;
    let tier = 'standard';
    let basePremium = 49;
    let maxPayout = 2500;
    if (weekly < 3500) {
        tier = 'starter';
        basePremium = 29;
        maxPayout = 1500;
    }
    else if (weekly >= 5500) {
        tier = 'pro';
        basePremium = 79;
        maxPayout = 4000;
    }
    const HIGH_RISK_CITIES = ['Mumbai', 'Delhi', 'Chennai', 'Kolkata'];
    const MED_RISK_CITIES = ['Bengaluru', 'Hyderabad', 'Pune', 'Noida', 'Gurgaon'];
    let zoneMultiplier = 0.8;
    const zone = city_zone.toLowerCase();
    if (HIGH_RISK_CITIES.some(c => zone.includes(c.toLowerCase()))) {
        zoneMultiplier = 1.3;
    }
    else if (MED_RISK_CITIES.some(c => zone.includes(c.toLowerCase()))) {
        zoneMultiplier = 1.0;
    }
    const month = new Date().getMonth() + 1;
    const seasonFactor = [6, 7, 8, 9].includes(month) ? 1.15 : 1.0;
    const tenureFactor = tenure_months < 3 ? 1.1 : tenure_months > 12 ? 0.95 : 1.0;
    const finalPremium = Math.round(basePremium * zoneMultiplier * seasonFactor * tenureFactor);
    res.json({
        tier,
        base_premium: basePremium,
        final_premium: finalPremium,
        max_weekly_payout: maxPayout,
        multipliers: { zone: zoneMultiplier, season: seasonFactor, tenure: tenureFactor },
        coverage_rate: 0.6,
    });
});
// -------------------------------------------------------
// POST /api/onboarding/complete
// -------------------------------------------------------
router.post('/complete', async (req, res) => {
    const { user_id } = req.body;
    if (!user_id) {
        res.status(400).json({ error: 'user_id required' });
        return;
    }
    const [profile, kyc, gig, income, payment] = await Promise.all([
        supabaseAdmin.from('worker_profiles').select('id, mobile_verified').eq('id', user_id).single(),
        supabaseAdmin.from('kyc_documents').select('id').eq('worker_id', user_id).single(),
        supabaseAdmin.from('gig_profiles').select('id').eq('id', user_id).single(),
        supabaseAdmin.from('income_data').select('id').eq('worker_id', user_id).single(),
        supabaseAdmin.from('payment_info').select('id').eq('worker_id', user_id).single(),
    ]);
    const missing = [];
    if (!profile.data)
        missing.push('profile');
    if (!kyc.data)
        missing.push('kyc_documents');
    if (!gig.data)
        missing.push('gig_profile');
    if (!income.data)
        missing.push('income_data');
    if (!payment.data)
        missing.push('payment_info');
    if (missing.length > 0) {
        res.status(400).json({ error: 'Onboarding incomplete', missing });
        return;
    }
    res.json({ success: true, message: 'Onboarding verified and complete' });
});
exports.default = router;
