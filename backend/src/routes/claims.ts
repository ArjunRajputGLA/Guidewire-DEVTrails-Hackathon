import { Router } from "express";
import type { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// -------------------------------------------------------
// POST /api/claims/submit
// -------------------------------------------------------
router.post("/submit", async (req: Request, res: Response) => {
  try {
    const { 
      worker_id, 
      trigger_type, 
      trigger_icon, 
      amount
    } = req.body;

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
    } else if (amount > 1500) {
      fraudScore += 10;
    }

    // Ensure score does not exceed 100
    fraudScore = Math.min(fraudScore, 100);

    // 4. Auto-Adjudication Bounds
    let status = "pending-review";
    if (fraudScore <= 20) {
      // Automatically approved for low fraud scores
      status = "auto-approved";
    } else if (fraudScore <= 65) {
      // Requires admin intervention for medium scores
      status = "pending-review";
    } else {
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

  } catch (error) {
    console.error("Claim submission error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
