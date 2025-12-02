import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import trailsRouter from "./routes/trails.js";
import weatherRouter from "./routes/weather.js";
import authRouter from "./routes/auth.js";
import sursRouter from "./routes/surs.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/trails", trailsRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/auth", authRouter);
app.use("/api/surs", sursRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`✅ REST API server running on http://localhost:${PORT}`);
});
