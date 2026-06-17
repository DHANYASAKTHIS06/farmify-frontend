require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const farmRoutes = require("./routes/farms");
const bookingRoutes = require("./routes/bookings");
const notificationRoutes = require("./routes/notifications");
const chatbotRoutes = require("./routes/chatbot");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Support base64 image uploads if Cloudinary is bypassed or directly sent
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Basic health check route
app.get("/", (req, res) => {
  res.send("Farmify Backend Service is Online.");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ message: "An internal server error occurred" });
});

// Database Connection & Server Startup
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/farmify";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected successfully to MongoDB Atlas.");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Failure:", err);
    // Exit if DB is critical, but in development print warning
    console.warn("Continuing server start with local fallback warning...");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} without MongoDB connection`);
    });
  });
