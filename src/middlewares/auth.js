const jwt = require("jsonwebtoken");
const User = require("../models/User");
//Cria uma função que obriga o usuário a se logar para visitar páginas do site.
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next({
      message: "Você precisa estar logado para visitar essa rota",
      statusCode: 403,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next({ message: `Nenhum usuário encontrado para o id: ${decoded.id}` });
    }

    req.user = user;
    next();
  } catch (err) {
    next({
      message: "Você precisa estar logado para visitar essa rota",
      statusCode: 403,
    });
  }
};
