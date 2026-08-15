import express, { Request, Response, NextFunction } from "express";
const app = express();
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";

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
import "./dbs/init.mongodb"; // Initialize database connection

// init routes
import router from "./routes";
app.use("/", router);

// error handling

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
}

// handle 404 error
app.use((req: Request, res: Response, next: NextFunction) => {
  const error: HttpError = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: err.message || "Internal Server Error",
  });
});

export default app;
