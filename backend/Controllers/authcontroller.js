const UserModel = require("../Models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Signup Controller
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "User already exists with that email.",
        success: false,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
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
};

// Login Controller
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(403).json({
        error: "Invalid username or password.",
        success: false,
      });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordEqual = await bcrypt.compare(password, user.password);
    if (!isPasswordEqual) {
      return res.status(403).json({
        error: "Invalid password.",
        success: false,
      });
    }

    // Generate a JWT token
    const jwtToken = jwt.sign(
      { username: user.username, _id: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      success: true,
      jwtToken,
      username: user.username,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { signup, login };
