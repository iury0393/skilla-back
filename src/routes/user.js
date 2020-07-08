const express = require("express");
const { celebrate, Segments, Joi } = require('celebrate');
const router = express.Router();
const {
  getUsers,
  getUser,
  follow,
  unfollow,
  feed,
  editUser,
} = require("../controllers/user");
const { protect } = require("../middlewares/auth");

router.get("/", protect, getUsers);
router.put("/", protect, editUser);
router.get("/feed", protect, feed);
router.get("/:username", protect, getUser);
router.get("/:id/follow", protect, follow);
router.get("/:id/unfollow", protect, unfollow);

module.exports = router;
