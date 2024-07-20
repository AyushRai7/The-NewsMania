const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  bookmarkedArticles: [
    {
      title: String,
      description: String,
      url: String,
      urlToImage: String,
    },
  ],
});

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
