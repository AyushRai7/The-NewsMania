const mongoose = require("mongoose");

const mongoURL =
  "mongodb+srv://newsmania:iPYsvpVKiYC2t68y@clusternewsmania.0x8it46.mongodb.net/newsmania_db?retryWrites=true&w=majority&appName=ClusterNewsmania";

mongoose
  .connect(mongoURL)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

//iPYsvpVKiYC2t68y  