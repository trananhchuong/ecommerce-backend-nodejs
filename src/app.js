const express = require("express");
const app = express();
const morgan = require("morgan");

// init middleware
// app.use(morgan("dev"));
// app.use(morgan("combined"));
// app.use(morgan("short"));
// app.use(morgan("common"));
app.use(morgan("tiny"));

// init database

// init routes

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Hello World" });
});

// error handling

module.exports = app;