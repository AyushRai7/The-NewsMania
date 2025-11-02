import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import summarizerRouter from "./Routes/summarizer.js";
import translateRouter from "./Routes/translate.js";
import authRouter from "./Routes/authrouter.js";
import productRouter from "./Routes/productrouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));
app.use(express.json());

app.use("/auth", authRouter);
app.use("/products", productRouter);
app.use("/summarizer", summarizerRouter);
app.use("/translate", translateRouter);

console.log("✅ Summarizer route mounted at /summarizer");
console.log("✅ Translate route mounted at /translate");

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
