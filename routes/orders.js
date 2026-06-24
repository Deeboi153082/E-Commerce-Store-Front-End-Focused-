const express = require('express');
const { db } = require('../config/db');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, (req, res) => {
  const d = db();
  const { shipping_address, delivery_method } = req.body;
  if (!shipping_address || !delivery_method) {
    return res.status(400).json({ error: 'Shipping address and delivery method are required' });
  }

  const cartItems = d.query(
    `SELECT ci.product_id, ci.quantity, p.name, p.price
     FROM cart_items ci JOIN products p ON ci.product_id = p.id
     WHERE ci.user_id = ?`, req.user.id);

  if (cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });

  const subtotal = Math.round(cartItems.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100;
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  try {
    const orderId = d.transact(() => {
      const r = d.execute(
        'INSERT INTO orders (user_id, shipping_address, delivery_method, subtotal, tax, total, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        req.user.id, shipping_address, delivery_method, subtotal, tax, total, 'Pending');
      const oid = r.lastInsertRowid;
      for (const item of cartItems) {
        d.execute('INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity) VALUES (?, ?, ?, ?, ?)',
          oid, item.product_id, item.name, item.price, item.quantity);
      }
      d.execute('DELETE FROM cart_items WHERE user_id = ?', req.user.id);
      return oid;
    });
    res.status(201).json({ orderId, message: 'Order placed successfully' });
  } catch (err) {
    console.error('Order transaction failed:', err);
    res.status(500).json({ error: 'Failed to place order. Please try again.' });
  }
});

router.get('/my', authenticate, (req, res) => {
  const orders = db().query(
    'SELECT id, order_date, status, subtotal, tax, total, delivery_method FROM orders WHERE user_id = ? ORDER BY order_date DESC',
    req.user.id);
  res.json(orders);
});

router.get('/my/:id', authenticate, (req, res) => {
  const d = db();
  const order = d.queryOne('SELECT * FROM orders WHERE id = ? AND user_id = ?', req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const items = d.query('SELECT * FROM order_items WHERE order_id = ?', order.id);
  res.json({ ...order, items });
});

router.get('/all', authenticate, adminOnly, (req, res) => {
  const orders = db().query(
    `SELECT o.id, o.order_date, o.status, o.subtotal, o.total, o.delivery_method,
            u.name as customer_name, u.email as customer_email
     FROM orders o JOIN users u ON o.user_id = u.id
     ORDER BY o.order_date DESC`);
  res.json(orders);
});

router.get('/all/:id', authenticate, adminOnly, (req, res) => {
  const d = db();
  const order = d.queryOne('SELECT * FROM orders WHERE id = ?', req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const items = d.query('SELECT * FROM order_items WHERE order_id = ?', order.id);
  const customer = d.queryOne('SELECT id, name, email FROM users WHERE id = ?', order.user_id);
  const audit = d.query('SELECT * FROM order_audit WHERE order_id = ? ORDER BY created_at DESC', order.id);
  res.json({ ...order, customer, items, audit });
});

router.put('/:id/status', authenticate, adminOnly, (req, res) => {
  const d = db();
  const { status } = req.body;
  const validTransitions = { Pending: 'Shipped', Shipped: 'Delivered' };
  const order = d.queryOne('SELECT id, status FROM orders WHERE id = ?', req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (validTransitions[order.status] !== status) {
    return res.status(400).json({ error: `Cannot transition from ${order.status} to ${status}` });
  }
  d.execute('UPDATE orders SET status = ? WHERE id = ?', status, order.id);
  d.execute('INSERT INTO order_audit (order_id, admin_id, from_status, to_status) VALUES (?, ?, ?, ?)',
    order.id, req.user.id, order.status, status);
  res.json({ message: `Order status updated to ${status}` });
});

router.get('/dashboard', authenticate, adminOnly, (req, res) => {
  const d = db();
  const totalOrders = d.queryOne('SELECT COUNT(*) as count FROM orders').count;
  const pendingOrders = d.queryOne("SELECT COUNT(*) as count FROM orders WHERE status = 'Pending'").count;
  const revenue = d.queryOne("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'Delivered'").total;
  const totalProducts = d.queryOne('SELECT COUNT(*) as count FROM products').count;
  res.json({ totalOrders, pendingOrders, revenue, totalProducts });
});

module.exports = router;
