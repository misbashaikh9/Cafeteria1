import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css' // Import Bootstrap CSS
import Signup from './components/Signup.jsx';
import Signin from './components/SignIn.jsx';  
import Home from './components/Home.jsx'; 
import Menu from './components/Menu.jsx';
import Cart from './components/Cart.jsx';
import Checkout from './components/Checkout.jsx';
import OrderSuccess from './components/OrderSuccess.jsx';
import OrderHistory from './components/OrderHistory.jsx';
import Profile from './components/Profile.jsx';

import Settings from './components/Settings.jsx';
import Help from './components/Help.jsx';
import OrderDetails from './components/OrderDetails.jsx';

import {BrowserRouter,Routes,Route} from 'react-router-dom'
import { CartProvider } from './components/CartContext.jsx';
import { AuthProvider } from './components/AuthContext.jsx';
import { useAuth } from './components/AuthContext.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import AdminProducts from './components/AdminProducts.jsx';
import AdminOrders from './components/AdminOrders.jsx';
import AdminUsers from './components/AdminUsers.jsx';

const Placeholder = ({ title }) => (
  <div className="menu-container" style={{ padding: 40, textAlign: 'center' }}>
    <h1 style={{ color: '#3b2f2f', fontWeight: 700 }}>{title}</h1>
    <p style={{ color: '#b8860b', fontSize: 18 }}>This page is coming soon!</p>
  </div>
);

function AdminGuard({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ color: '#3b2f2f' }}>Access Denied</h2>
        <p style={{ color: '#b8860b' }}>You do not have permission to view this page.</p>
      </div>
    );
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
    <BrowserRouter>
    <Routes>
      <Route path="/signup" element={<Signup />} ></Route>
      <Route path="/signin" element={<Signin />} ></Route>

      <Route path="/" element={<Home />} ></Route>
            <Route path="/menu" element={<Menu />} ></Route>
            <Route path="/cart" element={<Cart />} ></Route>
            <Route path="/checkout" element={<Checkout />} ></Route>
            <Route path="/order-success" element={<OrderSuccess />} ></Route>
            <Route path="/orders" element={<OrderHistory />} ></Route>
            <Route path="/orders/:id" element={<OrderDetails />} ></Route>
            <Route path="/profile" element={<Profile />} ></Route>

            <Route path="/settings" element={<Settings />} ></Route>
            <Route path="/help" element={<Help />} ></Route>

            <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="/admin/products" element={<AdminGuard><AdminProducts /></AdminGuard>} />
            <Route path="/admin/orders" element={<AdminGuard><AdminOrders /></AdminGuard>} />
            <Route path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
      {/* Add other routes here as needed */}
      </Routes>
    </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
