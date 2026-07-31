import express from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from './routes/index.js'

const app = express();

// Security Middleware
app.use(helmet());

app.use("/api/v1", routes);

// Enable CORS
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Compress responses
app.use(compression());

// HTTP request logger
app.use(morgan("dev"));

export default app;