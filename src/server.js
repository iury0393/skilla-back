require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

connectToDb();
app.use(express.json());
app.use(cors());

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(`Server started: ${process.env.NODE_ENV}, port: ${PORT}`)
);
