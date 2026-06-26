import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, Package } from 'lucide-react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import { useNavigate } from 'react-router-dom';

const NotificationsPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5194/inventoryHub")
      .withAutomaticReconnect()
      .build();

    connection.on("InventoryUpdated", () => {
      fetchAlerts();
      setPulse(true);
      setTimeout(() => setPulse(false), 3000);
    });

    connection.start().catch(err => console.error(err));

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => { 
        connection.stop(); 
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('http://localhost:5194/api/products');
      const lowStock = res.data.filter(p => p.currentStock <= p.reorderLevel);
      setAlerts(lowStock);
    } catch (err) { console.error(err); }
  };

  const handleNotificationClick = () => {
    setIsOpen(false);
    navigate('/inventory'); 
  }

  return (
    <div ref={dropdownRef} style={{ position: 'absolute', top: '32px', right: '40px', zIndex: 100 }}>
      <div 
        className={`interactive-card ${pulse ? 'pulse-anim' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'rgba(24, 24, 27, 0.65)', backdropFilter: 'blur(10px)', 
          border: '1px solid var(--border)', borderRadius: '50%', padding: '12px', 
          cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}
      >
        <Bell size={22} color="var(--text-main)" />
        {alerts.length > 0 && (
          <div style={{
            position: 'absolute', top: '-4px', right: '-4px', background: 'var(--danger)', color: 'white',
            fontSize: '0.75rem', fontWeight: 'bold', width: '22px', height: '22px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-dark)'
          }}>
            {alerts.length}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="glass-panel animate-fade-in" style={{ 
          position: 'absolute', top: '60px', right: '0', width: '380px', 
          padding: '0', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          border: '1px solid rgba(244, 63, 94, 0.3)'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(244, 63, 94, 0.05)' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="var(--danger)"/> Notifications Alert
            </h4>
            {alerts.length > 0 && <span className="badge badge-danger">{alerts.length} Critical</span>}
          </div>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {alerts.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Bell size={32} opacity={0.2} style={{ display: 'block', margin: '0 auto 10px' }}/>
                You are all caught up! No low stock limits reached.
              </div>
            ) : (
              alerts.map(a => (
                <div 
                  key={a.id} 
                  onClick={() => handleNotificationClick()}
                  style={{ 
                    padding: '16px 20px', borderBottom: '1px solid var(--border)', 
                    cursor: 'pointer', transition: 'background 0.2s',
                    display: 'flex', alignItems: 'center', gap: '14px'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '10px', borderRadius: '50%' }}>
                     <Package size={18} color="var(--danger)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                       {a.name} <AlertTriangle size={12} color="var(--danger)" />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Only <strong style={{ color: 'var(--danger)' }}>{a.currentStock}</strong> left over minimum boundary of {a.reorderLevel}.</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
