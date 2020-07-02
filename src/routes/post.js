const express = require("express");
const router = express.Router();
const {
  getPosts,
  getPost,
  addPost,
  deletePost,
  toggleLike,//EM CONSTRUÇÃO
  toggleSave,//EM CONSTRUÇÃO
  addComment,//EM CONSTRUÇÃO
  deleteComment,//EM CONSTRUÇÃO
  searchPost,//EM CONSTRUÇÃO
} = require("../controllers/post");
const { protect } = require("../middlewares/auth");

router.route("/").get(getPosts).post(protect, addPost);
router.route("/search").get(searchPost);//EM CONSTRUÇÃO
router.route("/:id").get(protect, getPost).delete(protect, deletePost);
router.route("/:id/togglelike").get(protect, toggleLike);//EM CONSTRUÇÃO
router.route("/:id/togglesave").get(protect, toggleSave);//EM CONSTRUÇÃO
router.route("/:id/comments").post(protect, addComment);//EM CONSTRUÇÃO
router.route("/:id/comments/:commentId").delete(protect, deleteComment);//EM CONSTRUÇÃO

module.exports = router;