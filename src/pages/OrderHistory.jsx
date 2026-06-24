import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.getMyOrders().then(setOrders);
  }, []);

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <h2>No orders yet</h2>
        <p>When you place an order, it will show up here.</p>
        <Link to="/catalog" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h2>My Orders</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Date</th>
            <th>Delivery</th>
            <th>Total</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>#{o.id}</td>
              <td>{new Date(o.order_date).toLocaleDateString()}</td>
              <td>{o.delivery_method}</td>
              <td>${o.total.toFixed(2)}</td>
              <td><span className={`status status-${o.status.toLowerCase()}`}>{o.status}</span></td>
              <td><Link to={`/orders/${o.id}`} className="btn btn-sm">View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
