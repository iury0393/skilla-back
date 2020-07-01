require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Comment = require("./models/Comment");
const Post = require("./models/Post");

mongoose.connect(process.env.MONGOURI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const deleteData = async () => {
  try {
    await User.deleteMany();
    await Comment.deleteMany();
    await Post.deleteMany();
    console.log("Deletando a data...");
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === "-d") {
  deleteData();
} else {
  console.log("Sem informações necessárias");
  process.exit(1);
}
