const User = require("../models/User");
const asyncHandler = require("../middlewares/asyncHandler");

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Checa se o email e o pw não estam vazios
  if (!email || !password) {
    return next({
      message: "Por favor digite um email e uma senha",
      statusCode: 400,
    });
  }

  // Checa se o usuário existe
  const user = await User.findOne({ email });

  if (!user) {
    return next({
      message: "Esse email não está registrado com uma conta",
      statusCode: 400,
    });
  }

  // Se existe, checa se a senha bate com a salva
  const match = await user.checkPassword(password);

  if (!match) {
    return next({ message: "A senha não está correta", statusCode: 400 });
  }
  const token = user.getJwtToken();

  // Então manda o json como resposta
  res.status(200).json({ success: true, token });
});

exports.signup = asyncHandler(async (req, res, next) => {
  const { fullname, username, email, password } = req.body;

  const user = await User.create({ fullname, username, email, password });

  const token = user.getJwtToken();

  res.status(200).json({ success: true, token });
});

exports.me = asyncHandler(async (req, res, next) => {
  const { avatar, username, fullname, email, _id, website, bio } = req.user;

  res
    .status(200)
    .json({
      success: true,
      data: { avatar, username, fullname, email, _id, website, bio },
    });
});
