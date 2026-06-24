import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getDashboard().then(setData);
  }, []);

  if (!data) return <div className="loading">Loading...<span className="spinner"></span></div>;

  return (
    <div className="admin-page">
      <h2>Admin Dashboard</h2>
      <div className="admin-nav">
        <Link to="/admin/products" className="btn">Manage Products</Link>
        <Link to="/admin/orders" className="btn">Manage Orders</Link>
      </div>
      <div className="dashboard-cards">
        <div className="dash-card">
          <div className="dash-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <h3>{data.totalOrders}</h3>
          <p>Total Orders</p>
        </div>
        <div className="dash-card">
          <div className="dash-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h3>{data.pendingOrders}</h3>
          <p>Pending</p>
        </div>
        <div className="dash-card">
          <div className="dash-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h3>${data.revenue.toFixed(2)}</h3>
          <p>Revenue (Delivered)</p>
        </div>
        <div className="dash-card">
          <div className="dash-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          </div>
          <h3>{data.totalProducts}</h3>
          <p>Products</p>
        </div>
      </div>
    </div>
  );
}
