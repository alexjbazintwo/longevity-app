import express from "express";
import cors from "cors";
import plansRouter from "./routes/plans";
import logsRouter from "./routes/logs";
import replanRouter from "./routes/replan";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.status(200).json({ ok: true }));
app.use("/plans", plansRouter);
app.use("/logs", logsRouter);
app.use("/plans/:id/replan", replanRouter);

export default app;
