import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';

const OrderHistory = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});
  const [reviews, setReviews] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({}); // { [orderId]: { rating, comment, loading, error, success } }

  useEffect(() => {
    const fetchOrdersAndReviews = async () => {
      setLoading(true);
      setError('');
      try {
        const [ordersRes, reviewsRes] = await Promise.all([
          fetch('http://localhost:3001/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:3001/reviews', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        const ordersData = await ordersRes.json();
        const reviewsData = await reviewsRes.json();
        if (ordersRes.ok) setOrders(ordersData.orders || []);
        else setError(ordersData.error || 'Failed to fetch orders.');
        if (reviewsRes.ok) setReviews(reviewsData.reviews || []);
      } catch (err) {
        setError('Failed to fetch orders or reviews.');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchOrdersAndReviews();
  }, [token]);

  const toggleExpand = (orderId) => {
    setExpanded(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  // Helper for status display
  const getStatusDisplay = (order) => {
    const status = order.status;
    const paymentMethod = order.paymentMethod;
    if (status === 'paid') {
      return { label: '✅ Paid', color: '#2e7d32', bg: '#e8f5e8', border: '#4caf50' };
    }
    if (status === 'preparing') {
      return { label: '🧑‍🍳 Preparing', color: '#1976d2', bg: '#e3f2fd', border: '#90caf9' };
    }
    if (status === 'out_for_delivery') {
      return { label: '🚚 Out for Delivery', color: '#ff9800', bg: '#fff8e1', border: '#ffb74d' };
    }
    if (status === 'delivered') {
      return { label: '📦 Delivered', color: '#388e3c', bg: '#e8f5e9', border: '#66bb6a' };
    }
    if (status === 'cancelled') {
      return { label: '❌ Cancelled', color: '#c62828', bg: '#ffebee', border: '#ef9a9a' };
    }
    // Pending (default)
    if (paymentMethod === 'cash') {
      return { label: '⏳ Pending (Cash on Delivery)', color: '#856404', bg: '#fff3cd', border: '#ffeaa7' };
    }
    return { label: '⏳ Pending', color: '#856404', bg: '#fff3cd', border: '#ffeaa7' };
  };

  const handleFeedbackChange = (orderId, field, value) => {
    setFeedbackForm(prev => ({
      ...prev,
      [orderId]: { ...prev[orderId], [field]: value }
    }));
  };

  const handleFeedbackSubmit = async (orderId) => {
    setFeedbackForm(prev => ({ ...prev, [orderId]: { ...prev[orderId], loading: true, error: '', success: '' } }));
    const { rating, comment } = feedbackForm[orderId] || {};
    if (!rating) {
      setFeedbackForm(prev => ({ ...prev, [orderId]: { ...prev[orderId], loading: false, error: 'Please select a rating.' } }));
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ orderId, rating, comment })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackForm(prev => ({ ...prev, [orderId]: { rating: '', comment: '', loading: false, error: '', success: 'Feedback submitted!' } }));
        setReviews(prev => [...prev, data.feedback]);
      } else {
        setFeedbackForm(prev => ({ ...prev, [orderId]: { ...prev[orderId], loading: false, error: data.error || 'Failed to submit feedback.' } }));
      }
    } catch (err) {
      setFeedbackForm(prev => ({ ...prev, [orderId]: { ...prev[orderId], loading: false, error: 'Failed to submit feedback.' } }));
    }
  };

  return (
    <div className="menu-container" style={{ maxWidth: 800, margin: '0 auto', padding: 40 }}>
      <h1 style={{ color: '#3b2f2f', fontWeight: 700, marginBottom: 24, fontSize: '2em', textAlign: 'center' }}>Your Orders</h1>
      {loading ? (
        <div style={{ textAlign: 'center', color: '#b8860b', fontSize: 22, marginTop: 60 }}>
          <div className="spinner" style={{ margin: '0 auto 18px', width: 48, height: 48, border: '6px solid #f3e9d2', borderTop: '6px solid #b8860b', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          Loading your orders...
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', color: 'red', fontSize: 16 }}>{error}</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', fontSize: 18, marginTop: 60 }}>
          <img src="/menu-images/CoffeeCup.jpeg" alt="No orders" style={{ width: 80, opacity: 0.5, marginBottom: 18 }} />
          <div>No orders yet.<br />Start your first order from the <b>Menu</b>!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {orders.map(order => {
            const total = (order.items || []).reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
            const createdAt = new Date(order.createdAt);
            return (
              <div key={order._id} style={{ background: '#fffaf5', borderRadius: 12, boxShadow: '0 1px 6px rgba(59,47,47,0.08)', padding: 24, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', boxSizing: 'border-box', overflow: 'visible' }}>
                {/* Show first product image as order thumbnail */}
                {order.items && order.items.length > 0 && (
                  <img
                    src={`http://localhost:3001/images/${order.items[0].image}`}
                    alt={order.items[0].name}
                    style={{ width: 54, height: 40, objectFit: 'cover', borderRadius: 8, boxShadow: '0 1px 4px rgba(59,47,47,0.10)' }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <b style={{ color: '#b8860b' }}>Order #{order._id.slice(-6).toUpperCase()}</b>
                      <span style={{ color: '#888', marginLeft: 16, fontSize: 14 }}>
                        {createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="order-status-btn-row" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
                      {(() => {
                        const status = getStatusDisplay(order);
                        return (
                          <div className="order-status-badge" style={{
                            padding: '6px 16px',
                            borderRadius: 8,
                            background: status.bg,
                            color: status.color,
                            fontWeight: 600,
                            fontSize: 15,
                            border: `1px solid ${status.border}`,
                            flex: '1 1 0',
                            minWidth: 120,
                            maxWidth: '100%',
                            textAlign: 'center',
                            boxSizing: 'border-box',
                            marginRight: 0
                          }}>
                            {status.label}
                          </div>
                        );
                      })()}
                      <button
                        onClick={() => toggleExpand(order._id)}
                        style={{
                          background: '#b8860b',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '6px 16px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: 14,
                          flex: '0 0 auto',
                          minWidth: 110,
                          marginLeft: 0
                        }}
                      >
                        {expanded[order._id] ? 'Hide Details' : 'Show Details'}
                      </button>
                      <button
                        onClick={() => window.location.href = `/orders/${order._id}`}
                        style={{
                          background: '#fff',
                          color: '#b8860b',
                          border: '1px solid #b8860b',
                          borderRadius: 8,
                          padding: '6px 16px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: 14,
                          flex: '0 0 auto',
                          minWidth: 110,
                          marginLeft: 0
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  {expanded[order._id] && (
                    <>
                      <div style={{ marginBottom: 10 }}>
                        <b>Delivery Address:</b> {order.address}<br />
                        <b>Phone:</b> {order.phone}
                      </div>
                      <div style={{ marginBottom: 10, overflowX: 'auto' }}>
                        <b>Order Items:</b>
                        <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse', fontSize: 15, minWidth: 320 }}>
                          <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                              <th style={{ padding: 6, textAlign: 'left', borderBottom: '1px solid #e0c9a6' }}>Item</th>
                              <th style={{ padding: 6, textAlign: 'center', borderBottom: '1px solid #e0c9a6' }}>Qty</th>
                              <th style={{ padding: 6, textAlign: 'right', borderBottom: '1px solid #e0c9a6' }}>Price</th>
                              <th style={{ padding: 6, textAlign: 'right', borderBottom: '1px solid #e0c9a6' }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map(item => (
                              <tr key={item.productId}>
                                <td style={{ padding: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <img
                                    src={`http://localhost:3001/images/${item.image}`}
                                    alt={item.name}
                                    style={{ width: 36, height: 28, objectFit: 'cover', borderRadius: 4, marginRight: 6 }}
                                  />
                                  {item.name}
                                </td>
                                <td style={{ padding: 6, textAlign: 'center' }}>{item.quantity}</td>
                                <td style={{ padding: 6, textAlign: 'right' }}>₹{item.price}</td>
                                <td style={{ padding: 6, textAlign: 'right' }}>₹{(Number(item.price) || 0) * (Number(item.quantity) || 0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ textAlign: 'right', fontWeight: 700, color: '#b8860b', fontSize: 17 }}>
                        Total: ₹{total}
                      </div>
                      {/* Feedback/Review Section */}
                      {order.status === 'delivered' && (
                        (() => {
                          const review = reviews.find(r => r.orderId === order._id);
                          if (review) {
                            return (
                              <div style={{ marginTop: 18, background: '#e8f5e9', borderRadius: 8, padding: 16, border: '1px solid #66bb6a' }}>
                                <b style={{ color: '#388e3c' }}>Your Feedback:</b><br />
                                <span style={{ fontSize: 18, color: '#388e3c' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                <div style={{ marginTop: 6, color: '#333' }}>{review.comment}</div>
                              </div>
                            );
                          }
                          // Show feedback form if not submitted
                          const form = feedbackForm[order._id] || {};
                          return (
                            <div style={{ marginTop: 18, background: '#f8f9fa', borderRadius: 8, padding: 16, border: '1px solid #e0c9a6' }}>
                              <b style={{ color: '#b8860b' }}>Leave Feedback:</b>
                              <div style={{ margin: '10px 0' }}>
                                {[1,2,3,4,5].map(star => (
                                  <span
                                    key={star}
                                    style={{
                                      fontSize: 22,
                                      color: (form.rating || 0) >= star ? '#ffc107' : '#ccc',
                                      cursor: 'pointer',
                                      marginRight: 2
                                    }}
                                    onClick={() => handleFeedbackChange(order._id, 'rating', star)}
                                  >★</span>
                                ))}
                              </div>
                              <textarea
                                placeholder="Write your feedback (optional)"
                                value={form.comment || ''}
                                onChange={e => handleFeedbackChange(order._id, 'comment', e.target.value)}
                                rows={2}
                                style={{ width: '100%', borderRadius: 6, border: '1px solid #e0c9a6', padding: 8, fontSize: 15, marginBottom: 8 }}
                              />
                              {form.error && <div style={{ color: 'red', marginBottom: 6 }}>{form.error}</div>}
                              {form.success && <div style={{ color: 'green', marginBottom: 6 }}>{form.success}</div>}
                              <button
                                onClick={() => handleFeedbackSubmit(order._id)}
                                disabled={form.loading}
                                style={{ background: '#b8860b', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                              >
                                {form.loading ? 'Submitting...' : 'Submit Feedback'}
                              </button>
                            </div>
                          );
                        })()
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`
        @media (max-width: 768px) {
          .menu-container { padding: 12px 2px !important; }
          h1 { font-size: 1.3em !important; }
        }
        @media (max-width: 600px) {
          .menu-container { padding: 4px 0 !important; }
          h1 { font-size: 1.1em !important; }
          table { font-size: 13px !important; }
          th, td { padding: 4px !important; }
        }
        @media (max-width: 480px) {
          .menu-container { padding: 2px 0 !important; }
          h1 { font-size: 1em !important; }
          .menu-card, .order-card { padding: 8px !important; }
          button { font-size: 13px !important; padding: 7px 0 !important; }
        }
        @media (max-width: 1200px) {
          .order-status-btn-row { flex-wrap: wrap !important; width: 100% !important; }
          .order-status-badge, .order-status-btn-row button { min-width: 0 !important; max-width: 100% !important; }
        }
        @media (max-width: 900px) {
          .order-status-btn-row { flex-direction: column !important; align-items: stretch !important; gap: 10px !important; }
          .order-status-badge { min-width: 0 !important; width: 100% !important; font-size: 14px !important; }
          .order-status-btn-row button { width: 100% !important; min-width: 0 !important; margin-left: 0 !important; }
        }
        @media (max-width: 600px) {
          .order-status-btn-row { flex-direction: column !important; align-items: stretch !important; gap: 8px !important; width: 100% !important; }
          .order-status-badge { min-width: 0 !important; width: 100% !important; font-size: 13px !important; }
          .order-status-btn-row button { width: 100% !important; min-width: 0 !important; margin-top: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default OrderHistory; 