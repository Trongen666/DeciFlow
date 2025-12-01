const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', '..', 'listener', 'data', 'lifecycle.json');

router.get('/:productId', (req, res) => {
  if (!fs.existsSync(FILE)) return res.json([]);
  const all = JSON.parse(fs.readFileSync(FILE, 'utf8')) || {};
  const productId = String(Number(req.params.productId));
  const lifecycle = all[productId] || [];
  res.json(lifecycle);
});

module.exports = router;
