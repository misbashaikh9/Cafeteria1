import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';

const eyeOpen = '/menu-images/eye-open.png';
const eyeClose = '/menu-images/eye-close.png';

const Settings = () => {
  const { logout, token } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true
  });
  const [testMessage, setTestMessage] = useState('');

  // Change password state and handlers
  const [pwForm, setPwForm] = useState({ password: '', newPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

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

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSettings({ emailNotifications: settings.emailNotifications || true });
    }
  }, []);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    
    // Show feedback for email notifications
    if (key === 'emailNotifications') {
      setTestMessage(value ? '✅ Email notifications enabled' : '❌ Email notifications disabled');
      setTimeout(() => setTestMessage(''), 3000);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const testEmailNotification = async () => {
    if (!token) {
      setTestMessage('❌ Please login to test email notifications');
      return;
    }
    
    setTestMessage('📧 Sending test email...');
    try {
      const response = await fetch('http://localhost:3001/test-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setTestMessage('✅ Test email sent successfully!');
      } else {
        setTestMessage('❌ Failed to send test email');
      }
    } catch (error) {
      setTestMessage('❌ Error sending test email');
    }
    
    setTimeout(() => setTestMessage(''), 3000);
  };

  if (testMessage === 'loading') return <div style={{ textAlign: 'center', color: '#b8860b', fontSize: 22, marginTop: 60 }}>
    <div className="spinner" style={{ margin: '0 auto 18px', width: 48, height: 48, border: '6px solid #f3e9d2', borderTop: '6px solid #b8860b', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    Loading settings...
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>;

  return (
    <div className="menu-container" style={{ maxWidth: 600, margin: '0 auto', padding: '40px 12px' }}>
      <h1 style={{ color: '#3b2f2f', fontWeight: 700, marginBottom: 24, fontSize: '2em', textAlign: 'center' }}>Settings</h1>
      
      {testMessage && (
        <div style={{ 
          background: testMessage.includes('✅') ? '#d4edda' : testMessage.includes('❌') ? '#f8d7da' : '#d1ecf1',
          color: testMessage.includes('✅') ? '#155724' : testMessage.includes('❌') ? '#721c24' : '#0c5460',
          padding: 12,
          borderRadius: 8,
          marginBottom: 20,
          textAlign: 'center',
          fontWeight: 600
        }}>
          {testMessage}
        </div>
      )}
      
      <div style={{ display: 'grid', gap: 24 }}>
        {/* Notifications */}
        <div style={{ background: '#fffaf5', borderRadius: 12, padding: 24, boxShadow: '0 1px 6px rgba(59,47,47,0.08)' }}>
          <h3 style={{ color: '#3b2f2f', marginBottom: 20 }}>Notifications</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                Email Notifications
                {settings.emailNotifications && <span style={{ fontSize: 16 }}>📧</span>}
              </div>
              <div style={{ color: '#666', fontSize: 14 }}>Receive order confirmations via email</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 50, height: 24 }}>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: settings.emailNotifications ? '#b8860b' : '#ccc',
                borderRadius: 24,
                transition: '0.3s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: 18,
                  width: 18,
                  left: 3,
                  bottom: 3,
                  background: '#fff',
                  borderRadius: '50%',
                  transition: '0.3s',
                  transform: settings.emailNotifications ? 'translateX(26px)' : 'translateX(0)'
                }}></span>
              </span>
            </label>
          </div>
          {settings.emailNotifications && (
            <button
              onClick={testEmailNotification}
              style={{
                background: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 14,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              🧪 Test Email Notification
            </button>
          )}
        </div>

        {/* Security - Change Password */}
        <div style={{ background: '#fffaf5', borderRadius: 12, padding: 24, boxShadow: '0 1px 6px rgba(59,47,47,0.08)' }}>
          <h3 style={{ color: '#3b2f2f', marginBottom: 20 }}>Security</h3>
          <form onSubmit={handlePwSave}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 600 }}>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password"
                  type={showCurrentPw ? 'text' : 'password'}
                  value={pwForm.password}
                  onChange={handlePwChange}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #b8860b', marginTop: 4, background: '#fff', color: '#3b2f2f', fontWeight: 500, paddingRight: 40 }}
                />
                <img
                  src={showCurrentPw ? eyeOpen : eyeClose}
                  alt={showCurrentPw ? 'Hide' : 'Show'}
                  onClick={() => setShowCurrentPw(v => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 22, height: 22, cursor: 'pointer', opacity: 0.7 }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 600 }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="newPassword"
                  type={showNewPw ? 'text' : 'password'}
                  value={pwForm.newPassword}
                  onChange={handlePwChange}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #b8860b', marginTop: 4, background: '#fff', color: '#3b2f2f', fontWeight: 500, paddingRight: 40 }}
                />
                <img
                  src={showNewPw ? eyeOpen : eyeClose}
                  alt={showNewPw ? 'Hide' : 'Show'}
                  onClick={() => setShowNewPw(v => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 22, height: 22, cursor: 'pointer', opacity: 0.7 }}
                />
              </div>
            </div>
            {pwSuccess && <div style={{ color: 'green', marginBottom: 12 }}>{pwSuccess}</div>}
            {pwError && <div style={{ color: 'red', marginBottom: 12 }}>{pwError}</div>}
            <button type="submit" className="menu-order-btn" style={{ width: '100%', marginTop: 8 }} disabled={pwLoading}>{pwLoading ? 'Saving...' : 'Change Password'}</button>
          </form>
        </div>

        {/* Account Actions */}
        <div style={{ background: '#fffaf5', borderRadius: 12, padding: 24, boxShadow: '0 1px 6px rgba(59,47,47,0.08)' }}>
          <h3 style={{ color: '#3b2f2f', marginBottom: 20 }}>Account</h3>
          <button 
            onClick={handleLogout}
            style={{ 
              background: '#b8860b', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 8, 
              padding: '12px 24px', 
              fontWeight: 600, 
              fontSize: 15, 
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>
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

export default Settings; 