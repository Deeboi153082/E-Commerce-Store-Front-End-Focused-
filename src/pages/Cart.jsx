import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);

  const loadCart = () => api.getCart().then(setCart);

  useEffect(() => { loadCart(); }, []);

  const handleUpdate = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      await api.updateCartItem(productId, { quantity });
      loadCart();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await api.removeFromCart(productId);
      loadCart();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!cart) return <div className="loading">Loading cart...<span className="spinner"></span></div>;

  if (cart.items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet. Browse our catalog to find something you love.</p>
        <Link to="/catalog" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>Shopping Cart</h2>
      <div className="cart-items">
        {cart.items.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-image">
              {item.image ? <img src={item.image} alt={item.name} className="thumb" /> : <div className="product-placeholder sm">{item.name[0]}</div>}
            </div>
            <div className="cart-item-info">
              <h4>{item.name}</h4>
              <p className="cart-item-price">${item.price.toFixed(2)}</p>
            </div>
            <div className="cart-item-qty">
              <button onClick={() => handleUpdate(item.product_id, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => handleUpdate(item.product_id, item.quantity + 1)}>+</button>
            </div>
            <div className="cart-item-total">${(item.price * item.quantity).toFixed(2)}</div>
            <button className="btn btn-danger btn-sm" onClick={() => handleRemove(item.product_id)}>Remove</button>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <div className="cart-summary-row"><span>Subtotal</span><span>${cart.subtotal.toFixed(2)}</span></div>
        <div className="cart-summary-row"><span>Tax (10%)</span><span>${cart.tax.toFixed(2)}</span></div>
        <div className="cart-summary-row cart-summary-total"><span>Total</span><span>${cart.total.toFixed(2)}</span></div>
        <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
      </div>
    </div>
  );
}
