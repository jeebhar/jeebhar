import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import contactRoutes from "./routes/contact.routes.js";
import contentRoutes from "./routes/content.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/content", contentRoutes);
app.use("/api/contact", contactRoutes);

app.use((err, _req, res, _next) => {
  const status = err.name === "ValidationError" ? 400 : 500;
  res.status(status).json({
    message: err.message || "Unexpected server error"
  });
});

export default app;
