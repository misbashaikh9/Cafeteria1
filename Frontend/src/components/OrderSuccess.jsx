import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Header from './Header.jsx';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { token } = useAuth();
  const order = location.state?.order;
  const payment = location.state?.payment;
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
    if (!emailSent && payment) {
      // For cash on delivery, always send email. For card/UPI, only if payment successful
      if (payment.method === 'cash' || payment.success) {
        // Simulate email sending in demo mode
        setTimeout(() => {
          setEmailSent(true);
          console.log('Demo: Order confirmation email would be sent!');
        }, 2000);
      }
    }
  }, [emailSent, payment]);

  // Print/download receipt
  const handlePrint = () => {
    window.print();
  };



  return (
    <>
      <Header />
      <section style={{ backgroundColor: '#faf8f3', minHeight: '100vh' }}>
        <div className="menu-container" style={{ maxWidth: 600, margin: '0 auto', padding: '40px 12px' }}>
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
              {payment.method !== 'cash' && payment.transactionId && (
                <div><b>Transaction ID:</b> {payment.transactionId}</div>
              )}
              {payment.method === 'cash' ? (
                <div><b>Amount to Pay:</b> ₹{payment.amount} <span style={{ color: '#b8860b', fontSize: '0.9em' }}>(Pay on delivery)</span></div>
              ) : (
                <div><b>Amount Paid:</b> ₹{payment.amount}</div>
              )}
            </div>
          )}
        </div>
        {/* Email confirmation status */}
        <div style={{ color: '#388e3c', marginBottom: 18, fontWeight: 500 }} className="order-success-hide-print">
          {(() => {
            if (payment.method === 'cash') {
              // For cash on delivery, always show email sent
              return emailSent ? (
                <span>✅ Order confirmation email sent to your email!</span>
              ) : (
                <span>📧 Sending order confirmation email...</span>
              );
            } else {
              // For card/UPI, check payment success
              if (payment.success) {
                return emailSent ? (
                  <span>✅ Order confirmation email sent to your email!</span>
                ) : (
                  <span>📧 Sending order confirmation email...</span>
                );
              } else {
                return <span>📧 Order confirmation email will be sent after payment</span>;
              }
            }
          })()}
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }} className="order-success-hide-print">
          <button onClick={handlePrint} style={{ background: '#fff', color: '#b8860b', border: '1px solid #b8860b', borderRadius: 8, padding: '10px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
            Print/Download Receipt
          </button>
          <button onClick={() => navigate('/menu')} style={{ background: '#b8860b', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
            Back to Menu
          </button>
        </div>

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
    </section>
    </>
  );
};

export default OrderSuccess; 