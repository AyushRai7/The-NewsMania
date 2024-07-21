const express = require("express");
const app = express();
const bodyParser = require("body-parser"); // Corrected typo
const cors = require("cors");
require("dotenv").config();
require("./Models/db");
const authRouter = require("./Routes/authrouter");
const productrouter=require('./Routes/productrouter')
const PORT = process.env.PORT;
const path=require("path");

app.use(bodyParser.json());
app.use(cors());
app.use("/auth", authRouter);
app.use("/products", productrouter);

app.get("/", (req,res)=>{
  app.use(express.static(path.resolve(__dirname, "frontend", "dist")));
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


