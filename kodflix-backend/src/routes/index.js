import express from "express";
import authRoutes from "./authRoutes.js";
import tmdbRoutes from "./tmdbRoutes.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/tmdb", tmdbRoutes);

router.get("/protected-example", authRequired, (req, res) => {
  res.json({ message: "You are authenticated", user: req.user });
});

export default router;

