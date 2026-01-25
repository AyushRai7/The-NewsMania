import express from "express";
import fetch from "node-fetch";
import crypto from "crypto";
import redisClient from "../redisClient.js";

const router = express.Router();

const hashText = (value) => {
  return crypto.createHash("sha256").update(value).digest("hex");
};

router.post("/", async (req, res) => {
  const { title, text, targetLang } = req.body;

  if (!title || !text || !targetLang) {
    return res.status(400).json({ message: "Missing title, text, or targetLang" });
  }

  const textHash = hashText(text);
  const titleHash = hashText(title);

  const cacheKey = `translation:${textHash}:${titleHash}:lang:${targetLang}`;

  const cachedTranslation = await redisClient.get(cacheKey);
  if (cachedTranslation) {
    console.log("✅ Served translation from Redis");
    return res.json(JSON.parse(cachedTranslation));
  }

  const chunks = [];
  for (let i = 0; i < text.length; i += 450) {
    chunks.push(text.slice(i, i + 450));
  }

  try {
    const translations = [];

    for (const chunk of chunks) {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        chunk
      )}&langpair=en|${targetLang}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data.responseData)
        throw new Error("Failed to get translation from MyMemory");

      translations.push(data.responseData.translatedText);
    }

    const translatedText = translations.join(" ");

    const titleUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      title
    )}&langpair=en|${targetLang}`;

    const titleResponse = await fetch(titleUrl);
    const titleData = await titleResponse.json();

    const translatedTitle = titleData.responseData
      ? titleData.responseData.translatedText
      : title;

    const responsePayload = {
      translatedTitle,
      translatedText,
    };

    await redisClient.set(cacheKey, JSON.stringify(responsePayload), {
      EX: 60 * 60, // 1 hour TTL
    });

    res.json(responsePayload);
  } catch (err) {
    console.error("Translation error:", err);
    res.status(500).json({ message: "Translation failed" });
  }
});

export default router;
