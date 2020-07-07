const express = require("express");
const router = express.Router();
const {
  getPosts,
  getPost,
  addPost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
} = require("../controllers/post");
const { protect } = require("../middlewares/auth");

router.route("/").get(getPosts).post(protect, addPost);
router.route("/:id").get(protect, getPost).delete(protect, deletePost);
router.route("/:id/togglelike").get(protect, toggleLike);
router.route("/:id/comments").post(protect, addComment);
router.route("/:id/comments/:commentId").delete(protect, deleteComment);

module.exports = router;