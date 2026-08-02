import dotenv from "dotenv";
import app from "./app.js";
import { env } from "./config/env.js";
import "./modules/tasks/task.worker.js"; // <-- Import to start the worker

dotenv.config();

const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});