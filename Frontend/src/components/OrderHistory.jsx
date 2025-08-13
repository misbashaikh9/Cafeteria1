import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import Header from './Header.jsx';

const getMonthOptions = (orders) => {
  const months = new Set();
  orders.forEach(order => {
    const date = new Date(order.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.add(key);
  });
  return Array.from(months).sort((a, b) => b.localeCompare(a));
};

const OrderHistory = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});
  const [reviews, setReviews] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({});
  const [selectedMonth, setSelectedMonth] = useState('all');

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
    const paymentMethod = order.payment && order.payment.method ? order.payment.method : 'cash';
    if (status === 'paid') {
      return { label: '✅ Paid', color: '#2e7d32', bg: '#e8f5e8', border: '#4caf50' };
    }
    if (status === 'preparing') {
      return { label: '🧑‍🍳 Preparing', color: '#1976d2', bg: '#e3f2fd', border: '#90caf9' };
    }
    if (status === 'out_for_delivery') {
      return { label: '🚚 Out for Delivery', color: '#ff9800', bg: '#fff8e1', border: '#ffb74d' };
    }
    // Do not return a badge for delivered orders
    if (status === 'delivered') {
      return null;
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
        
        // Refresh top-rated products data to update ratings on menu page
        try {
          const topRatedRes = await fetch('http://localhost:3001/products/top-rated');
          if (topRatedRes.ok) {
            const topRatedData = await topRatedRes.json();
            // Store in localStorage so Menu page can access updated data
            localStorage.setItem('topRatedProducts', JSON.stringify(topRatedData.topRatedByCategory || {}));
          }
        } catch (err) {
          console.log('Could not refresh top-rated products:', err);
        }
      } else {
        setFeedbackForm(prev => ({ ...prev, [orderId]: { ...prev[orderId], loading: false, error: data.error || 'Failed to submit feedback.' } }));
      }
    } catch (err) {
      setFeedbackForm(prev => ({ ...prev, [orderId]: { ...prev[orderId], loading: false, error: 'Failed to submit feedback.' } }));
    }
  };

  const handleProductReviewSubmit = async (orderId, productId) => {
    const formKey = `${orderId}_${productId}`;
    setFeedbackForm(prev => ({ ...prev, [formKey]: { ...prev[formKey], loading: true, error: '', success: '' } }));
    
    const { rating, comment } = feedbackForm[formKey] || {};
    if (!rating) {
      setFeedbackForm(prev => ({ ...prev, [formKey]: { ...prev[formKey], loading: false, error: 'Please select a rating.' } }));
      return;
    }
    
    try {
      const res = await fetch('http://localhost:3001/product-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ orderId, productId, rating, comment })
      });
      
      const data = await res.json();
      if (res.ok) {
        setFeedbackForm(prev => ({ ...prev, [formKey]: { ...prev[formKey], loading: false, success: 'Review submitted successfully!' } }));
        
        // Refresh reviews
        const reviewsRes = await fetch('http://localhost:3001/reviews', { headers: { 'Authorization': `Bearer ${token}` } });
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.reviews || []);
        }
        
        // Clear form after success
        setTimeout(() => {
          setFeedbackForm(prev => {
            const newForm = { ...prev };
            delete newForm[formKey];
            return newForm;
          });
        }, 2000);
      } else {
        setFeedbackForm(prev => ({ ...prev, [formKey]: { ...prev[formKey], loading: false, error: data.error || 'Failed to submit review.' } }));
      }
    } catch (err) {
      setFeedbackForm(prev => ({ ...prev, [formKey]: { ...prev[formKey], loading: false, error: 'Failed to submit review.' } }));
    }
  };

  return (
    <>
      <Header />
      <section style={{ backgroundColor: '#faf8f3', minHeight: '100vh' }}>
        <div className="menu-container" style={{ maxWidth: 800, margin: '0 auto', padding: '40px 12px' }}>
      <h1 style={{ color: '#3b2f2f', fontWeight: 700, marginBottom: 24, fontSize: '2em', textAlign: 'center' }}>Your Orders</h1>
      <div style={{ marginBottom: 24, textAlign: 'right' }}>
        <label htmlFor="monthFilter" style={{ marginRight: 8, fontWeight: 500 }}>Filter by Month:</label>
        <select
          id="monthFilter"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #b8860b', fontSize: 15, background: '#fff', color: '#3b2f2f' }}
        >
          <option value="all">All</option>
          {getMonthOptions(orders).map(monthKey => {
            const [year, month] = monthKey.split('-');
            const date = new Date(year, month - 1);
            return (
              <option key={monthKey} value={monthKey}>
                {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </option>
            );
          })}
        </select>
      </div>
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
          {(selectedMonth === 'all' ? orders : orders.filter(order => {
            const date = new Date(order.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            return key === selectedMonth;
          })).map(order => {
            const total = (order.items || []).reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
            const createdAt = new Date(order.createdAt);
            return (
              <div key={order._id} style={{ 
                background: '#fffaf5', 
                borderRadius: 12, 
                boxShadow: '0 1px 6px rgba(59,47,47,0.08)', 
                padding: 24, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 18, 
                flexWrap: 'wrap', 
                boxSizing: 'border-box', 
                overflow: 'visible',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px) scale(1.02)';
                e.target.style.boxShadow = '0 8px 25px rgba(59,47,47,0.15)';
                e.target.style.border = '1px solid rgba(184, 134, 11, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 1px 6px rgba(59,47,47,0.08)';
                e.target.style.border = '1px solid transparent';
              }}>
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
                    <div className="order-status-btn-row" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', minWidth: 0, boxSizing: 'border-box', marginRight: 0, justifyContent: 'flex-start' }}>
                      {(() => {
                        const status = getStatusDisplay(order);
                        return (
                          status ? (
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
                          ) : null
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
                      {/* Individual Product Reviews Section */}
                      <div style={{ marginTop: 18 }}>
                        <h4 style={{ color: '#b8860b', marginBottom: 12, fontSize: 16 }}>Product Reviews:</h4>
                        {order.items.map(item => {
                          const productReview = reviews.find(r => 
                            r.orderId === order._id && r.productId === item.productId
                          );
                          
                          return (
                            <div key={item.productId} style={{ 
                              marginBottom: 16, 
                              padding: 12, 
                              background: '#fff', 
                              borderRadius: 8, 
                              border: '1px solid #e0c9a6' 
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <img
                                  src={`http://localhost:3001/images/${item.image}`}
                                  alt={item.name}
                                  style={{ width: 32, height: 24, objectFit: 'cover', borderRadius: 4 }}
                                />
                                <span style={{ fontWeight: 600, color: '#3b2f2f' }}>{item.name}</span>
                              </div>
                              
                              {productReview ? (
                                // Show existing review
                                <div style={{ background: '#e8f5e8', borderRadius: 6, padding: 8, border: '1px solid #66bb6a' }}>
                                  <div style={{ color: '#388e3c', fontSize: 16, marginBottom: 4 }}>
                                    {'★'.repeat(productReview.rating)}{'☆'.repeat(5 - productReview.rating)}
                                  </div>
                                  {productReview.comment && (
                                    <div style={{ color: '#2e7d32', fontSize: 14 }}>{productReview.comment}</div>
                                  )}
                                </div>
                              ) : (
                                // Show review form
                                <div>
                                  <div style={{ marginBottom: 8 }}>
                                    {[1,2,3,4,5].map(star => (
                                      <span
                                        key={star}
                                        style={{
                                          fontSize: 18,
                                          color: (feedbackForm[`${order._id}_${item.productId}`]?.rating || 0) >= star ? '#ffc107' : '#ccc',
                                          cursor: 'pointer',
                                          marginRight: 2
                                        }}
                                        onClick={() => handleFeedbackChange(`${order._id}_${item.productId}`, 'rating', star)}
                                      >★</span>
                                    ))}
                                  </div>
                                  <textarea
                                    placeholder="Write your review (optional)"
                                    value={feedbackForm[`${order._id}_${item.productId}`]?.comment || ''}
                                    onChange={e => handleFeedbackChange(`${order._id}_${item.productId}`, 'comment', e.target.value)}
                                    rows={2}
                                    style={{ 
                                      width: '100%', 
                                      borderRadius: 6, 
                                      border: '1px solid #e0c9a6', 
                                      padding: 6, 
                                      fontSize: 14, 
                                      marginBottom: 8, 
                                      background: '#fff', 
                                      color: '#3b2f2f' 
                                    }}
                                  />
                                  {feedbackForm[`${order._id}_${item.productId}`]?.error && (
                                    <div style={{ color: 'red', marginBottom: 6, fontSize: 13 }}>
                                      {feedbackForm[`${order._id}_${item.productId}`].error}
                                    </div>
                                  )}
                                  {feedbackForm[`${order._id}_${item.productId}`]?.success && (
                                    <div style={{ color: 'green', marginBottom: 6, fontSize: 13 }}>
                                      {feedbackForm[`${order._id}_${item.productId}`].success}
                                    </div>
                                  )}
                                  <button
                                    onClick={() => handleProductReviewSubmit(order._id, item.productId)}
                                    disabled={feedbackForm[`${order._id}_${item.productId}`]?.loading}
                                    style={{ 
                                      background: '#b8860b', 
                                      color: '#fff', 
                                      border: 'none', 
                                      borderRadius: 6, 
                                      padding: '6px 16px', 
                                      fontWeight: 600, 
                                      fontSize: 13, 
                                      cursor: 'pointer' 
                                    }}
                                  >
                                    {feedbackForm[`${order._id}_${item.productId}`]?.loading ? 'Submitting...' : 'Submit Review'}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
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
      </section>
    </>
  );
};

export default OrderHistory; 