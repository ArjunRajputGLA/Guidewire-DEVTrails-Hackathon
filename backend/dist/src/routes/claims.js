"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
const supabaseAdmin = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function validateLocation(lat, lon) {
    try {
        const response = await axios_1.default.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
            headers: {
                "User-Agent": "Guidewire-DEVTrails-Hackathon",
            },
        });
        if (!response.data || !response.data.address) {
            return null;
        }
        const { city, state, country } = response.data.address;
        return {
            displayName: response.data.display_name,
            city: city || response.data.address.town || response.data.address.village,
            state,
            country,
        };
    }
    catch (error) {
        console.error("Nominatim API error:", error);
        return null;
    }
}
async function checkWeather(lat, lon, disruptionType) {
    try {
        const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
        if (!WEATHER_API_KEY)
            return 0; // Skip if no API key
        const response = await axios_1.default.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`);
        const weatherConditions = response.data.weather.map((w) => w.main.toLowerCase());
        let mismatch = 1;
        if (disruptionType.toLowerCase().includes("rain") && weatherConditions.includes("rain"))
            mismatch = 0;
        if (disruptionType.toLowerCase().includes("snow") && weatherConditions.includes("snow"))
            mismatch = 0;
        if (disruptionType.toLowerCase().includes("storm") && (weatherConditions.includes("thunderstorm") || weatherConditions.includes("rain")))
            mismatch = 0;
        if (disruptionType.toLowerCase().includes("heat") && weatherConditions.includes("clear"))
            mismatch = 0;
        return mismatch;
    }
    catch (error) {
        console.error("OpenWeather API error:", error);
        return 0; // Default to no mismatch if API fails
    }
}
// -------------------------------------------------------
// POST /api/claims
// -------------------------------------------------------
router.post("/", async (req, res) => {
    try {
        const { user_id, lat, lon, disruption_type, amount, trigger_icon } = req.body;
        if (!user_id || lat === undefined || lon === undefined || !disruption_type) {
            return res.status(400).json({ status: "error", message: "Missing required fields" });
        }
        // 1. Location Validation
        const location = await validateLocation(lat, lon);
        if (!location) {
            return res.status(400).json({ status: "error", message: "Invalid location" });
        }
        // Initialize fraud reasons
        const reasons = [];
        // 2. Weather Mismatch Calculation
        const weatherMismatch = await checkWeather(lat, lon, disruption_type);
        if (weatherMismatch > 0)
            reasons.push("Weather condition does not match disruption type");
        // 3. Claim Frequency Check
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { count: recentClaimsCount } = await supabaseAdmin
            .from("claims")
            .select("*", { count: "exact", head: true })
            .eq("worker_id", user_id)
            .gte("created_at", sevenDaysAgo.toISOString());
        const claimFrequency = Math.min((recentClaimsCount || 0) / 5, 1);
        if (claimFrequency > 0.5)
            reasons.push("High claim frequency in the last 7 days");
        // Default factors if not calculable
        let locationRisk = 0; // distance mismatch
        const timePattern = 0;
        const behaviorScore = 0;
        // Compare with Onboarding Location
        const { data: userProfile } = await supabaseAdmin
            .from("worker_profiles")
            .select("city, state")
            .eq("id", user_id)
            .single();
        if (userProfile && location.city) {
            const onboardCity = userProfile.city?.toLowerCase() || "";
            const claimCity = location.city.toLowerCase();
            if (onboardCity && !claimCity.includes(onboardCity) && !onboardCity.includes(claimCity)) {
                locationRisk = 1; // High risk if city doesn't match
                reasons.push("Claim location city does not match registered onboarding city");
            }
        }
        // 4. Fraud Score Calculation
        const fraudScore = 0.25 * locationRisk +
            0.25 * weatherMismatch +
            0.20 * claimFrequency +
            0.15 * timePattern +
            0.15 * behaviorScore;
        // 5. Decision Logic
        let status = "rejected";
        if (fraudScore < 0.3) {
            status = "approved";
        }
        else if (fraudScore < 0.6) {
            status = "review";
        }
        // Store claim in DB
        const newClaim = {
            worker_id: user_id,
            trigger_type: disruption_type,
            trigger_icon: trigger_icon || "⚠️",
            fraud_score: Math.round(Math.min(fraudScore * 100, 100)), // storing as percentage
            status,
            amount: amount || 100 // Client overrides or default 100
        };
        const { error: insertError } = await supabaseAdmin
            .from("claims")
            .insert([newClaim]);
        if (insertError)
            throw insertError;
        return res.status(200).json({
            status,
            fraud_score: fraudScore,
            message: status === "approved" ? "Claim approved" : status === "review" ? "Claim under review" : "Claim rejected",
            reasons
        });
    }
    catch (error) {
        console.error("Claim submission error:", error);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
// -------------------------------------------------------
// POST /api/claims/submit
// -------------------------------------------------------
router.post("/submit", async (req, res) => {
    try {
        const { worker_id, trigger_type, trigger_icon, amount } = req.body;
        if (!worker_id || !trigger_type || !amount) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        let fraudScore = 0;
        // 1. Frequency Check (claims in the last 30 days by this worker)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { count, error: countError } = await supabaseAdmin
            .from("claims")
            .select("*", { count: "exact", head: true })
            .eq("worker_id", worker_id)
            .gte("created_at", thirtyDaysAgo.toISOString());
        if (!countError && count !== null) {
            fraudScore += count * 15; // 15 points per recent claim
        }
        // 3. High Amount Threshold
        if (amount > 3000) {
            fraudScore += 25;
        }
        else if (amount > 1500) {
            fraudScore += 10;
        }
        // Ensure score does not exceed 100
        fraudScore = Math.min(fraudScore, 100);
        // 4. Auto-Adjudication Bounds
        let status = "pending-review";
        if (fraudScore <= 20) {
            // Automatically approved for low fraud scores
            status = "auto-approved";
        }
        else if (fraudScore <= 65) {
            // Requires admin intervention for medium scores
            status = "pending-review";
        }
        else {
            // Automatically rejected for high scores
            status = "rejected";
        }
        // 5. Insert the claim into Supabase
        const newClaim = {
            worker_id,
            trigger_type,
            trigger_icon: trigger_icon || "⚠️",
            amount,
            fraud_score: fraudScore,
            status
        };
        const { data: insertedClaim, error: insertError } = await supabaseAdmin
            .from("claims")
            .insert([newClaim])
            .select()
            .single();
        if (insertError) {
            console.error("Insert error:", insertError);
            return res.status(500).json({ error: "Failed to insert claim" });
        }
        return res.status(200).json({
            message: "Claim submitted successfully",
            claim: insertedClaim
        });
    }
    catch (error) {
        console.error("Claim submission error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
