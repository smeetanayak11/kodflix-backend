import express from "express";
import axios from "axios";
import { authRequired } from "../middleware/authMiddleware.js";

const router = express.Router();
const TMDB_BASE = "https://api.themoviedb.org/3";

async function tmdbGet(path, params = {}) {
  const url = `${TMDB_BASE}${path}`;

  const res = await axios.get(url, {
    params: {
      api_key: process.env.TMDB_KEY,
      language: "en-US",
      ...params
    }
  });

  return res.data;
}

// All TMDB routes are protected
router.use(authRequired);

router.get("/trending-movies", async (req, res) => {
  try {
    const data = await tmdbGet("/trending/movie/week");
    res.json(data);
  } catch (e) {
    console.error(e?.response?.data || e.message);
    res.status(500).json({ message: "Failed to fetch trending movies" });
  }
});

router.get("/popular", async (req, res) => {
  try {
    const data = await tmdbGet("/movie/popular");
    res.json(data);
  } catch {
    res.status(500).json({ message: "Failed to fetch popular movies" });
  }
});

router.get("/top-rated", async (req, res) => {
  try {
    const data = await tmdbGet("/movie/top_rated");
    res.json(data);
  } catch {
    res.status(500).json({ message: "Failed to fetch top rated movies" });
  }
});

router.get("/upcoming", async (req, res) => {
  try {
    const data = await tmdbGet("/movie/upcoming");
    res.json(data);
  } catch {
    res.status(500).json({ message: "Failed to fetch upcoming movies" });
  }
});

router.get("/action", async (req, res) => {
  try {
    const data = await tmdbGet("/discover/movie", { with_genres: 28 });
    res.json(data);
  } catch {
    res.status(500).json({ message: "Failed to fetch action movies" });
  }
});

router.get("/comedy", async (req, res) => {
  try {
    const data = await tmdbGet("/discover/movie", { with_genres: 35 });
    res.json(data);
  } catch {
    res.status(500).json({ message: "Failed to fetch comedy movies" });
  }
});

router.get("/trending-tv", async (req, res) => {
  try {
    const data = await tmdbGet("/trending/tv/week");
    res.json(data);
  } catch {
    res.status(500).json({ message: "Failed to fetch trending TV" });
  }
});

export default router;

