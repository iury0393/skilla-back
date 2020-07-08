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
router.get("/:id/togglelike", protect, toggleLike);
router.post("/:id/comments", protect, addComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);

module.exports = router;