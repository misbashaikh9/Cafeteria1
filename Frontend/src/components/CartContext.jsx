import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  // Initialize cart from localStorage for guests
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('guest_cart');
    const parsedCart = stored ? JSON.parse(stored) : [];
    // Clean up cart items to ensure they have correct structure
    return parsedCart.map(item => ({
      ...item,
      _id: item._id,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1
    }));
  });



  // Simple cart management - always use localStorage
  useEffect(() => {
    const stored = localStorage.getItem('guest_cart');
    if (stored) {
      const parsedCart = JSON.parse(stored);
      const cleanCart = parsedCart.map(item => ({
        ...item,
        _id: item._id,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1
      }));
      setCart(cleanCart);
      console.log('[CartContext] Loaded cart from localStorage:', cleanCart);
    }
  }, []);

  // Save cart to localStorage for all users (as backup)
  useEffect(() => {
    // Clean cart data before saving
    const cleanCart = cart.map(item => ({
      ...item,
      _id: item._id,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1
    }));
    localStorage.setItem('guest_cart', JSON.stringify(cleanCart));
  }, [cart]);

  // Sync cart to backend for logged-in users (disabled due to static products)
  // useEffect(() => {
  //   if (!token) return;
  //   const items = cart.map(item => ({ productId: item.id, quantity: item.quantity }));
  //   console.log('[CartContext] Syncing cart to backend. Items:', items);
  //   fetch('http://localhost:3001/cart', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${token}`
  //     },
  //     body: JSON.stringify({ items })
  //   }).catch(err => {
  //     console.error('[CartContext] Error syncing cart to backend:', err);
  //   });
  // }, [cart, token]);

  // Add product to cart (increase quantity if already exists)
  const addToCart = (product) => {
    console.log('[CartContext] Adding product to cart:', product);
    setCart((prevCart) => {
      const existing = prevCart.find(item => item._id === product._id);
      if (existing) {
        const newCart = prevCart.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
        console.log('[CartContext] Updated existing item, new cart:', newCart);
        return newCart;
      } else {
        const newCart = [...prevCart, { ...product, quantity: 1 }];
        console.log('[CartContext] Added new item, new cart:', newCart);
        return newCart;
      }
    });
  };

  // Remove product from cart
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter(item => item._id !== productId));
  };

  // Update quantity
  const updateQuantity = (productId, quantity) => {
    setCart((prevCart) =>
      prevCart.map(item =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('guest_cart');
    console.log('[CartContext] Cart cleared');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}; 