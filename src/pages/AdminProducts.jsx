import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');

  const load = () => api.getProducts({ limit: 100 }).then((d) => setProducts(d.products));

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.deleteProduct(id);
      setMessage('Product deleted');
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Products</h2>
        <Link to="/admin/products/new" className="btn btn-primary">+ New Product</Link>
      </div>
      {message && <div className="alert alert-success">{message}</div>}
      <table className="table">
        <thead>
          <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                {p.image ? <img src={p.image} alt="" className="thumb" /> : <div className="product-placeholder sm">{p.name[0]}</div>}
              </td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>${p.price.toFixed(2)}</td>
              <td>
                <Link to={`/admin/products/${p.id}/edit`} className="btn btn-sm">Edit</Link>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
