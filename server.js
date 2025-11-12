import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// ✅ Step 1: Enable trust proxy (Render requires this)
app.set("trust proxy", 1);

// ✅ Step 2: Universal CORS middleware (handles all origins safely)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://linkedin-frontend-vjnh.onrender.com"); // 🔥 your exact frontend URL
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  
  // ✅ Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});

// ✅ Step 3: Also use cors() for backup compatibility
app.use(cors({
  origin: "https://linkedin-frontend-vjnh.onrender.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static folder
app.use("/uploads", express.static("uploads"));

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("✅ Backend live with Render CORS fix!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
