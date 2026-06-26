import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';

const QuickStatsSidebar = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStock: 0,
        todaysSales: 0,
        ordersPending: 8 // Mocked since there's no pending order API
    });

    const fetchStats = async () => {
        try {
            const dashRes = await axios.get('http://localhost:5194/api/forecast/dashboard');
            const salesRes = await axios.get('http://localhost:5194/api/sales');
            
            const lowStockCount = dashRes.data.filter(d => d.isRestockNeeded).length;
            
            // Calculate today's sales (number of sales dispatched today)
            const today = new Date().setHours(0,0,0,0);
            const todaysSalesTotal = salesRes.data.filter(s => new Date(s.saleDate).setHours(0,0,0,0) === today).length;

            setStats(prev => ({
                ...prev,
                totalProducts: dashRes.data.length,
                lowStock: lowStockCount,
                todaysSales: todaysSalesTotal
            }));
        } catch (err) {
            console.error("QuickStats Error", err);
        }
    };

    useEffect(() => {
        fetchStats();

        const connection = new signalR.HubConnectionBuilder()
          .withUrl("http://localhost:5194/inventoryHub")
          .withAutomaticReconnect()
          .build();

        connection.on("InventoryUpdated", () => {
          fetchStats(); 
        });

        connection.start().catch(err => console.error("SignalR Sidebar Error: ", err));

        return () => { connection.stop(); };
    }, []);

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            <div style={{ fontSize: '0.80rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Quick Stats
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    <span>📦</span> Total Products
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{stats.totalProducts}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: stats.lowStock > 0 ? 'var(--danger)' : 'var(--text-main)' }}>
                    <span>⚠️</span> Low Stock
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: stats.lowStock > 0 ? 'var(--danger)' : 'inherit' }}>{stats.lowStock}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    <span>📈</span> Today's Sales
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{stats.todaysSales}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    <span>🛒</span> Orders Pending
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent)' }}>{stats.ordersPending}</div>
            </div>
        </div>
    );
}

export default QuickStatsSidebar;
