import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header.jsx';

const AdminDashboard = () => {
  return (
    <div>
      <Header />
      <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 16px' }}>
        <h1 style={{ color: '#3b2f2f', marginBottom: 16 }}>Admin Dashboard</h1>
        <p style={{ color: '#6d4c41' }}>Manage products, orders, and users.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 24 }}>
          <Link to="/admin/products" style={cardStyle}>📦 Products</Link>
          <Link to="/admin/orders" style={cardStyle}>🧾 Orders</Link>
          <Link to="/admin/users" style={cardStyle}>👤 Users</Link>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  background: '#fff',
  border: '1px solid rgba(184,134,11,0.2)',
  borderRadius: 12,
  padding: 20,
  textDecoration: 'none',
  color: '#3b2f2f',
  fontWeight: 600,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
};

export default AdminDashboard;