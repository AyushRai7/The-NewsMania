const jwt = require('jsonwebtoken');

const extractUserIdFromToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from 'Bearer <token>'
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.userId = decoded._id; // Add userId to request object
      next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    return res.status(401).json({ message: "Token not provided" });
  }
};

module.exports = extractUserIdFromToken;
