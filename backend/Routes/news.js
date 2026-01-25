import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { newsRateLimiter } from "../Middlewares/newsRateLimiter.js";

dotenv.config();

const router = express.Router();

router.get("/", newsRateLimiter, async (req, res) => {
  const { category, search } = req.query;

  try {
    let url = `http://api.mediastack.com/v1/news?access_key=${process.env.NEWS_API_KEY}&languages=en&countries=in`;

    if (search) {
      url += `&keywords=${encodeURIComponent(search)}`;
    }

    if (category) {
      url += `&categories=${category}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data.data) {
      return res.status(500).json({ message: "Failed to fetch news" });
    }

    res.json({
      articles: data.data,
    });
  } catch (err) {
    console.error("News API error:", err);
    res.status(500).json({ message: "Server error while fetching news" });
  }
});

export default router;
