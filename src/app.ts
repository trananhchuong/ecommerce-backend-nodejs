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
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// init database
require("./dbs/init.mongodb"); // Initialize database connection

// init routes
app.use("/", require("./routes"));

// error handling

// handle 404 error
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: err.message || 'Internal Server Error'
    });
});

module.exports = app;
