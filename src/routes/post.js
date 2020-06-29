//UNDER CONSTRUCTION

const express = require("express");
const router = express.Router();
const {
  getPosts,
  addPost,
} = require("../controllers/post");
const { protect } = require("../middlewares/auth");

router.route("/").get(getPosts).post(protect, addPost);

module.exports = router;
