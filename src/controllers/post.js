//UNDER CONSTRUCTION

const mongoose = require("mongoose");
const Post = require("../models/Post");
const asyncHandler = require("../middlewares/asyncHandler");

exports.getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find();

  res.status(200).json({ success: true, data: posts });
});