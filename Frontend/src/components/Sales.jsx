import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import { ShoppingCart, Send, Calendar } from 'lucide-react';

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://smart-inventory-and-demand-forecasting.onrender.com/inventoryHub")
      .withAutomaticReconnect()
      .build();

    connection.on("InventoryUpdated", () => {
      fetchData(); 
    });

    connection.start().catch(err => console.error("SignalR Sales Error: ", err));

    return () => { connection.stop(); };
  }, []);

  const fetchData = async () => {
    try {
      const pRes = await axios.get('https://smart-inventory-and-demand-forecasting.onrender.com/api/products');
      const sRes = await axios.get('https://smart-inventory-and-demand-forecasting.onrender.com/api/sales');
      setProducts(pRes.data);
      setSales(sRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!selectedProductId || quantity <= 0) {
      setErrorMsg("Please select a valid product and quantity.");
      return;
    }

    const item = products.find(p => p.id === parseInt(selectedProductId));
    if (item && item.currentStock < quantity) {
      setErrorMsg(`Cannot fulfill! Only ${item.currentStock} units available.`);
      return;
    }

    try {
      await axios.post('https://smart-inventory-and-demand-forecasting.onrender.com/api/sales', {
        productId: parseInt(selectedProductId),
        quantitySold: parseInt(quantity)
      });
      setSuccessMsg("Order Dispatched Successfully!");
      setQuantity(1);
      // Data refetch is handled automatically by SignalR's InventoryUpdated broadcast
    } catch (err) {
      setErrorMsg("Failed to dispatch order.");
    }
  };

  if (loading) return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
       <div className="skeleton" style={{ width: '400px', height: '60px' }}></div>
       <div className="skeleton glass-panel" style={{ height: '300px' }}></div>
       <div className="skeleton glass-panel" style={{ height: '400px' }}></div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      <div className="animate-fade-in">
        <h1 className="text-gradient" style={{ fontSize: '2.4rem', marginBottom: '10px', fontWeight: 700, letterSpacing: '-0.5px' }}>Sales & Order Fulfillment</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Dispatch orders to organically reduce inventory stock live.</p>
      </div>

      <div className="glass-panel animate-fade-in delay-1" style={{ padding: '32px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', background: 'var(--accent)', filter: 'blur(120px)', opacity: '0.15', zIndex: -1, pointerEvents: 'none' }}></div>
        
        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
           <ShoppingCart color="var(--accent)" size={24} /> New Dispatch Order
        </h3>
        
        {errorMsg && <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#fca5a5', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>{errorMsg}</div>}
        {successMsg && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>{successMsg}</div>}

        <form onSubmit={handleDispatch}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Select Product For Dispatch</label>
              <select className="input-control" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} required>
                <option value="">-- Choose an Item --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Available: {p.currentStock})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity to Dispatch</label>
              <input className="input-control" type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', padding: '12px 32px' }}>
             <Send size={18} /> Confirm Outbound Shipment
          </button>
        </form>
      </div>

      <div className="glass-panel animate-fade-in delay-2" style={{ padding: '0' }}>
        <h3 style={{ padding: '24px 24px 16px 24px', fontSize: '1.3rem', fontWeight: 600, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar color="var(--text-muted)" size={20} /> Fulfillment Logs
        </h3>
        <div style={{ overflowX: 'auto', padding: '16px 24px 24px 24px' }}>
          <table>
            <thead>
              <tr>
                <th>Dispatched Item</th>
                <th>Units Sold</th>
                <th>Timestamp (UTC)</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s, idx) => (
                <tr key={idx} className={`animate-fade-in`} style={{ animationDelay: `${Math.min(0.1 * (idx + 1), 1)}s` }}>
                  <td style={{ fontWeight: 600 }}>{s.productName}</td>
                  <td><span className="badge badge-warning" style={{ color: 'white', background: 'var(--accent)', border: 'none' }}>-{s.quantitySold}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(s.saleDate).toLocaleString()}</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                   <td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No historical sales found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Sales;
