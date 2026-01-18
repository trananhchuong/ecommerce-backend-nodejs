const express = require("express");
const app = express();
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");

// init middleware
app.use(morgan("dev"));
// app.use(morgan("combined"));
// app.use(morgan("short"));
// app.use(morgan("common"));
// app.use(morgan("tiny"));
app.use(helmet());
app.use(compression());

// init database
require("./dbs/init.mongodb"); // Initialize database connection
const mongoose = require("mongoose"); // Import mongoose for model creation

const productTable = mongoose.model("Product", {
  name: String,
  price: Number,
  description: String,
});

const listProduct = async () => {
  const products = await productTable.find();
  return products;
};

listProduct().then((products) => {
  console.log("🚀 ~ products:", products)
});

// init routes

app.get("/", (req, res) => {
  const strCompress = "Hello World";
  return res
    .status(200)
    .json({ message: "Hello World", metadata: strCompress.repeat(1000000) });
});

// error handling

module.exports = app;
