-- Fraud score and auto-adjudication trigger for the claims table

-- 1. Create the function that calculates the score and sets the status
CREATE OR REPLACE FUNCTION public.calculate_claim_fraud_score()
RETURNS TRIGGER AS $$
DECLARE
    recent_claims_count INT;
    total_score NUMERIC := 0;
BEGIN
    -- Base score is 0
    
    -- Factor 1: Claim Frequency (e.g., claims in the last 30 days by this worker)
    SELECT count(*) INTO recent_claims_count
    FROM public.claims
    WHERE worker_id = NEW.worker_id
      AND created_at >= NOW() - INTERVAL '30 days';

    -- Add points based on frequency (e.g., 15 points per recent claim)
    total_score := total_score + (recent_claims_count * 15);

    -- Factor 2: High Amount Threshold
    -- If the claim amount is excessively high, add some risk points
    IF NEW.amount > 3000 THEN
        total_score := total_score + 25;
    ELSIF NEW.amount > 1500 THEN
        total_score := total_score + 10;
    END IF;

    -- Ensure score stays between 0 and 100
    IF total_score > 100 THEN
        total_score := 100;
    END IF;

    NEW.fraud_score := total_score;

    -- Apply the bounds to determine the status
    IF NEW.fraud_score BETWEEN 0 AND 20 THEN
        NEW.status := 'paid';
    ELSIF NEW.fraud_score BETWEEN 21 AND 65 THEN
        NEW.status := 'pending-review';
    ELSE
        NEW.status := 'rejected';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Attach the trigger to the claims table
-- Drop the trigger if it already exists to allow safe re-runs
DROP TRIGGER IF EXISTS trg_calculate_fraud_score ON public.claims;

CREATE TRIGGER trg_calculate_fraud_score
BEFORE INSERT ON public.claims
FOR EACH ROW
EXECUTE FUNCTION public.calculate_claim_fraud_score();
