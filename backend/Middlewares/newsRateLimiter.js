import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../redisClient.js";

export const newsRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 5, 
  standardHeaders: true,
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),

  message: {
    message: "Too many requests. Please try again later.",
  },
});
