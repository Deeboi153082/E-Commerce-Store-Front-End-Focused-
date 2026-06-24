import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState('');
  const [delivery, setDelivery] = useState('Standard');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getCart().then((data) => {
      if (data.items.length === 0) return navigate('/cart');
      setCart(data);
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) return setError('Shipping address is required');
    setSubmitting(true);
    try {
      const result = await api.placeOrder({ shipping_address: address, delivery_method: delivery });
      navigate(`/orders/${result.orderId}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (!cart) return <div className="loading">Loading...<span className="spinner"></span></div>;

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>
      <div className="checkout-layout">
        <div className="checkout-form">
          <h3>Shipping Details</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Shipping Address</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} required />
            </div>
            <div className="form-group">
              <label>Delivery Method</label>
              <select value={delivery} onChange={(e) => setDelivery(e.target.value)}>
                <option value="Standard">Standard (5-7 business days)</option>
                <option value="Express">Express (1-2 business days)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>
        <div className="checkout-summary">
          <h3>Order Summary</h3>
          {cart.items.map((item) => (
            <div key={item.product_id} className="checkout-item">
              <span>{item.name} × {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="checkout-totals">
            <div><span>Subtotal</span><span>${cart.subtotal.toFixed(2)}</span></div>
            <div><span>Tax (10%)</span><span>${cart.tax.toFixed(2)}</span></div>
            <div className="checkout-total"><span>Total</span><span>${cart.total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
