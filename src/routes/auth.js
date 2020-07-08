const express = require("express");
const { celebrate, Segments, Joi } = require('celebrate');

const router = express.Router();
const { login, signup, me, users } = require("../controllers/auth");
const { protect } = require("../middlewares/auth");

router.post("/signup", celebrate({
  [Segments.BODY]: Joi.object().keys({
    fullname: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required()
  })
}), signup);

router.post("/login", celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  })
}), login);

router.get("/me", protect, me);
router.get("/users", users);

module.exports = router;