const express = require("express");
const router = express.Router();

// Mock Data (In real app, query DB)
const mockProducts = [
    { id: 1, name: "Organic Apples", status: "InTransit" },
    { id: 2, name: "Smart Widget", status: "Created" }
];

// GET /api/products
router.get("/", (req, res) => {
    res.json(mockProducts);
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
    const product = mockProducts.find(p => p.id == req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: "Product not found" });
    }
});

module.exports = router;
