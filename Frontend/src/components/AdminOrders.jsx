import React, { useEffect, useState } from 'react';
import Header from './Header.jsx';
import { useAuth } from './AuthContext.jsx';

const AdminOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch('http://localhost:3001/admin/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setOrders(Array.isArray(data.orders) ? data.orders : []);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setLoading(true);
    try {
      await fetch(`http://localhost:3001/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      await load();
    } finally { setLoading(false); }
  };

  const statuses = ['pending', 'paid', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 16px' }}>
        <h2 style={{ color: '#3b2f2f' }}>Manage Orders</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">Order</th>
              <th align="left">Status</th>
              <th align="left">Items</th>
              <th align="left">Total</th>
              <th align="left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const total = (o.items || []).reduce((s, i) => s + (i.price * i.quantity), 0);
              return (
                <tr key={o._id} style={{ borderTop: '1px solid #eee' }}>
                  <td>#{String(o._id).slice(-6).toUpperCase()}</td>
                  <td>{o.status}</td>
                  <td>{(o.items || []).length}</td>
                  <td>₹{total}</td>
                  <td>
                    <select disabled={loading} value={o.status} onChange={e => updateStatus(o._id, e.target.value)}>
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;