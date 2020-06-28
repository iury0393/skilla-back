require("dotenv").config();
const express = require("express");
const cors = require("cors");
const auth = require("./routes/auth");
const user = require("./routes/user");
const connectToDb = require("./utils/db");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

connectToDb();
app.use(express.json());
app.use(cors());

app.use("/api/v1/auth", auth);
app.use("/api/v1/users", user);

app.use(errorHandler);

const PORT = process.env.PORT || 3333;
app.listen(
  PORT,
  console.log(`Server started: ${process.env.NODE_ENV}, port: ${PORT}`)
);
