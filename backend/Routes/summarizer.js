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
    console.log(`Fetching article from: ${url}`);

    const pageResponse = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsSummarizer/1.0)" },
    });
    const html = await pageResponse.text();

    const $ = cheerio.load(html);
    let articleText = "";
    $("p, h1, h2").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 50) articleText += text + " ";
    });

    if (articleText.length < 200) {
      return res.status(400).json({ message: "Not enough content extracted" });
    }

    const MAX_CHARS = 3500; 
    if (articleText.length > MAX_CHARS) {
      articleText = articleText.slice(0, MAX_CHARS);
      console.log("✂️ Truncated article text to fit model limits");
    }
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Summarize this news article in 8–10 clear, factual sentences:\n\n${articleText}`,
          parameters: { max_length: 350, min_length: 100, temperature: 0.7 },
        }),
      }
    );

    const data = await hfResponse.json();

    if (data.error) {
      console.error("❌ Hugging Face API Error:", data.error);
      return res.status(500).json({ message: "Summary unavailable due to model limit" });
    }

    const summary = data[0]?.summary_text || "Summary not available";
    res.json({ summary });
  } catch (err) {
    console.error("🔥 Summarization error:", err);
    res.status(500).json({ message: "Failed to summarize article" });
  }
});

export default router;
