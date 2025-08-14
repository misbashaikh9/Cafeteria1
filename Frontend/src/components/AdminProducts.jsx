import React, { useEffect, useState } from 'react';
import Header from './Header.jsx';
import { useAuth } from './AuthContext.jsx';

const AdminProducts = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', image: '', category: '' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch('http://localhost:3001/products');
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  };

  useEffect(() => { load(); }, []);

  const createProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...form, price: Number(form.price) })
      });
      if (res.ok) {
        await load();
        setForm({ name: '', description: '', price: '', image: '', category: '' });
      }
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`http://localhost:3001/admin/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    await load();
  };

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 16px' }}>
        <h2 style={{ color: '#3b2f2f' }}>Manage Products</h2>
        <form onSubmit={createProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, margin: '12px 0 20px' }}>
          <input required placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
          <input required placeholder="Description" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
          <input required placeholder="Price" type="number" step="0.01" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} />
          <input required placeholder="Image path" value={form.image} onChange={e=>setForm({...form, image: e.target.value})} />
          <input required placeholder="Category" value={form.category} onChange={e=>setForm({...form, category: e.target.value})} />
          <button disabled={loading} type="submit" style={{ padding: '8px 12px' }}>{loading ? 'Saving...' : 'Add'}</button>
        </form>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">Name</th>
              <th align="left">Category</th>
              <th align="left">Price</th>
              <th align="left">Rating</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} style={{ borderTop: '1px solid #eee' }}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>₹{p.price}</td>
                <td>{p.averageRating ?? p.rating ?? 0}</td>
                <td><button onClick={() => removeProduct(p._id)} style={{ color: '#b00020', background: 'transparent', border: 'none', cursor: 'pointer' }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;