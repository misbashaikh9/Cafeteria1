import React from 'react';
import { useCart } from './CartContext.jsx';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const total = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + (price * quantity);
  }, 0);
  const navigate = useNavigate();

  return (
    <div className="menu-container">
      <h1 className="menu-title">Your Cart</h1>
      {cart.length > 0 && (
        <button 
          onClick={clearCart}
          style={{ 
            position: 'absolute', 
            top: '2rem', 
            right: '2rem',
            background: '#ff5858',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px'
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
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(59,47,47,0.06)', padding: 16 }}>
              <img src={`http://localhost:3001/images/${item.image}`} alt={item.name} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, marginRight: 18 }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.1em', color: '#3b2f2f' }}>{item.name}</h3>
                <div style={{ color: '#b8860b', fontWeight: 600 }}>₹{Number(item.price) || 0}</div>
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} style={{ marginRight: 8, padding: '2px 10px' }}>-</button>
                  <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ marginLeft: 8, padding: '2px 10px' }}>+</button>
                  <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: 18, color: '#fff', background: '#ff5858', border: 'none', borderRadius: 6, padding: '4px 14px', cursor: 'pointer' }}>Remove</button>
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
  );
};

export default Cart; 