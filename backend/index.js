const express = require("express");
const app = express();
const axios = require('axios');
require('dotenv').config();
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
app.get('/api/news', async (req, res) => {
  try {
    const { category = 'general', searchTerm = '', isSearching = false } = req.query;
    const apiKey = process.env.NEWS_API_KEY;
    const endpoint = isSearching
      ? `https://newsapi.org/v2/everything?q=${searchTerm}&language=en&apiKey=${apiKey}`
      : `https://newsapi.org/v2/top-headlines?country=in&category=${category}&language=en&apiKey=${apiKey}`;

    const response = await axios.get(endpoint);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({ message: 'Failed to fetch news, try again later' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
