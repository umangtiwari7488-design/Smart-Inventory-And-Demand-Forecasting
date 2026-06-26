import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Package, AlertTriangle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5194/inventoryHub")
      .withAutomaticReconnect()
      .build();

    connection.on("InventoryUpdated", () => {
      fetchData(); 
    });

    connection.start().catch(err => console.error("SignalR Dashboard Error: ", err));

    return () => { connection.stop(); };
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5194/api/forecast/dashboard');
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
       <div className="skeleton" style={{ width: '300px', height: '60px' }}></div>
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div className="skeleton glass-panel" style={{ height: '120px' }}></div>
          <div className="skeleton glass-panel" style={{ height: '120px' }}></div>
          <div className="skeleton glass-panel" style={{ height: '120px' }}></div>
       </div>
       <div className="skeleton glass-panel" style={{ height: '400px' }}></div>
    </div>
  );

  const lowStockCount = data.filter(d => d.isRestockNeeded).length;
  const totalStock = data.reduce((acc, curr) => acc + curr.currentStock, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      <div className="animate-fade-in">
        <h1 className="text-gradient" style={{ fontSize: '2.4rem', marginBottom: '10px', fontWeight: 700, letterSpacing: '-0.5px' }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Your inventory and predictive intelligence at a glance.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="glass-panel interactive-card animate-fade-in delay-1" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: '#f8fafc', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="icon-container" style={{ background: '#e3f0e8', padding: '18px', borderRadius: '16px' }}>
            <Package color="var(--primary)" size={32} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Categories</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 700 }}>{data.length}</div>
          </div>
        </div>
        
        <div className="glass-panel interactive-card animate-fade-in delay-2" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="icon-container" style={{ background: '#dbeafe', padding: '18px', borderRadius: '16px' }}>
            <TrendingUp color="var(--accent)" size={32} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Items In Stock</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 700 }}>{totalStock}</div>
          </div>
        </div>

        <div className="glass-panel interactive-card animate-fade-in delay-3" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', border: lowStockCount > 0 ? '1px solid rgba(244, 63, 94, 0.3)' : '' }}>
          <div className="icon-container" style={{ background: '#ffeaea', padding: '18px', borderRadius: '16px' }}>
            <AlertTriangle color="var(--danger)" size={32} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Urgent Restocks</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: lowStockCount > 0 ? 'var(--danger)' : 'inherit' }}>{lowStockCount}</div>
          </div>
        </div>
      </div>

      <div className="glass-panel animate-fade-in delay-3" style={{ padding: '32px' }}>
        <h3 style={{ marginBottom: '32px', fontSize: '1.4rem', fontWeight: 600 }}>Demand Forecast vs Current Holdings</h3>
        <div style={{ height: '420px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="productName" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 13}} tickMargin={12} />
              <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 13}} tickMargin={12} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ background: 'rgba(24, 24, 27, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', padding: '16px' }}
                itemStyle={{ color: 'var(--text-main)', fontWeight: 500, padding: '4px 0' }}
              />
              <Legend wrapperStyle={{ paddingTop: '24px' }} iconType="circle" />
              <Bar dataKey="currentStock" name="Current Stock" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={60} animationDuration={1500} />
              <Bar dataKey="projectedDemand" name="Projected Demand" fill="var(--accent)" radius={[6, 6, 0, 0]} maxBarSize={60} animationDuration={1500}>
                 {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isRestockNeeded ? "var(--danger)" : "var(--accent)"} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
