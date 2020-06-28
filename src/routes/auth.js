const express = require("express");

const router = express.Router();
const { login, signup, me } = require("../controllers/auth");
const { protect } = require("../middlewares/auth");

router.route("/register").post(signup);
router.route("/logon").post(login);
router.route("/me").get(protect, me);

module.exports = router;