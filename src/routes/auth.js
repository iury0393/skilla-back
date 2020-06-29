const express = require("express");

const router = express.Router();
const { login, signup, me, users } = require("../controllers/auth");
const { protect } = require("../middlewares/auth");

router.route("/register").post(signup);
router.route("/logon").post(login);
router.route("/me").get(protect, me);
router.route("/users").get(users);

module.exports = router;