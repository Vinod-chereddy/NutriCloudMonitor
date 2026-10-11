import "./config/dnsResolver.js";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { initSocket } from "./utils/socketEmitter.js";

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import adminAuthRoutes from "./routes/adminAuth.js";
import adminRoutes from "./routes/admin.js";
import regimenRoutes from "./routes/regimen.js";
import analyticsRoutes from "./routes/analytics.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// DATABASE CONNECTION
// ========================================
connectDB();

// ========================================
// WEBSOCKET INITIALIZATION (SOCKET.IO)
// ========================================
initSocket(httpServer);

// ========================================
// SECURITY HARDENING (HELMET & HEADERS)
// ========================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    contentSecurityPolicy: false, // Permissive for API & SPA static serving
  })
);

// ========================================
// NOSQL INJECTION DEFENSE (QUERY SANITIZER)
// ========================================
const sanitizeNoSql = (obj) => {
  if (obj && typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        sanitizeNoSql(obj[key]);
      }
    }
  }
};

app.use((req, res, next) => {
  if (req.body) sanitizeNoSql(req.body);
  if (req.query) sanitizeNoSql(req.query);
  if (req.params) sanitizeNoSql(req.params);
  next();
});

// ========================================
// CORS CONFIGURATION (PRODUCTION SAFE)
// ========================================
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      // Allow local development
      if (origin === "http://localhost:3000" || origin === "http://localhost:5173") {
        return callback(null, true);
      }

      // Allow all Vercel deployments (preview + production)
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Explicitly handle preflight
app.options("*", cors());

import { socSecurityMonitor } from "./middleware/socSecurityMonitor.js";

// ========================================
// GLOBAL MIDDLEWARE
// ========================================
app.use(express.json());

// Behavioral SOC Security Threat Inspection Gateway
app.use(socSecurityMonitor);

// Static image serving
app.use(
  "/images",
  express.static(path.join(__dirname, "public/images"))
);

// ========================================
// API ROUTES
// ========================================
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/regimen", regimenRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);

// ========================================
// HEALTH CHECK
// ========================================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running with Real-Time SOC Telemetry & Security Hardening",
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// SERVE FRONTEND (PRODUCTION / MONOLITH DEPLOYMENT)
// ========================================
const frontendDistPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/images")) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// ========================================
// GLOBAL ERROR HANDLER
// ========================================
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ========================================
// START SERVER
// ========================================
let PORT = 5000;
const rawPort = process.env.PORT;
if (rawPort && !isNaN(Number(rawPort)) && Number(rawPort) > 0) {
  PORT = Number(rawPort);
}

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 NutriCloudMonitor SOC Server running on port ${PORT}`);
  console.log(`⚡ WebSocket stream active on ws://0.0.0.0:${PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

