const errorHandler = (err, req, res, next) => {
  console.log(err);

  let message = err.message || "Internal server error";
  let statusCode = err.statusCode || 500;

  if (err.code === 11000) {
    message = "Duplicate key";

    if (err.keyValue.email) {
      message = "O email já está sendo usado";
    }

    if (err.keyValue.username) {
      message = "O nome de usuário já está sendo usado";
    }

    statusCode = 400;
  }

  if (err.name === "ValidationError") {
    const fields = Object.keys(err.errors);

    fields.map((field) => {
      if (err.errors[field].kind === "maxlength") {
        message = "Senha tem que ser no máximo 12 caracteres";
      } else {
        message = "Senha tem que ser no mínimo 6 caracteres";
      }
    });

    statusCode = 400;
  }

  if (err.name === "CastError") {
    message = "O ObjectID está malfomado";
    statusCode = 400;
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
