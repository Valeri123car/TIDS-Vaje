import express from "express";
import cors from "cors";
import { config } from "./config/config.js";
import trailsRouter from "./routes/trails.js";
import weatherRouter from "./routes/weather.js";
import sursRouter from "./routes/surs.js";
import userRouter from "./routes/users.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/trails", trailsRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/surs", sursRouter);
app.use("/api/user", userRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(config.port, () => {
  console.log(`✅ REST API server running on http://localhost:${config.port}`);
  console.log(`📊 Health check: http://localhost:${config.port}/health`);
  console.log(`🗺️  Trails API: http://localhost:${config.port}/api/trails`);
});
