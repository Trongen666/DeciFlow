// backend/api/routes/products.cjs
const express = require("express");
const router = express.Router();

// Example: return a static list of products
const dummyProducts = [
    { id: 1, name: "Demo Widget", status: "Created" },
    { id: 2, name: "Organic Apples", status: "InTransit" },
];

// GET /api/products
router.get("/", (req, res) => {
    res.json({ products: dummyProducts });
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
    const product = dummyProducts.find(p => p.id === Number(req.params.id));
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
});

module.exports = router;