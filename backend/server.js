const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const queueRoutes = require("./routes/queueRoutes");
const tokenRoutes = require("./routes/tokenRoutes");

dotenv.config();

const app = express();

// ===============================
// Database Connection
// ===============================
connectDB();

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// API Routes
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/tokens", tokenRoutes);

// ===============================
// Health Check
// ===============================
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Smart Queue API is running",
        version: "1.0.0"
    });
});

// ===============================
// 404 Handler
// ===============================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Smart Queue Server running on http://localhost:${PORT}`
    );
});