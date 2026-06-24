const express = require('express');
const { db } = require('../config/db');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { search, category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
  const d = db();
  let where = '';
  const params = [];

  if (search) { where += ' WHERE (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (category) { where += where ? ' AND category = ?' : ' WHERE category = ?'; params.push(category); }
  if (minPrice) { where += where ? ' AND price >= ?' : ' WHERE price >= ?'; params.push(Number(minPrice)); }
  if (maxPrice) { where += where ? ' AND price <= ?' : ' WHERE price <= ?'; params.push(Number(maxPrice)); }

  const countRow = d.queryOne(`SELECT COUNT(*) as count FROM products${where}`, ...params);
  const total = countRow.count;
  const offset = (Number(page) - 1) * Number(limit);
  const products = d.query(`SELECT * FROM products${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, ...params, Number(limit), offset);

  res.json({ products, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
});

router.get('/:id', (req, res) => {
  const product = db().queryOne('SELECT * FROM products WHERE id = ?', req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

router.post('/', authenticate, adminOnly, (req, res) => {
  const { name, description, price, category, image } = req.body;
  if (!name || price === undefined || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }
  const result = db().execute('INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)', name, description || '', Number(price), category, image || '');
  res.status(201).json({ id: result.lastInsertRowid, message: 'Product created' });
});

router.put('/:id', authenticate, adminOnly, (req, res) => {
  const d = db();
  const { name, description, price, category, image } = req.body;
  if (!d.queryOne('SELECT id FROM products WHERE id = ?', req.params.id)) {
    return res.status(404).json({ error: 'Product not found' });
  }
  d.execute('UPDATE products SET name = ?, description = ?, price = ?, category = ?, image = ? WHERE id = ?', name, description, Number(price), category, image, req.params.id);
  res.json({ message: 'Product updated' });
});

router.delete('/:id', authenticate, adminOnly, (req, res) => {
  const d = db();
  if (!d.queryOne('SELECT id FROM products WHERE id = ?', req.params.id)) {
    return res.status(404).json({ error: 'Product not found' });
  }
  d.execute('DELETE FROM products WHERE id = ?', req.params.id);
  res.json({ message: 'Product deleted' });
});

module.exports = router;
