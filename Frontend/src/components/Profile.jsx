import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';

const Profile = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ password: '', newPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:3001/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setProfile(data.user);
          setForm(data.user);
        } else {
          setError(data.error || 'Failed to fetch profile.');
        }
      } catch (err) {
        setError('Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name || !form.name.trim()) {
      setError('Name is required.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      for (const key in form) {
        if (form[key] !== undefined && form[key] !== null) {
          formData.append(key, form[key]);
        }
      }
      // If you add image upload later, append it here as well

      const res = await fetch('http://localhost:3001/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setSuccess('Profile updated successfully!');
        setEdit(false);
      } else {
        setError(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePwChange = e => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  };

  const handlePwSave = async e => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (!pwForm.password || !pwForm.newPassword) {
      setPwError('Both fields are required.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch('http://localhost:3001/profile/password', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(pwForm)
      });
      const data = await res.json();
      if (res.ok) {
        setPwSuccess('Password changed successfully!');
        setPwForm({ password: '', newPassword: '' });
      } else {
        setPwError(data.error || 'Failed to change password.');
      }
    } catch (err) {
      setPwError('Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', color: '#b8860b', fontSize: 22, marginTop: 60 }}>
    <div className="spinner" style={{ margin: '0 auto 18px', width: 48, height: 48, border: '6px solid #f3e9d2', borderTop: '6px solid #b8860b', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    Loading your profile...
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>;
  if (error) return <div style={{ textAlign: 'center', color: 'red', fontSize: 16 }}>{error}</div>;
  if (!profile) return <div style={{ textAlign: 'center', color: '#888', fontSize: 18, marginTop: 60 }}>
    <img src="/menu-images/CoffeeCup.jpeg" alt="No profile" style={{ width: 80, opacity: 0.5, marginBottom: 18 }} />
    <div>No profile found.</div>
  </div>;

  return (
    <div className="menu-container" style={{ maxWidth: 500, margin: '0 auto', padding: '40px 12px' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        {/* Profile image removed as per user request */}
      </div>
      <h1 style={{ color: '#3b2f2f', fontWeight: 700, marginBottom: 24, fontSize: '2em', textAlign: 'center' }}>Your Profile</h1>
      {edit ? (
        <form onSubmit={handleSave} style={{ background: '#fffaf5', borderRadius: 12, boxShadow: '0 1px 6px rgba(59,47,47,0.08)', padding: 28, marginBottom: 32 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Name*</label>
            <input name="name" value={form.name || ''} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #b8860b', marginTop: 4, background: '#fff', color: '#3b2f2f', fontWeight: 500 }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Email</label>
            <input name="email" value={form.email || ''} disabled style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0c9a6', marginTop: 4, background: '#f8f9fa', color: '#3b2f2f', fontWeight: 500 }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Phone</label>
            <input name="phone" value={form.phone || ''} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #b8860b', marginTop: 4, background: '#fff', color: '#3b2f2f', fontWeight: 500 }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Address</label>
            <input name="address" value={form.address || ''} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #b8860b', marginTop: 4, background: '#fff', color: '#3b2f2f', fontWeight: 500 }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>City</label>
            <input name="city" value={form.city || ''} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #b8860b', marginTop: 4, background: '#fff', color: '#3b2f2f', fontWeight: 500 }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>State</label>
            <input name="state" value={form.state || ''} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #b8860b', marginTop: 4, background: '#fff', color: '#3b2f2f', fontWeight: 500 }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Pincode</label>
            <input name="pincode" value={form.pincode || ''} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #b8860b', marginTop: 4, background: '#fff', color: '#3b2f2f', fontWeight: 500 }} />
          </div>
          {success && <div style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
            <button type="submit" className="menu-order-btn" style={{ flex: 1 }}>Save</button>
            <button type="button" onClick={() => { setEdit(false); setForm(profile); setError(''); setSuccess(''); }} style={{ flex: 1, background: '#fff', color: '#b8860b', border: '1px solid #b8860b', borderRadius: 8, padding: '10px 0', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      ) : (
        <div style={{ background: '#fffaf5', borderRadius: 12, boxShadow: '0 1px 6px rgba(59,47,47,0.08)', padding: 28, marginBottom: 32 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Name*</label>
            <input value={form.name || ''} disabled style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0c9a6', marginTop: 4, background: '#fffaf5', color: '#3b2f2f', fontWeight: 500 }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Email</label>
            <input value={form.email || ''} disabled style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0c9a6', marginTop: 4, background: '#fffaf5', color: '#3b2f2f', fontWeight: 500 }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Phone</label>
            <input value={form.phone || ''} disabled style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0c9a6', marginTop: 4, background: '#fffaf5', color: '#3b2f2f', fontWeight: 500 }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Address</label>
            <input value={form.address || ''} disabled style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0c9a6', marginTop: 4, background: '#fffaf5', color: '#3b2f2f', fontWeight: 500 }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>City</label>
            <input value={form.city || ''} disabled style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0c9a6', marginTop: 4, background: '#fffaf5', color: '#3b2f2f', fontWeight: 500 }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>State</label>
            <input value={form.state || ''} disabled style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0c9a6', marginTop: 4, background: '#fffaf5', color: '#3b2f2f', fontWeight: 500 }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Pincode</label>
            <input value={form.pincode || ''} disabled style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e0c9a6', marginTop: 4, background: '#fffaf5', color: '#3b2f2f', fontWeight: 500 }} />
          </div>
          <button type="button" onClick={() => setEdit(true)} className="menu-order-btn" style={{ width: '100%' }}>Edit Profile</button>
        </div>
      )}

      {/* Change Password Section removed as per user request */}
      <style>{`
        @media (max-width: 900px) {
          .menu-container { padding: 20px 12px !important; }
          h1 { font-size: 1.3em !important; }
        }
        @media (max-width: 600px) {
          .menu-container { padding: 8px 12px !important; }
          h1 { font-size: 1.1em !important; }
          input, button, textarea { font-size: 15px !important; }
        }
        @media (max-width: 480px) {
          .menu-container { padding: 2px 12px !important; }
          h1 { font-size: 1em !important; }
          input, button, textarea { font-size: 14px !important; }
        }
      `}</style>
    </div>
  );
};

export default Profile; 