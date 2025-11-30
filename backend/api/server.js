const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);

// Health Check
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
});
