import express from "express";
import morgan from "morgan";
import cors from "cors";
import tasksRouter from "./routes/tasks.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/tasks", tasksRouter);

// hygiene
app.use(notFound);
app.use(errorHandler);

export default app;
