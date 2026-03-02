import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();
const SALT_ROUNDS = 10;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function setAuthCookie(res, payload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: ONE_DAY_MS
  });

  return token;
}

router.post("/signup", async (req, res) => {
  const { full_name, username, email, phone, password } = req.body;

  if (!full_name || !username || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const conn = await pool.getConnection();

    try {
      const [existing] = await conn.query(
        "SELECT id FROM users WHERE username = ? OR email = ?",
        [username, email]
      );

      if (existing.length > 0) {
        return res
          .status(409)
          .json({ message: "Username or email already in use" });
      }

      const hashed = await bcrypt.hash(password, SALT_ROUNDS);

      const [result] = await conn.query(
        "INSERT INTO users (full_name, username, email, phone, password, role) VALUES (?, ?, ?, ?, ?, 'USER')",
        [full_name, username, email, phone || null, hashed]
      );

      return res
        .status(201)
        .json({ message: "User created", userId: result.insertId });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  try {
    const conn = await pool.getConnection();

    try {
      const [rows] = await conn.query("SELECT * FROM users WHERE username = ?", [
        username
      ]);

      if (rows.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      setAuthCookie(res, {
        id: user.id,
        username: user.username,
        role: user.role
      });

      return res.json({
        message: "Logged in",
        user: {
          id: user.id,
          full_name: user.full_name,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });

  res.json({ message: "Logged out" });
});

router.get("/me", (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

export default router;

