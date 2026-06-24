import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileRef = useRef(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Electronics', image: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.getProduct(id).then((p) => setForm({ name: p.name, description: p.description, price: String(p.price), category: p.category, image: p.image || '' }));
    }
  }, [id, isEdit]);

  const processFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError('Image must be under 5MB');
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, image: reader.result });
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  const removeImage = () => setForm({ ...form, image: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return setError('Name and price are required');
    setSubmitting(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (isEdit) {
        await api.updateProduct(id, payload);
      } else {
        await api.createProduct(payload);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-form-container">
        <div className="admin-form-header">
          <button className="btn-back" onClick={() => navigate('/admin/products')}>← Back to Products</button>
          <h2>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="admin-form-layout">
            <div className="admin-form-main">
              <div className="form-card">
                <div className="form-group">
                  <label>Product name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wireless Bluetooth Headphones" required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Describe your product..." />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price ($)</label>
                    <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" required />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      <option>Electronics</option>
                      <option>Clothing</option>
                      <option>Books</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-form-sidebar">
              <div className="form-card">
                <label>Product image</label>
                <div
                  className={`upload-zone ${dragOver ? 'drag-over' : ''} ${form.image ? 'has-image' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => !form.image && fileRef.current?.click()}
                >
                  {form.image ? (
                    <div className="upload-preview">
                      <img src={form.image} alt="Preview" />
                      <div className="upload-overlay">
                        <button type="button" className="btn btn-sm" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>Change</button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); removeImage(); }}>Remove</button>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <p>Drag and drop image here, or <span>browse</span></p>
                      <p className="upload-hint">PNG, JPG, WebP — max 5MB</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} hidden />
                </div>
              </div>
            </div>
          </div>
          <div className="form-actions-bar">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/products')}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
