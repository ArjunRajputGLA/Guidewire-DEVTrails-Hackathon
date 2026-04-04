import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import onboardingRoutes from "./src/routes/onboarding";
import claimsRoutes from "./src/routes/claims";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/claims", claimsRoutes);

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});