const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
require("./Models/db");
const authRouter = require("./Routes/authrouter");
const productRouter = require("./Routes/productrouter");
const PORT = process.env.PORT || 5001;

app.use(bodyParser.json());
app.use(cors());
app.use("/auth", authRouter);
app.use("/products", productRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
