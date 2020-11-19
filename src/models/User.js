const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Digite seu nome completo"],
    trim: true,
  },
  username: {
    type: String,
    required: [true, "Digite seu nome de usuário"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Digite seu e-mail"],
    trim: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Digite sua senha"],
    minlength: [6, "Senhas devem ser no mínimo 6 caracteres"],
    maxlength: [12, "Senhas devem ser no máximo 12 caracteres"],
  },
  avatar: {
    type: String,
    default:
      "https://res.cloudinary.com/duujebpq4/image/upload/v1593622790/profilePic_r6aau3.jpg",
  },
  bio: String,
  website: String,
  followers: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  followersCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
  following: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  posts: [{ type: mongoose.Schema.ObjectId, ref: "Post" }],
  postCount: {
    type: Number,
    default: 0,
  },
  savedPosts: [{ type: mongoose.Schema.ObjectId, ref: "Post" }],
  notification: [{ type: mongoose.Schema.ObjectId, ref: "Notification" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
//Encripta a senha antes de salvar no banco
UserSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
//Pega o token gerado no registro do novo usuário
UserSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
//Checa a senha quando for fazer o login
UserSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
