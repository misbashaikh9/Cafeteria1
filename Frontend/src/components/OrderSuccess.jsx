import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext.jsx';
import { useAuth } from './AuthContext.jsx';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { token } = useAuth();
  const order = location.state?.order;
  const payment = location.state?.payment;
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Personalized thank you
  const username = localStorage.getItem('username') || 'Customer';

  if (!order) {
    setTimeout(() => navigate('/'), 1000);
    return (
      <div className="menu-container" style={{ textAlign: 'center', padding: 40 }}>
        <h2 style={{ color: '#b8860b' }}>No order found. Redirecting...</h2>
      </div>
    );
  }

  // Safely destructure order with fallbacks
  const { _id, items = [], address = '', phone = '', createdAt = new Date() } = order;
  const estDelivery = new Date(new Date(createdAt).getTime() + 40 * 60000); // +40 min

  // Demo mode: simulate email sending
  React.useEffect(() => {
    if (!emailSent && payment && payment.success) {
      // Simulate email sending in demo mode
      setTimeout(() => {
        setEmailSent(true);
        console.log('Demo: Order confirmation email would be sent!');
      }, 2000);
    }
  }, [emailSent, payment]);

  // Print/download receipt
  const handlePrint = () => {
    window.print();
  };

  // Order again
  const handleOrderAgain = () => {
    if (items && items.length > 0) {
      items.forEach(item => {
        addToCart({
          id: item.productId,
          name: item.name,
          price: item.price,
          image: item.image
        });
      });
      navigate('/cart');
    }
  };

  // Feedback submission (now real API call)
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackError('');
    if (!rating) {
      setFeedbackError('Please select a rating.');
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ orderId: _id, rating, comment })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackSubmitted(true);
        setTimeout(() => setShowFeedback(false), 1500);
      } else {
        setFeedbackError(data.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      setFeedbackError('Failed to submit feedback.');
    }
  };

  return (
    <div className="menu-container" style={{ maxWidth: 700, margin: '0 auto', padding: '40px 8px' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <h1 style={{ color: '#3b2f2f', fontWeight: 700, marginBottom: 18, fontSize: '2em', textAlign: 'center' }}>Thank you, {username.split(' ')[0]}! 🎉</h1>
        <div style={{ color: '#b8860b', fontSize: 18, marginBottom: 18 }}>Order #{_id.slice(-6).toUpperCase()}</div>
        <div style={{ background: '#fffaf5', borderRadius: 12, padding: 24, boxShadow: '0 1px 6px rgba(59,47,47,0.08)', marginBottom: 24 }}>
          <h2 style={{ color: '#3b2f2f', fontWeight: 600, marginBottom: 12, fontSize: '1.3em' }}>Order Summary</h2>
          {items && items.length > 0 ? (
            <>
              {items.map(item => (
                <div key={item.productId} style={{ display: 'flex', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                  <img src={`http://localhost:3001/images/${item.image}`} alt={item.name} style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 6, marginRight: 12 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>{item.name} x {item.quantity}</div>
                  <div style={{ fontWeight: 600, color: '#b8860b' }}>₹{item.price * item.quantity}</div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #e0c9a6', marginTop: 12, paddingTop: 12, textAlign: 'right', fontWeight: 700, color: '#3b2f2f' }}>
                Total: ₹{items.reduce((sum, item) => sum + item.price * item.quantity, 0)}
              </div>
            </>
          ) : (
            <div style={{ color: '#666', textAlign: 'center', padding: 20 }}>
              Order details loading...
            </div>
          )}
        </div>
        <div style={{ marginBottom: 18 }}>
          <div><b>Delivery Address:</b> {address}</div>
          <div><b>Phone:</b> {phone}</div>
          <div><b>Estimated Delivery:</b> {estDelivery.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          {payment && (
            <div style={{ marginTop: 12, padding: 12, background: '#e8f5e8', borderRadius: 8, border: '1px solid #4caf50' }}>
              <div>
                <b>Payment Status:</b>
                {(() => {
                  // Updated logic for cash on delivery
                  if (payment.method === 'cash') {
                    return <span style={{ color: '#b8860b' }}> Cash on Delivery (Unpaid)</span>;
                  } else if (payment.success) {
                    return <span style={{ color: 'green' }}> ✅ Paid</span>;
                  } else {
                    return <span style={{ color: 'red' }}> Not Paid</span>;
                  }
                })()}
              </div>
              <div><b>Transaction ID:</b> {payment.transactionId}</div>
              <div><b>Amount Paid:</b> ₹{payment.amount}</div>
            </div>
          )}
        </div>
        {/* Email confirmation status */}
        <div style={{ color: '#388e3c', marginBottom: 18, fontWeight: 500 }} className="order-success-hide-print">
          {payment && payment.success ? (
            emailSent ? (
              <span>✅ Order confirmation email sent to your email!</span>
            ) : (
              <span>📧 Sending order confirmation email...</span>
            )
          ) : (
            <span>📧 Order confirmation email will be sent after payment</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }} className="order-success-hide-print">
          <button onClick={handlePrint} style={{ background: '#fff', color: '#b8860b', border: '1px solid #b8860b', borderRadius: 8, padding: '10px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
            Print/Download Receipt
          </button>
          <button onClick={handleOrderAgain} style={{ background: '#b8860b', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
            Order Again
          </button>
          <button onClick={() => setShowFeedback(true)} style={{ background: '#fff', color: '#3b2f2f', border: '1px solid #3b2f2f', borderRadius: 8, padding: '10px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
            Rate Your Order
          </button>
          <button onClick={() => navigate('/menu')} style={{ background: '#b8860b', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
            Back to Menu
          </button>
        </div>
        {/* Feedback Modal */}
        {showFeedback && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(59,47,47,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={handleFeedbackSubmit} style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 2px 12px rgba(59,47,47,0.12)', textAlign: 'center' }}>
              <h2 style={{ color: '#3b2f2f', fontWeight: 700, marginBottom: 18 }}>Rate Your Order</h2>
              <div style={{ fontSize: 32, marginBottom: 18 }}>
                {[1,2,3,4,5].map(star => (
                  <span key={star} style={{ cursor: 'pointer', color: star <= rating ? '#b8860b' : '#cdbba7' }} onClick={() => setRating(star)}>&#9733;</span>
                ))}
              </div>
              <textarea
                placeholder="Leave a comment (optional)"
                value={comment}
                onChange={e => setComment(e.target.value)}
                style={{ width: '100%', minHeight: 60, borderRadius: 8, border: '1px solid #b8860b', padding: 10, fontSize: 15, marginBottom: 18, background: '#fff', color: '#3b2f2f', fontWeight: 500 }}
              />
              {feedbackError && <div style={{ color: 'red', marginBottom: 12 }}>{feedbackError}</div>}
              <br />
              <button type="submit" style={{ background: '#b8860b', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                {feedbackSubmitted ? 'Thank you!' : 'Submit Feedback'}
              </button>
              <br />
              <button type="button" onClick={() => setShowFeedback(false)} style={{ background: 'none', color: '#b8860b', border: 'none', marginTop: 12, cursor: 'pointer', fontSize: 15 }}>Close</button>
            </form>
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 900px) {
          .menu-container { padding: 20px 2px !important; }
          .menu-title, h1 { font-size: 1.3em !important; }
        }
        @media (max-width: 600px) {
          .menu-container { padding: 8px 12px !important; }
          .menu-title, h1 { font-size: 1.1em !important; }
          h2 { font-size: 1em !important; }
          input, button, textarea { font-size: 15px !important; }
        }
        @media (max-width: 480px) {
          .menu-container { padding: 2px 12px !important; }
          .menu-title, h1 { font-size: 1em !important; }
          h2 { font-size: 0.95em !important; }
          input, button, textarea { font-size: 14px !important; }
        }
      `}</style>
    </div>
  );
};

export default OrderSuccess; 