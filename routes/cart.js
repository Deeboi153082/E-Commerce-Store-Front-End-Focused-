const express = require('express');
const { db } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const d = db();
  const items = d.query(
    `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.image, p.category
     FROM cart_items ci JOIN products p ON ci.product_id = p.id
     WHERE ci.user_id = ?`, req.user.id);

  const subtotal = Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100;
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  res.json({ items, subtotal, tax, total });
});

router.post('/', (req, res) => {
  const d = db();
  const { product_id, quantity = 1 } = req.body;
  if (!d.queryOne('SELECT id FROM products WHERE id = ?', product_id)) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = d.queryOne('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?', req.user.id, product_id);
  if (existing) {
    d.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', existing.quantity + quantity, existing.id);
  } else {
    d.execute('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', req.user.id, product_id, quantity);
  }

  res.json({ message: 'Item added to cart' });
});

router.put('/:productId', (req, res) => {
  const d = db();
  const { quantity } = req.body;
  if (quantity < 1) return res.status(400).json({ error: 'Quantity must be at least 1' });

  const item = d.queryOne('SELECT id FROM cart_items WHERE user_id = ? AND product_id = ?', req.user.id, req.params.productId);
  if (!item) return res.status(404).json({ error: 'Item not found in cart' });

  d.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', quantity, item.id);
  res.json({ message: 'Quantity updated' });
});

router.delete('/:productId', (req, res) => {
  db().execute('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', req.user.id, req.params.productId);
  res.json({ message: 'Item removed from cart' });
});

module.exports = router;
