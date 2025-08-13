import React from 'react';
import { useCart } from './CartContext.jsx';
import { useNavigate } from 'react-router-dom';
import Header from './Header.jsx';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const total = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + (price * quantity);
  }, 0);
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <section style={{ backgroundColor: '#faf8f3', minHeight: '100vh' }}>
        <div className="menu-container" style={{ maxWidth: 800, margin: '0 auto', padding: '40px 12px' }}>
          <h1 className="menu-title">Your Cart</h1>
          {cart.length > 0 && (
            <button 
              onClick={clearCart}
              style={{ 
                position: 'absolute', 
                top: '2rem', 
                right: '2rem',
                background: 'linear-gradient(90deg, #bfa77a 0%, #a88c5f 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(191, 167, 122, 0.13)',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(90deg, #a88c5f 0%, #bfa77a 100%)';
                e.target.style.transform = 'translateY(-2px) scale(1.04)';
                e.target.style.boxShadow = '0 6px 18px rgba(191, 167, 122, 0.18)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(90deg, #bfa77a 0%, #a88c5f 100%)';
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 2px 8px rgba(191, 167, 122, 0.13)';
              }}
            >
              Clear Cart
            </button>
          )}
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', fontSize: '1.2em' }}>Your cart is empty.</p>
          ) : (
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
              {cart.map(item => (
                <div key={item._id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: 24, 
                background: '#fff', 
                borderRadius: 12, 
                boxShadow: '0 2px 8px rgba(59,47,47,0.06)', 
                padding: 16,
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
                e.target.style.boxShadow = '0 2px 8px rgba(59,47,47,0.06)';
                e.target.style.border = '1px solid transparent';
              }}>
                  <img src={`http://localhost:3001/images/${item.image}`} alt={item.name} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, marginRight: 18 }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.1em', color: '#3b2f2f' }}>{item.name}</h3>
                    <div style={{ color: '#b8860b', fontWeight: 600 }}>₹{Number(item.price) || 0}</div>
                    <div style={{ marginTop: 8 }}>
                      <button onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))} style={{ 
                        marginRight: 8, 
                        padding: '2px 10px',
                        background: 'linear-gradient(90deg, #bfa77a 0%, #a88c5f 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}>-</button>
                      <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)} style={{ 
                        marginLeft: 8, 
                        padding: '2px 10px',
                        background: 'linear-gradient(90deg, #bfa77a 0%, #a88c5f 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}>+</button>
                                          <button onClick={() => removeFromCart(item._id)} style={{ 
                      marginLeft: 18, 
                      color: '#fff', 
                      background: 'linear-gradient(90deg, #bfa77a 0%, #a88c5f 100%)', 
                      border: 'none', 
                      borderRadius: 6, 
                      padding: '4px 14px', 
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.18s ease'
                    }}>Remove</button>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#3b2f2f', fontSize: '1.1em', marginLeft: 18 }}>₹{(Number(item.price) || 0) * (Number(item.quantity) || 0)}</div>
                </div>
              ))}
              <div style={{ textAlign: 'right', fontSize: '1.3em', fontWeight: 700, color: '#b8860b', marginTop: 24 }}>
                Total: ₹{total}
              </div>
              <div style={{ textAlign: 'right', marginTop: 32 }}>
                <button
                  className="menu-order-btn"
                  style={{ fontSize: '1.1em', padding: '0.8em 2.2em' }}
                  onClick={() => navigate('/checkout')}
                  disabled={cart.length === 0}
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Cart; 