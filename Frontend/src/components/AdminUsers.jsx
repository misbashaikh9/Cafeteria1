import React, { useEffect, useState } from 'react';
import Header from './Header.jsx';
import { useAuth } from './AuthContext.jsx';

const AdminUsers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);

  const load = async () => {
    const res = await fetch('http://localhost:3001/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setUsers(Array.isArray(data.users) ? data.users : []);
  };

  useEffect(() => { load(); }, []);

  const toggleAdmin = async (id, isAdmin) => {
    await fetch(`http://localhost:3001/admin/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ isAdmin: !isAdmin })
    });
    await load();
  };

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 16px' }}>
        <h2 style={{ color: '#3b2f2f' }}>Manage Users</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">Name</th>
              <th align="left">Email</th>
              <th align="left">Admin</th>
              <th align="left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderTop: '1px solid #eee' }}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.isAdmin ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => toggleAdmin(u._id, u.isAdmin)} style={{ padding: '6px 10px' }}>{u.isAdmin ? 'Revoke Admin' : 'Make Admin'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;