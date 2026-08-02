import express from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";

const app = express();

// Security & Parsing Middleware
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Enable CORS (allow credentials for cookies)
app.use(
  cors({
    origin: true, // Reflects request origin in dev. In prod, set to your frontend URL.
    credentials: true,
  })
);

// Compress responses
app.use(compression());

// HTTP request logger
app.use(morgan("dev"));

// Routes
app.use("/api/v1", routes);

export default app;