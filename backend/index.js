import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Models/db.js";
import cookieParser from "cookie-parser";

import summarizerRouter from "./Routes/summarizer.js";
import translateRouter from "./Routes/translate.js";
import authRouter from "./Routes/authrouter.js";
import newsRoutes from "./Routes/news.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRouter);
app.use("/summarizer", summarizerRouter);
app.use("/translate", translateRouter);
app.use("/api/news", newsRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
export default app;