import express from "express";
const router = express.Router();
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

import { signupValidation, loginValidation } from "../Middlewares/authvalidation.js";
import User from "../Models/user.js";
import extractUserIdFromToken from "../Middlewares/ExtractUserId.js";


router.post("/login", loginValidation, async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(403).json({
        error: "Invalid username or password.",
        success: false,
      });
    }

    const isPasswordEqual = await bcrypt.compare(password, user.password);
    if (!isPasswordEqual) {
      return res.status(403).json({
        error: "Invalid password.",
        success: false,
      });
    }

    const jwtToken = jwt.sign(
      { username: user.username, _id: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    // ✅ SET JWT IN COOKIE
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in prod
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // ❌ Do NOT send token in response
    res.status(200).json({
      message: "Login successful",
      success: true,
      username: user.username,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.post("/signup", signupValidation, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "User already exists with that email.",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      message: "Signup successful",
      success: true,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/bookmark", extractUserIdFromToken, async (req, res) => {
  const  userId  = req.user._id;
  try {
    const user = await User.findById(userId);
    if (user) {
      res.status(200).json(user.bookmarkedArticles);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/bookmark", extractUserIdFromToken, async (req, res) => {
  const userId = req.user._id;
  const { article } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isBookmarked = user.bookmarkedArticles.some(
      (item) => item.url === article.url
    );

    if (isBookmarked) {
      return res.status(400).json({ message: "Article already bookmarked" });
    }

    // ✅ Store ONLY url & image
    user.bookmarkedArticles.push({
      url: article.url,
      image: article.image || "",
      title: article.title || "", // safe fallback
    });

    await user.save();
    res.status(200).json({ message: "Article bookmarked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


router.post("/removeBookmark", extractUserIdFromToken, async (req, res) => {
  const userId = req.user._id;
  const { articleUrl } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter out the bookmarked article by URL
    const initialLength = user.bookmarkedArticles.length;
    user.bookmarkedArticles = user.bookmarkedArticles.filter(
      (item) => item.url !== articleUrl
    );

    if (user.bookmarkedArticles.length === initialLength) {
      return res.status(400).json({ message: "Bookmark not found" });
    }

    await user.save();
    res.status(200).json({ message: "Bookmark removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


router.get("/checkAuth", extractUserIdFromToken, (req, res) => {
  if (req.user) {
    res.status(200).json({ message: "Authenticated", username: req.user.username });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});


export default router;
