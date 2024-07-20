const express = require("express");
const app = express();
const bodyParser = require("body-parser"); // Corrected typo
const cors = require("cors");
require("dotenv").config();
require("./Models/db");
const authRouter = require("./Routes/authrouter");
const productrouter=require('./Routes/productrouter')
const PORT = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());
app.use("/auth", authRouter);
app.use("/products", productrouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


