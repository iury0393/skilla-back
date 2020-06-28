const express = require("express");

const router = express.Router();
const { login, signup, user } = require("../controllers/auth");
const { protect } = require("../middlewares/auth");

router.route("/register").post(signup);
router.route("/logon").post(login);
router.route("/user").get(protect, user);

module.exports = router;