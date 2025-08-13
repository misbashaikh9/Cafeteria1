import React, { useState } from 'react';
import { useCart } from './CartContext.jsx';
import { useAuth } from './AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Header from './Header.jsx';

const Checkout = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + (price * quantity);
  }, 0);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStep, setPaymentStep] = useState('details'); // 'details' or 'payment'
  const [orderData, setOrderData] = useState(null);
  
  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // UPI form state
  const [upiId, setUpiId] = useState('');
  const [upiName, setUpiName] = useState('');

  // Add error states for each field
  const [addressError, setAddressError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [cardNumberError, setCardNumberError] = useState('');
  const [expiryDateError, setExpiryDateError] = useState('');
  const [cvvError, setCvvError] = useState('');
  const [cardholderNameError, setCardholderNameError] = useState('');
  const [upiIdError, setUpiIdError] = useState('');
  const [upiNameError, setUpiNameError] = useState('');

  const themeInputStyle = {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    border: '1px solid #b8860b',
    backgroundColor: '#fffaf5',
    color: '#3b2f2f',
    marginBottom: 18,
    fontSize: 15
  };

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    setError('');
    
    // Phone validation: must be 10 digits
    if (!/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    
    setLoading(true);
    try {
      const items = cart
        .filter(item => item._id || item.id) // Filter out items without valid ID
        .map(item => ({
          productId: item._id || item.id, // Use _id if available, otherwise use id
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }));
      console.log('Order payload items:', items); // Debug: ensure productId is present
      
      const res = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items, address, phone })
      });
      
      const data = await res.json();
      if (res.ok) {
        // Store order data for payment processing (order not saved yet)
        setOrderData(data.orderData);
        setPaymentStep('payment');
      } else {
        setError(data.error || 'Failed to validate order.');
      }
    } catch (err) {
      setError('Failed to validate order. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validate payment details based on method
    if (paymentMethod === 'card') {
      if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        setError('Please fill in all card details.');
        setLoading(false);
        return;
      }
      
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setError('Please enter a valid card number.');
        setLoading(false);
        return;
      }
      
      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        setError('Please enter a valid expiry date (MM/YY).');
        setLoading(false);
        return;
      }
      
      if (!/^\d{3,4}$/.test(cvv)) {
        setError('Please enter a valid CVV (3-4 digits).');
        setLoading(false);
        return;
      }
      
      // Check if card is expired
      const [month, year] = expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        setError('Card has expired. Please use a valid card.');
        setLoading(false);
        return;
      }
    }
    
    if (paymentMethod === 'upi') {
      if (!upiId || !upiName) {
        setError('Please fill in all UPI details.');
        setLoading(false);
        return;
      }
      
      // UPI ID validation (format: name@upi)
      if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(upiId)) {
        setError('Please enter a valid UPI ID (e.g., name@upi).');
        setLoading(false);
        return;
      }
      
      if (upiName.length < 2) {
        setError('Please enter a valid name.');
        setLoading(false);
        return;
      }
    }
    
    // Process payment with backend
    try {
      const res = await fetch('http://localhost:3001/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          paymentMethodId: paymentMethod === 'card' ? 'pm_demo_card' : paymentMethod === 'upi' ? 'pm_demo_upi' : 'pm_demo_cash',
          amount: total,
          orderData: orderData,
          paymentDetails: paymentMethod === 'upi' ? { upiId, upiName } : {}
        })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        // Send order confirmation email
        try {
          await fetch('http://localhost:3001/send-order-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              orderId: data.orderId, // Use the orderId returned from successful payment
              items: cart
                .filter(item => item._id || item.id)
                .map(item => ({
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  image: item.image
                })),
              total: total,
              address: address,
              phone: phone,
              payment: data // includes payment method/status
            })
          });
        } catch (emailErr) {
          // Optionally log or show a message, but don't block the user
          console.error('Order confirmation email failed:', emailErr);
        }

        // Clear cart and navigate to success
        cart.forEach(item => {
          const itemId = item._id || item.id;
          if (itemId) {
            removeFromCart(itemId);
          }
        });
        navigate('/order-success', { 
          state: { 
            order: { 
              _id: data.orderId, // Use the orderId returned from successful payment
              total: total,
              items: cart
                .filter(item => item._id || item.id)
                .map(item => ({
                  productId: item._id || item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  image: item.image
                })),
              address: address,
              phone: phone,
              createdAt: new Date()
            },
            payment: data
          } 
        });
      } else {
        setError(data.error || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setError('Payment processing failed. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Real-time validation handlers
  const validateAddress = (value) => {
    if (!value.trim()) setAddressError('Address is required.');
    else setAddressError('');
  };
  const validatePhone = (value) => {
    if (!/^\d{10}$/.test(value)) setPhoneError('Please enter a valid 10-digit phone number.');
    else setPhoneError('');
  };
  const validateCardNumber = (value) => {
    if (value.replace(/\s/g, '').length < 16) setCardNumberError('Card number must be 16 digits.');
    else setCardNumberError('');
  };
  const validateExpiryDate = (value) => {
    if (!/^\d{2}\/\d{2}$/.test(value)) setExpiryDateError('Expiry must be MM/YY.');
    else setExpiryDateError('');
  };
  const validateCvv = (value) => {
    if (!/^\d{3,4}$/.test(value)) setCvvError('CVV must be 3-4 digits.');
    else setCvvError('');
  };
  const validateCardholderName = (value) => {
    if (value.trim().length < 2) setCardholderNameError('Name is too short.');
    else setCardholderNameError('');
  };
  const validateUpiId = (value) => {
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(value)) setUpiIdError('Invalid UPI ID (e.g., name@upi).');
    else setUpiIdError('');
  };
  const validateUpiName = (value) => {
    if (value.trim().length < 2) setUpiNameError('Name is too short.');
    else setUpiNameError('');
  };

  if (loading) return <div style={{ textAlign: 'center', color: '#b8860b', fontSize: 22, marginTop: 60 }}>
    <div className="spinner" style={{ margin: '0 auto 18px', width: 48, height: 48, border: '6px solid #f3e9d2', borderTop: '6px solid #b8860b', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    Processing...
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>;
  if (error) return <div style={{ textAlign: 'center', color: 'red', fontSize: 16 }}>{error}</div>;

  return (
    <>
      <Header />
      <section style={{ backgroundColor: '#faf8f3', minHeight: '100vh' }}>
        <div className="menu-container" style={{ maxWidth: 800, margin: '0 auto', padding: '40px 12px' }}>
      <h1 className="menu-title" style={{ fontSize: '2em', textAlign: 'center', marginBottom: 24 }}>Checkout</h1>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ color: '#3b2f2f', fontWeight: 600, marginBottom: 18, fontSize: '1.3em' }}>Order Summary</h2>
        {cart.map(item => (
          <div key={item._id} style={{ display: 'flex', alignItems: 'center', marginBottom: 16, background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(59,47,47,0.06)', padding: 10, flexWrap: 'wrap' }}>
            <img src={`http://localhost:3001/images/${item.image}`} alt={item.name} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6, marginRight: 14 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{item.name}</div>
              <div style={{ color: '#b8860b' }}>₹{Number(item.price) || 0} x {Number(item.quantity) || 0}</div>
            </div>
            <div style={{ fontWeight: 700, color: '#3b2f2f' }}>₹{(Number(item.price) || 0) * (Number(item.quantity) || 0)}</div>
          </div>
        ))}
        <div style={{ textAlign: 'right', fontSize: '1.2em', fontWeight: 700, color: '#b8860b', marginTop: 18 }}>
          Total: ₹{total}
        </div>

        {paymentStep === 'details' ? (
          <>
            <form onSubmit={handleSubmitDetails} style={{ marginTop: 36 }}>
              <h2 style={{ color: '#3b2f2f', fontWeight: 600, marginBottom: 18, fontSize: '1.3em' }}>Delivery Information</h2>
              <input
                type="text"
                placeholder="Delivery Address"
                value={address}
                onChange={e => { setAddress(e.target.value); validateAddress(e.target.value); }}
                onBlur={e => validateAddress(e.target.value)}
                required
                style={themeInputStyle}
              />
              {addressError && <div style={{ color: 'red', marginTop: -14, marginBottom: 12 }}>{addressError}</div>}
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={e => { setPhone(e.target.value); validatePhone(e.target.value); }}
                onBlur={e => validatePhone(e.target.value)}
                required
                style={{ ...themeInputStyle, marginBottom: 24 }}
              />
              {phoneError && <div style={{ color: 'red', marginTop: -14, marginBottom: 12 }}>{phoneError}</div>}
              {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 12, marginTop: 24, alignItems: 'center' }}>
                <button
                  type="button"
                  className="pill"
                  onClick={() => navigate('/cart')}
                  style={{
                    flex: 1,
                    padding: '0.8em 1.8em',
                    borderRadius: 999,
                    border: '1.5px solid #b8860b',
                    background: '#fff',
                    color: '#b8860b',
                    fontSize: '1em',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'center',
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="menu-order-btn"
                  style={{
                    flex: 2,
                    fontSize: '1.1em',
                    padding: '0 2.2em',
                    borderRadius: 999,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  disabled={loading || !!addressError || !!phoneError || !address || !phone}
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <form onSubmit={handlePayment} style={{ marginTop: 36 }}>
            <h2 style={{ color: '#3b2f2f', fontWeight: 600, marginBottom: 18, fontSize: '1.3em' }}>Payment Method</h2>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: 12, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                <span style={{ fontWeight: 600 }}>💳 Credit/Debit Card</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: 12, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                <span style={{ fontWeight: 600 }}>📱 UPI Payment</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                <span style={{ fontWeight: 600 }}>💵 Cash on Delivery</span>
              </label>
            </div>

            {paymentMethod === 'card' && (
              <div style={{ background: '#fffaf5', padding: 20, borderRadius: 12, border: '1px solid #e2c48d' }}>
                <h3 style={{ color: '#3b2f2f', marginBottom: 16 }}>Card Details</h3>
                <input
                  type="text"
                  placeholder="Card Number"
                  value={cardNumber}
                  onChange={e => { setCardNumber(formatCardNumber(e.target.value)); validateCardNumber(formatCardNumber(e.target.value)); }}
                  onBlur={e => validateCardNumber(e.target.value)}
                  maxLength="19"
                  style={themeInputStyle}
                />
                {cardNumberError && <div style={{ color: 'red', marginTop: -14, marginBottom: 12 }}>{cardNumberError}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={e => { setExpiryDate(formatExpiryDate(e.target.value)); validateExpiryDate(formatExpiryDate(e.target.value)); }}
                    onBlur={e => validateExpiryDate(e.target.value)}
                    maxLength="5"
                    style={themeInputStyle}
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={cvv}
                    onChange={e => { setCvv(e.target.value.replace(/\D/g, '').substring(0, 3)); validateCvv(e.target.value); }}
                    onBlur={e => validateCvv(e.target.value)}
                    maxLength="3"
                    style={themeInputStyle}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={cardholderName}
                  onChange={e => { setCardholderName(e.target.value); validateCardholderName(e.target.value); }}
                  onBlur={e => validateCardholderName(e.target.value)}
                  style={themeInputStyle}
                />
                {cardholderNameError && <div style={{ color: 'red', marginTop: -14, marginBottom: 12 }}>{cardholderNameError}</div>}
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div style={{ background: '#fffaf5', padding: 20, borderRadius: 12, border: '1px solid #e2c48d' }}>
                <h3 style={{ color: '#3b2f2f', marginBottom: 16 }}>UPI Details</h3>
                <input
                  type="text"
                  placeholder="UPI ID (e.g., name@upi)"
                  value={upiId}
                  onChange={e => { setUpiId(e.target.value.toLowerCase()); validateUpiId(e.target.value.toLowerCase()); }}
                  onBlur={e => validateUpiId(e.target.value)}
                  style={themeInputStyle}
                />
                {upiIdError && <div style={{ color: 'red', marginTop: -14, marginBottom: 12 }}>{upiIdError}</div>}
                <input
                  type="text"
                  placeholder="Full Name"
                  value={upiName}
                  onChange={e => { setUpiName(e.target.value); validateUpiName(e.target.value); }}
                  onBlur={e => validateUpiName(e.target.value)}
                  style={themeInputStyle}
                />
                {upiNameError && <div style={{ color: 'red', marginTop: -14, marginBottom: 12 }}>{upiNameError}</div>}
                <div style={{ background: '#e8f5e8', padding: 12, borderRadius: 8, border: '1px solid #4caf50', marginTop: 12 }}>
                  <small style={{ color: '#2e7d32' }}>
                    <strong>Note:</strong> You'll receive a UPI payment request on your phone. Please complete the payment to confirm your order.
                  </small>
                </div>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div style={{ background: '#fffaf5', padding: 20, borderRadius: 12, border: '1px solid #e2c48d', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💵</div>
                <p style={{ color: '#666', margin: 0 }}>Pay with cash when your order is delivered</p>
              </div>
            )}

            {error && <div style={{ color: 'red', marginBottom: 12, marginTop: 16 }}>{error}</div>}
            
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                type="button"
                className="pill"
                onClick={() => setPaymentStep('details')}
                style={{
                  flex: 1,
                  padding: '0.8em 1.8em',
                  borderRadius: 999,
                  border: '1.5px solid #b8860b',
                  background: '#fff',
                  color: '#b8860b',
                  fontSize: '1em',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                }}
              >
                Back
              </button>
              <button
                type="submit"
                className="menu-order-btn"
                style={{ flex: 2, fontSize: '1.1em', padding: '0.8em 2.2em' }}
                disabled={loading ||
                  (paymentMethod === 'card' && (!!cardNumberError || !!expiryDateError || !!cvvError || !!cardholderNameError || !cardNumber || !expiryDate || !cvv || !cardholderName)) ||
                  (paymentMethod === 'upi' && (!!upiIdError || !!upiNameError || !upiId || !upiName))}
              >
                {loading ? 'Processing Payment...' : 'Complete Payment'}
              </button>
            </div>
          </form>
        )}
      </div>
      <style>{`
        @media (max-width: 900px) {
          .menu-container { padding: 20px 2px !important; }
          .menu-title { font-size: 1.3em !important; }
        }
        @media (max-width: 600px) {
          .menu-container { padding: 8px 0 !important; }
          .menu-title { font-size: 1.1em !important; }
          h2 { font-size: 1em !important; }
          input, button, textarea { font-size: 15px !important; }
        }
        @media (max-width: 480px) {
          .menu-container { padding: 2px 0 !important; }
          .menu-title { font-size: 1em !important; }
          h2 { font-size: 0.95em !important; }
          input, button, textarea { font-size: 14px !important; }
        }
        button.pill {
          padding: 8px 20px;
          border-radius: 999px;
          font-size: 0.95em;
          border: 1px solid #b8860b;
          background: #fff;
          color: #b8860b;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        button.pill:hover {
          background: #b8860b;
          color: #fff;
          border-color: #b8860b;
          box-shadow: 0 2px 8px rgba(184, 134, 11, 0.12);
          transform: translateY(-2px) scale(1.03);
        }
      `}</style>
    </div>
    </section>
    </>
  );
};

export default Checkout; 