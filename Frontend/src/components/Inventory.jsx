import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import { Plus, Edit2, Trash2, Search, Save, X, Filter } from 'lucide-react';

const Inventory = () => {
  const apiUrl = 'http://localhost:5194/api/products';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category: '', price: '', currentStock: '', reorderLevel: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [apiError, setApiError] = useState('');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    fetchProducts();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5194/inventoryHub")
      .withAutomaticReconnect()
      .build();

    connection.on("InventoryUpdated", () => {
      fetchProducts(); 
    });

    connection.start().catch(err => console.error("SignalR Inventory Error: ", err));

    return () => { connection.stop(); };
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(apiUrl);
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setApiError('Unable to load products.');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    try {
      const res = await axios.post(apiUrl, {
         name: newProduct.name,
         sku: newProduct.sku,
         category: newProduct.category || "Uncategorized",
         price: parseFloat(newProduct.price),
         currentStock: parseInt(newProduct.currentStock, 10),
         reorderLevel: parseInt(newProduct.reorderLevel, 10)
      });
      setProducts(prev => [...prev, res.data]);
      setNewProduct({ name: '', sku: '', category: '', price: '', currentStock: '', reorderLevel: '' });
      setShowForm(false);
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.title || err?.response?.data || err?.message || 'Unable to add product.';
      setApiError(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5194/api/products/${id}`);
      fetchProducts();
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  const getStockBadge = (current, reorder) => {
    if (current <= 0) return <span className="badge badge-danger">Out of Stock</span>;
    if (current <= reorder) return <span className="badge badge-warning">Low Stock</span>;
    if (current >= reorder * 3) return <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', border: '1px solid rgba(139, 92, 246, 0.4)' }}>Overstock</span>;
    return <span className="badge badge-success">In Stock</span>;
  };

  // Compute derived data
  const uniqueCategories = ['All', ...new Set(products.map(p => p.category))].filter(Boolean);

  const filteredProducts = products.filter(p => {
    if (filterCategory !== 'All' && p.category !== filterCategory) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.sku.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Status Logic
    let isLow = p.currentStock <= p.reorderLevel && p.currentStock > 0;
    let isOut = p.currentStock <= 0;
    let isOver = p.currentStock >= p.reorderLevel * 3;
    let isNormal = !isLow && !isOut && !isOver;

    if (filterStatus === 'In Stock' && !isNormal) return false;
    if (filterStatus === 'Low Stock' && !isLow && !isOut) return false;
    if (filterStatus === 'Overstock' && !isOver) return false;

    // Price Logic
    if (minPrice && p.price < parseFloat(minPrice)) return false;
    if (maxPrice && p.price > parseFloat(maxPrice)) return false;

    return true;
  });

  if (loading) return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
       <div className="skeleton" style={{ width: '400px', height: '60px' }}></div>
       <div className="skeleton glass-panel" style={{ height: '500px' }}></div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.4rem', marginBottom: '10px', fontWeight: 700, letterSpacing: '-0.5px' }}>Inventory Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Maintain stock levels, categories, and evaluate filters.</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary animate-fade-in delay-1" style={{ height: 'fit-content' }} onClick={() => setShowForm(true)}>
            <Plus size={20} /> Add New Product
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-panel animate-fade-in" style={{ padding: '32px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(120px)', opacity: '0.15', zIndex: -1, pointerEvents: 'none' }}></div>
          
          <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Plus color="var(--primary)" size={24} /> Create Product Record
          </h3>
          {apiError && (
            <div style={{ marginBottom: '16px', color: 'var(--danger)', fontWeight: 600 }}>
              {apiError}
            </div>
          )}
          <form onSubmit={handleAddSubmit}>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Product Name</label>
                <input className="input-control" type="text" placeholder="e.g. Wireless Noise-Cancelling Headphones" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Product ID</label>
                <input className="input-control" type="text" placeholder="e.g. PID-009" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="input-control" type="text" placeholder="e.g. Electronics" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Unit Price (Rs.)</label>
                <input className="input-control" type="number" step="0.01" min="0" placeholder="0.00" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Initial Stock Level</label>
                <input className="input-control" type="number" min="0" placeholder="0" value={newProduct.currentStock} onChange={e => setNewProduct({...newProduct, currentStock: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Reorder</label>
                <input className="input-control" type="number" min="0" placeholder="e.g. 10" value={newProduct.reorderLevel} onChange={e => setNewProduct({...newProduct, reorderLevel: e.target.value})} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', flex: 1, justifyContent: 'center' }}>
                <Save size={18} /> Save Product
              </button>
              <button type="button" className="btn btn-outline" style={{ padding: '12px 24px' }} onClick={() => setShowForm(false)}>
                <X size={18} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER TOOLBAR */}
      <div className="glass-panel animate-fade-in delay-2" style={{ padding: '20px 24px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end', background: 'rgba(255,255,255,0.02)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
            <Filter size={18} color="var(--primary)" />
            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Advanced Filters</h4>
         </div>

         <div className="form-group" style={{ margin: 0, flex: '1 1 200px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Search Name/Product ID</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" className="input-control" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft: '38px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px' }} />
            </div>
         </div>

         <div className="form-group" style={{ margin: 0, flex: '1 1 150px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>📂 Category</label>
            <select className="input-control" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ padding: '10px' }}>
              {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
         </div>

         <div className="form-group" style={{ margin: 0, flex: '1 1 150px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>📊 Stock Status</label>
            <select className="input-control" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '10px' }}>
              <option value="All">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Overstock">Overstock</option>
            </select>
         </div>

         <div className="form-group" style={{ margin: 0, flex: '0 1 120px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>💰 Min Price</label>
            <input type="number" className="input-control" placeholder="Rs. 0" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ padding: '10px' }} />
         </div>

         <div className="form-group" style={{ margin: 0, flex: '0 1 120px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>💰 Max Price</label>
            <input type="number" className="input-control" placeholder="Rs. ∞" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ padding: '10px' }} />
         </div>
      </div>

      <div className="glass-panel animate-fade-in delay-3" style={{ padding: '0' }}>
        <div style={{ overflowX: 'auto', padding: '16px 24px 24px 24px' }}>
          <table>
            <thead>
              <tr>
                <th>Product Info</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, idx) => (
                <tr key={p.id} className={`animate-fade-in`} style={{ animationDelay: `${0.05 * (idx + 1)}s` }}>
                  <td>
                     <div style={{ fontWeight: 600 }}>{p.name}</div>
                     <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.5px' }}>{p.sku}</div>
                  </td>
                  <td><span style={{ color: 'var(--primary)', fontWeight: 500 }}>{p.category}</span></td>
                  <td style={{ fontWeight: 500 }}>Rs. {p.price.toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{p.currentStock}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>/ Min {p.reorderLevel}</span>
                    </div>
                  </td>
                  <td>{getStockBadge(p.currentStock, p.reorderLevel)}</td>
                  <td>
                    {deleteConfirm === p.id ? (
                      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleDelete(p.id)}>Confirm</button>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button className="btn btn-outline" style={{ padding: '8px' }} title="Edit Product"><Edit2 size={16} /></button>
                        <button className="btn btn-danger" style={{ padding: '8px' }} title="Delete Product" onClick={() => setDeleteConfirm(p.id)}><Trash2 size={16} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px' }}>
                    <Filter size={48} opacity={0.2} style={{ display: 'block', margin: '0 auto 16px' }} />
                    <span style={{ fontSize: '1.1rem' }}>No products match your current filters.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
