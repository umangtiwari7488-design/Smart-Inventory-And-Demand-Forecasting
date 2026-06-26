import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Lock, Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Mock authentication - replace with real API call
    setTimeout(() => {
      if (email === 'admin@smartstock.io' && password === 'admin123') {
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #4f8cff 0%, #7dc3ff 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px', justifyContent: 'center' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #4f8cff 0%, #7dc3ff 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(79, 140, 255, 0.35)'
          }}>
            <Package color="white" size={28} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#232323', margin: 0 }}>
            SmartStock
          </h1>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#232323', marginBottom: '8px', textAlign: 'center' }}>
          Admin Login
        </h2>
        <p style={{ color: '#6d6d6d', marginBottom: '32px', textAlign: 'center' }}>
          Enter your credentials to access the admin panel
        </p>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#232323' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@smartstock.io"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid #e0e0e0',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4f8cff'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#232323' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  paddingRight: '48px',
                  borderRadius: '10px',
                  border: '1px solid #e0e0e0',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4f8cff'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6d6d6d',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #4f8cff 0%, #7dc3ff 100%)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 15px rgba(79, 140, 255, 0.3)'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(79, 140, 255, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(79, 140, 255, 0.3)';
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <a href="/" style={{ color: '#4f8cff', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Back to Dashboard
          </a>
        </div>

        <div style={{ marginTop: '32px', padding: '16px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', color: '#6d6d6d' }}>
          <strong>Demo Credentials:</strong><br />
          Email: admin@smartstock.io<br />
          Password: admin123
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;