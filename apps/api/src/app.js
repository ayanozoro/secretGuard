import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import repositoryRoutes from "./routes/repositoryRoutes.js";
import scanRoutes from "./routes/scanRoutes.js";
import findingRoutes from "./routes/findingRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import errorHandler from "./middelware/errorHandler.js";

const app = express();

// Global Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "SecretGuard Intelligence & Prevention Platform API",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/scans", scanRoutes);
app.use("/api/findings", findingRoutes);
app.use("/api/stats", statsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    statusCode: 404,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use(errorHandler);

export { app };
export default app;
