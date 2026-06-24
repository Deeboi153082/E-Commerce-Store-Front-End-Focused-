import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.getMyOrder(id).then(setOrder).catch(() => setOrder(null));
  }, [id]);

  if (!order) return <div className="loading">Loading...<span className="spinner"></span></div>;

  return (
    <div className="order-detail">
      <div className="order-detail-header">
        <h2>Order #{order.id}</h2>
        <span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span>
      </div>
      <div className="order-meta">
        <div className="meta-item"><span className="meta-label">Date:</span> {new Date(order.order_date).toLocaleString()}</div>
        <div className="meta-item"><span className="meta-label">Delivery:</span> {order.delivery_method}</div>
        <div className="meta-item"><span className="meta-label">Shipping:</span> {order.shipping_address}</div>
        <div className="meta-item"><span className="meta-label">Total:</span> ${order.total.toFixed(2)}</div>
      </div>

      <table className="table">
        <thead>
          <tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td>{item.product_name}</td>
              <td>${item.product_price.toFixed(2)}</td>
              <td>{item.quantity}</td>
              <td>${(item.product_price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="order-totals">
        <div><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
        <div><span>Tax (10%)</span><span>${order.tax.toFixed(2)}</span></div>
        <div className="checkout-total"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
      </div>

      <Link to="/orders" className="btn">Back to Orders</Link>
    </div>
  );
}
