import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: "Article URL is required" });
  }

  try {
    console.log("Fetching article:", url);

    const pageRes = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!pageRes.ok) {
      return res.status(400).json({
        message: "Failed to fetch article page",
      });
    }

    const html = await pageRes.text();

    const $ = cheerio.load(html);
    let articleText = "";

    $("p").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 50) {
        articleText += text + " ";
      }
    });

    console.log("Extracted chars:", articleText.length);

    if (articleText.length < 200) {
      return res.status(400).json({
        message: "Not enough content extracted",
      });
    }

    const MAX_CHARS = 3000;
    if (articleText.length > MAX_CHARS) {
      articleText = articleText.slice(0, MAX_CHARS);
      console.log("Truncated article text");
    }

    const hfRes = await fetch(
      "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: articleText,
          parameters: {
            max_length: 200,
            min_length: 80,
            do_sample: false,
          },
        }),
      }
    );

    const raw = await hfRes.text();

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      console.error("❌ Non-JSON HF response:", raw);
      return res.status(502).json({
        message: "Summarizer service returned invalid data",
      });
    }

    if (data?.error) {
      console.error("HF API Error:", data.error);
      return res.status(502).json({
        message: data.error,
      });
    }

    if (!Array.isArray(data) || !data[0]?.summary_text) {
      console.error("Unexpected HF format:", data);
      return res.status(502).json({
        message: "Failed to generate summary",
      });
    }

    res.json({
      summary: data[0].summary_text,
    });
  } catch (err) {
    console.error("Summarizer error:", err);
    res.status(500).json({
      message: "Failed to summarize article",
    });
  }
});

export default router;
