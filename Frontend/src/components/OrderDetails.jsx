import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

const OrderDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:3001/orders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setOrder(data.order);
        else setError(data.error || 'Order not found.');
      } catch (err) {
        setError('Failed to fetch order.');
      } finally {
        setLoading(false);
      }
    };
    if (id && token) fetchOrder();
  }, [id, token]);

  if (loading) return <div style={{ textAlign: 'center', color: '#b8860b', fontSize: 22, marginTop: 60 }}>
    <div className="spinner" style={{ margin: '0 auto 18px', width: 48, height: 48, border: '6px solid #f3e9d2', borderTop: '6px solid #b8860b', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    Loading order details...
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>;
  if (error) return <div style={{ textAlign: 'center', color: 'red', fontSize: 18, marginTop: 60 }}>{error}</div>;
  if (!order) return null;

  const { items = [], address = '', phone = '', status = '', payment = {}, createdAt = new Date() } = order;
  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  const estDelivery = new Date(new Date(createdAt).getTime() + 40 * 60000);

  return (
    <div className="menu-container" style={{ maxWidth: 700, margin: '0 auto', padding: '40px 12px' }}>
      <h1 style={{ color: '#3b2f2f', fontWeight: 700, marginBottom: 18, fontSize: '2em', textAlign: 'center' }}>Order Details</h1>
      <div style={{ color: '#b8860b', fontSize: 18, marginBottom: 18, textAlign: 'center' }}>Order #{order._id.slice(-6).toUpperCase()}</div>
      <div style={{ background: '#fffaf5', borderRadius: 12, padding: 24, boxShadow: '0 1px 6px rgba(59,47,47,0.08)', marginBottom: 24 }}>
        <h2 style={{ color: '#3b2f2f', fontWeight: 600, marginBottom: 12, fontSize: '1.3em' }}>Order Summary</h2>
        {items.length > 0 ? (
          <>
            {items.map(item => (
              <div key={item.productId} style={{ display: 'flex', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                <img src={`http://localhost:3001/images/${item.image}`} alt={item.name} style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 6, marginRight: 12 }} />
                <div style={{ flex: 1, minWidth: 0 }}>{item.name} x {item.quantity}</div>
                <div style={{ fontWeight: 600, color: '#b8860b' }}>₹{item.price * item.quantity}</div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #e0c9a6', marginTop: 12, paddingTop: 12, textAlign: 'right', fontWeight: 700, color: '#3b2f2f' }}>
              Total: ₹{total}
            </div>
          </>
        ) : (
          <div style={{ color: '#666', textAlign: 'center', padding: 20 }}>
            No items in this order.
          </div>
        )}
      </div>
      <div style={{ marginBottom: 18 }}>
        <div><b>Status:</b> {status.charAt(0).toUpperCase() + status.slice(1)}</div>
        <div><b>Payment Method:</b> {payment.method ? payment.method.charAt(0).toUpperCase() + payment.method.slice(1) : 'N/A'}</div>
        <div><b>Delivery Address:</b> {address}</div>
        <div><b>Phone:</b> {phone}</div>
        <div><b>Order Date:</b> {new Date(createdAt).toLocaleString()}</div>
        <div><b>Estimated Delivery:</b> {estDelivery.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24, justifyContent: 'center' }}>
        <button onClick={() => navigate('/orders')} style={{ background: '#b8860b', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
          Back to Orders
        </button>
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

export default OrderDetails; 