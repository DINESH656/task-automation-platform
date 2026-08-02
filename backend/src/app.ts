import express from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import routes from "./routes/index.js";

// Fix: Import the named export
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// Security & Parsing Middleware
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(compression());
app.use(morgan("dev"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(path.resolve(__dirname, "../../uploads")));

// Routes
app.use("/api/v1", routes);

// Fix: Mount the named export at the very bottom
app.use(errorMiddleware);

export default app;
