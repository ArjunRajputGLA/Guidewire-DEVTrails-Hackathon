"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const onboarding_1 = __importDefault(require("./src/routes/onboarding"));
const claims_1 = __importDefault(require("./src/routes/claims"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use("/api/onboarding", onboarding_1.default);
app.use("/api/claims", claims_1.default);
app.get("/", (req, res) => {
    res.send("Backend running 🚀");
});
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
