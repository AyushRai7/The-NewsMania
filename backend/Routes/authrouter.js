const router = require("express").Router();
const { signup, login } = require("../Controllers/authcontroller");
const { signupValidation, loginValidation } = require("../Middlewares/authvalidation");
const User = require("../Models/user");
const extractUserIdFromToken = require("../Middlewares/ExtractUserId");

router.post("/login", loginValidation, login);

router.post("/signup", signupValidation, signup);

router.get("/bookmark", extractUserIdFromToken, async (req, res) => {
  const { userId } = req;
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
  const { userId } = req;
  const { article } = req.body;
  try {
    const user = await User.findById(userId);
    if (user) {
      const isBookmarked = user.bookmarkedArticles.some(
        (item) => item.url === article.url
      );
      if (!isBookmarked) {
        user.bookmarkedArticles.push(article);
        await user.save();
        res.status(200).json({ message: "Article bookmarked successfully" });
      } else {
        res.status(400).json({ message: "Article already bookmarked" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/removeBookmark", extractUserIdFromToken, async (req, res) => {
  const { userId } = req;
  const { articleUrl } = req.body;
  try {
    const user = await User.findById(userId);
    if (user) {
      user.bookmarkedArticles = user.bookmarkedArticles.filter(
        (item) => item.url !== articleUrl
      );
      await user.save();
      res.status(200).json({ message: "Bookmark removed successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
