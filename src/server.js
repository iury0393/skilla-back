require("dotenv").config();
const express = require("express");
const cors = require("cors");
const auth = require("./routes/auth");
const user = require("./routes/user");
const post = require("./routes/post");
const connectToDb = require("./utils/db");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

connectToDb();
app.use(express.json());
app.use(cors());

app.use("/auth", auth);
app.use("/users", user);
app.use("/posts", post);

app.use(errorHandler);

const PORT = process.env.PORT || 3333;
app.listen(
  PORT,
  console.log(`Server started, port: ${PORT}`)
);
