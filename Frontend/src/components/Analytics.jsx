import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, 
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';

const Analytics = () => {
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

    connection.start().catch(err => console.error("SignalR Analytics Error: ", err));

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
       <div className="skeleton" style={{ width: '400px', height: '60px' }}></div>
       <div style={{ display: 'flex', gap: '24px' }}>
         <div className="skeleton glass-panel" style={{ height: '350px', flex: 1 }}></div>
         <div className="skeleton glass-panel" style={{ height: '350px', flex: 1 }}></div>
       </div>
       <div className="skeleton glass-panel" style={{ height: '400px' }}></div>
    </div>
  );

  // Computed data for Pie Chart (Health Distribution)
  const healthData = [
    { name: 'Healthy Stock', value: data.filter(d => !d.isRestockNeeded).length },
    { name: 'Needs Restock', value: data.filter(d => d.isRestockNeeded).length }
  ];
  const pieColors = ['#10b981', '#f43f5e']; 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      <div className="animate-fade-in">
        <h1 className="text-gradient" style={{ fontSize: '2.4rem', marginBottom: '10px', fontWeight: 700, letterSpacing: '-0.5px' }}>Graph Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>In-depth visualizations of inventory distributions and forecasting metrics.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Area Chart: Inventory Spread */}
        <div className="glass-panel animate-fade-in delay-1" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', fontWeight: 600 }}>Stock Depth Analysis</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="productName" stroke="var(--text-muted)" tick={{fontSize: 12}} />
                <YAxis stroke="var(--text-muted)" tick={{fontSize: 12}} />
                <Tooltip contentStyle={{ background: 'rgba(24, 24, 27, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="currentStock" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorStock)" name="Stored Vol." />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: System Health */}
        <div className="glass-panel animate-fade-in delay-2" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', fontWeight: 600 }}>Warehouse Health Ratio</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {data.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No Products Available</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={healthData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value" >
                      {healthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'rgba(24, 24, 27, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bubble / Scatter Chart for Demand Heatmap */}
      <div className="glass-panel animate-fade-in delay-3" style={{ padding: '32px' }}>
        <h3 style={{ marginBottom: '24px', fontSize: '1.4rem', fontWeight: 600 }}>Demand Predictability Heatmap</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
          Visualizing products by Stock volume against Demand volume. Items on the upper-left represent high demand & low stock (CRITICAL), while bottom-right items are low demand & high stock (DEAD STOCK).
        </p>
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" dataKey="currentStock" name="Current Stock" unit=" items" stroke="var(--text-muted)">
                 <label value="← Low Stock Volume  /  High Stock Volume →" offset={-15} position="insideBottom" fill="var(--text-muted)" style={{fontSize: '0.8rem'}} />
              </XAxis>
              <YAxis type="number" dataKey="projectedDemand" name="Projected Lead Demand" stroke="var(--text-muted)" />
              <ZAxis dataKey="reorderLevel" name="Threshold Priority" range={[100, 800]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'rgba(24, 24, 27, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: '12px' }} />
              <Scatter name="Products" data={data} fill="var(--accent)" shape="circle">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isRestockNeeded ? "var(--danger)" : "var(--accent)"} />
                  ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
}

export default Analytics;
