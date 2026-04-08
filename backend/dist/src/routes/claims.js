"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_js_1 = require("@supabase/supabase-js");
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
const supabaseAdmin = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// -------------------------------------------------------
// Helper: Create Notification
// -------------------------------------------------------
async function createNotification(userId, title, message, type = "info") {
    try {
        await supabaseAdmin.from("notifications").insert([{
                user_id: userId,
                title,
                message,
                type
            }]);
    }
    catch (error) {
        console.error("Failed to create notification:", error);
    }
}
async function generateExplanation(fraud_score, reasons) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return "Your claim requires further review based on our standard checks.";
        }
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Act as a helpful and professional automated assistant explaining an insurance claim rejection to a delivery worker.

Fraud Score: ${fraud_score}/100.
Reasons for failure:
${reasons.length > 0 ? reasons.map((r) => "- " + r).join("\n") : "- General review criteria not met."}

Write a very brief, compact explanation (maximum 2-3 lines). Be professional and nice. Explicitly mention the fraud score and summarize the reasons. Do not add long greetings or closings. Keep it extremely concise.`;
        const result = await model.generateContent(prompt, { timeout: 10000 });
        return result.response.text();
    }
    catch (error) {
        console.error("Gemini API error:", error);
        return "Your claim requires further review based on our standard checks.";
    }
}
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
        if (!response || !response.data || !response.data.weather) {
            return 0;
        }
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
                return res.status(400).json({ status: "error", message: `Claim denied: Your current location (${location.city}) does not match your registered location (${userProfile.city}).` });
            }
        }
        // 4. Fraud Score Calculation
        const fraudScore = 0.25 * locationRisk +
            0.25 * weatherMismatch +
            0.20 * claimFrequency +
            0.15 * timePattern +
            0.15 * behaviorScore;
        // 5. Initial Decision Logic (Might be overridden by database triggers)
        let initialStatus = "rejected";
        if (fraudScore < 0.3) {
            initialStatus = "approved";
        }
        else if (fraudScore < 0.6) {
            initialStatus = "review";
        }
        // Store claim in DB FIRST so the database trigger calculates its final bounds
        const newClaim = {
            worker_id: user_id,
            trigger_type: disruption_type,
            trigger_icon: trigger_icon || "⚠️",
            fraud_score: Math.round(Math.min(fraudScore * 100, 100)), // base metrics
            status: initialStatus,
            amount: amount || 100 // Client overrides or default 100
        };
        const { data: insertedClaim, error: insertError } = await supabaseAdmin
            .from("claims")
            .insert([newClaim])
            .select()
            .single();
        if (insertError)
            throw insertError;
        // Retrieve the actual computed status and score from the table
        const finalStatus = insertedClaim.status;
        const finalScore = insertedClaim.fraud_score;
        // Compile dynamic fallback reasons if the trigger escalated the risk invisibly
        if (finalScore > 20 && finalScore > fraudScore * 100) {
            if (amount > 1500)
                reasons.push("Unusually high claim amount requested.");
            reasons.push("Excessive claim frequency within the last month.");
        }
        let explanation = "Claim approved successfully";
        if (finalStatus === "rejected" || finalStatus === "pending-review" || finalStatus === "review") {
            explanation = await generateExplanation(finalScore, reasons);
        }
        // Backfill explanation string
        if (explanation) {
            await supabaseAdmin
                .from("claims")
                .update({ explanation })
                .eq("id", insertedClaim.id);
        }
        // 6. Trigger Real-Time Notification
        await createNotification(user_id, "Claim Submitted", "Your claim has been submitted successfully.", "info");
        if (finalStatus === "approved" || finalStatus === "auto-approved" || finalStatus === "paid") {
            await createNotification(user_id, "Claim Approved", "Your claim has been approved and payout initiated.", "success");
            await createNotification(user_id, "Payout Completed", `Amount of ₹${amount || 100} has been credited successfully.`, "success");
        }
        else if (finalStatus === "rejected") {
            await createNotification(user_id, "Claim Rejected", explanation || "Your claim was rejected.", "error");
        }
        else {
            await createNotification(user_id, "Claim Under Review", "Your claim is currently under manual review.", "info");
        }
        return res.status(200).json({
            status: finalStatus,
            fraud_score: finalScore,
            explanation,
            message: finalStatus === "paid" || finalStatus === "auto-approved" || finalStatus === "approved" ? "Claim approved" : "Claim rejected or requires further review",
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
        const finalStatus = insertedClaim.status;
        await createNotification(worker_id, "Claim Submitted", "Your claim has been submitted successfully.", "info");
        if (finalStatus === "approved" || finalStatus === "auto-approved" || finalStatus === "paid") {
            await createNotification(worker_id, "Claim Approved", "Your claim has been approved and payout initiated.", "success");
            await createNotification(worker_id, "Payout Completed", `Amount of ₹${amount} has been credited successfully.`, "success");
        }
        else if (finalStatus === "rejected") {
            await createNotification(worker_id, "Claim Rejected", "Your claim was rejected.", "error");
        }
        else {
            await createNotification(worker_id, "Claim Under Review", "Your claim is currently under manual review.", "info");
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
