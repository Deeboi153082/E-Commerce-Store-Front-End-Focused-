import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const CATEGORIES = ['', 'Electronics', 'Clothing', 'Books'];

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ search: '', category: '', minPrice: '', maxPrice: '' });

  useEffect(() => {
    const params = { page, limit: 10 };
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;

    api.getProducts(params).then((data) => {
      setProducts(data.products);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    });
  }, [page, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <div className="catalog-title">
          <h1>Products</h1>
          <p>Discover what's new at MARKETPLACE</p>
        </div>
      </div>
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.filter(Boolean).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Min price"
          value={filters.minPrice}
          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
        />
        <input
          type="number"
          placeholder="Max price"
          value={filters.maxPrice}
          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
        />
      </div>

      <div className="catalog-count">{total} product(s) found</div>

      <div className="product-grid">
        {products.map((p) => (
          <Link to={`/products/${p.id}`} key={p.id} className="product-card">
            <div className="product-card-image">
              {p.image ? (
                <img src={p.image} alt={p.name} />
              ) : (
                <div className="product-placeholder">{p.name[0]}</div>
              )}
            </div>
            <div className="product-card-body">
              <span className="product-category">{p.category}</span>
              <h3>{p.name}</h3>
              <p className="product-price">${p.price.toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
