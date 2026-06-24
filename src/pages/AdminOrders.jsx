import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

const STATUS_FLOW = { Pending: 'Shipped', Shipped: 'Delivered' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');

  const loadOrders = () => api.getAllOrders().then(setOrders);

  useEffect(() => { loadOrders(); }, []);

  const viewOrder = async (id) => {
    const detail = await api.getOrderDetail(id);
    setSelected(detail);
  };

  const updateStatus = async (id, nextStatus) => {
    try {
      await api.updateOrderStatus(id, { status: nextStatus });
      setMessage(`Order #${id} → ${nextStatus}`);
      if (selected?.id === id) viewOrder(id);
      loadOrders();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="admin-page">
      <h2>Orders</h2>
      {message && <div className="alert alert-success">{message}</div>}
      <div className="admin-orders-layout">
        <div className="admin-orders-list">
          <table className="table">
            <thead>
              <tr><th>#</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className={selected?.id === o.id ? 'selected' : ''}>
                  <td>#{o.id}</td>
                  <td>{o.customer_name}</td>
                  <td>{new Date(o.order_date).toLocaleDateString()}</td>
                  <td>${o.total.toFixed(2)}</td>
                  <td><span className={`status status-${o.status.toLowerCase()}`}>{o.status}</span></td>
                  <td><button className="btn btn-sm" onClick={() => viewOrder(o.id)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="admin-order-detail">
            <h3>Order #{selected.id}</h3>
            <p><strong>Customer:</strong> {selected.customer?.name} ({selected.customer?.email})</p>
            <p><strong>Date:</strong> {new Date(selected.order_date).toLocaleString()}</p>
            <p><strong>Status:</strong> <span className={`status status-${selected.status.toLowerCase()}`}>{selected.status}</span></p>
            <p><strong>Delivery:</strong> {selected.delivery_method}</p>
            <p><strong>Address:</strong> {selected.shipping_address}</p>

            <h4>Items</h4>
            <table className="table">
              <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead>
              <tbody>
                {selected.items?.map((item) => (
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
              <div><span>Subtotal</span><span>${selected.subtotal.toFixed(2)}</span></div>
              <div><span>Tax</span><span>${selected.tax.toFixed(2)}</span></div>
              <div className="checkout-total"><span>Total</span><span>${selected.total.toFixed(2)}</span></div>
            </div>

            {STATUS_FLOW[selected.status] && (
              <button className="btn btn-primary" onClick={() => updateStatus(selected.id, STATUS_FLOW[selected.status])}>
                Mark as {STATUS_FLOW[selected.status]}
              </button>
            )}

            {selected.audit?.length > 0 && (
              <>
                <h4>Status History</h4>
                <ul className="audit-log">
                  {selected.audit.map((a) => (
                    <li key={a.id}>
                      {a.from_status} → {a.to_status} ({new Date(a.created_at).toLocaleString()})
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
