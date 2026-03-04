import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routes from "./routes/index.js";
import { initDb } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many login attempts, please try again later"
});

app.use("/api/auth/login", loginLimiter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", routes);

// Initialize database (non-blocking for Vercel)
if (process.env.DB_HOST) {
  initDb().catch(err => {
    console.error("Database initialization failed:", err.message);
  });
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`KodFlix API running on port ${PORT}`);
  });
}

export default app;

