import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getProduct(id).then(setProduct).catch(() => navigate('/catalog'));
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!user) return navigate('/login');
    try {
      await api.addToCart({ product_id: product.id, quantity });
      setMessage('Added to cart!');
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (!product) return <div className="loading">Loading...<span className="spinner"></span></div>;

  return (
    <div className="product-detail">
      <div className="product-detail-image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="product-placeholder large">{product.name[0]}</div>
        )}
      </div>
      <div className="product-detail-info">
        <span className="product-category">{product.category}</span>
        <h1>{product.name}</h1>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <p className="product-description">{product.description}</p>
        {message && <div className="alert alert-success">{message}</div>}
        <div className="add-to-cart-row">
          <div className="qty-selector">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
          <button className="btn btn-primary" onClick={handleAddToCart}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
}
