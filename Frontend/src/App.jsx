import React from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Inventory from './components/Inventory'
import Analytics from './components/Analytics'
import Sales from './components/Sales'
import AdminLogin from './components/AdminLogin'
import NotificationsPanel from './components/NotificationsPanel'
import QuickStatsSidebar from './components/QuickStatsSidebar'
import { Package, LayoutDashboard, User, LogOut, LineChart, ShoppingCart } from 'lucide-react'
const Layout = ({ children }) => {
  return (
    <>
      <div className="bg-mesh"></div>
      <div className="app-container">
        <div className="sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)'
            }}>
              <Package color="white" size={26} strokeWidth={2.5} />
            </div>
            <h2 className="text-gradient-primary" style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>
              SmartStock
            </h2>
          </div>

          <QuickStatsSidebar />

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>
            <NavLink to="/inventory" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Package size={20} />
              Inventory
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LineChart size={20} />
              Graph Analytics
            </NavLink>
            <NavLink to="/sales" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ShoppingCart size={20} />
              Sales & Dispatch
            </NavLink>
          </nav>

          {/* User Profile Widget anchored to bottom using auto margins */}
          <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            <div className="interactive-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid transparent', transition: 'all 0.3s' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)' }}>
                <User size={20} color="white" />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Admin System</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>admin@smartstock.io</div>
              </div>
              <button
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '8px', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

        </div>
        <div className="main-content" style={{ position: 'relative' }}>
          <NotificationsPanel />
          {children}
        </div>
      </div>
    </>
  )
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/sales" element={<Sales />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
