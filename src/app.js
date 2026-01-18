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

// init routes
app.use("/", require("./routes"));

// error handling
module.exports = app;
