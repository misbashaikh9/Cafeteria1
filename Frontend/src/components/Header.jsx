import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext.jsx';
import { useAuth } from './AuthContext.jsx';

const Header = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [username, setUsername] = useState("");
  const { token, setToken } = useAuth();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    // Always fetch username from backend
    if (token) {
      fetch('http://localhost:3001/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user && data.user.name) setUsername(data.user.name);
          else setUsername("");
        })
        .catch(() => setUsername(""));
    } else {
      setUsername("");
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("userEmail");
    navigate("/signin");
  };

  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const styles = {
    nav: {
      backgroundColor: '#3b2f2f',
      color: 'white',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    },
    brandContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      textDecoration: 'none',
    },
    logo: {
      width: '32px',
      height: '32px',
      borderRadius: '6px',
    },
    brandText: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#d6a96d',
    },
    links: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
    },
    link: {
      color: 'white',
      textDecoration: 'none',
      fontSize: '16px',
    },
    login: {
      backgroundColor: '#d6a96d',
      color: '#3b2f2f',
      padding: '6px 16px',
      borderRadius: '9999px',
      textDecoration: 'none',
      fontWeight: '500',
      fontSize: '14px',
    },
    user: {
      fontWeight: 500,
      color: '#d6a96d',
      fontSize: '15px',
    },
    logoutBtn: {
      backgroundColor: '#d6a96d',
      color: '#3b2f2f',
      padding: '6px 16px',
      borderRadius: '9999px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
    },
    hamburger: {
      background: 'transparent',
      border: 'none',
      color: '#d6a96d',
      fontSize: '24px',
      cursor: 'pointer',
    },
    mobileMenu: {
      backgroundColor: '#4a3a3a',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    dropdown: {
      position: 'relative',
      display: 'inline-block',
    },
    dropdownContent: {
      display: 'none',
      position: 'absolute',
      backgroundColor: '#fffaf5',
      minWidth: '140px',
      boxShadow: '0 2px 8px rgba(59,47,47,0.12)',
      borderRadius: 8,
      zIndex: 1001,
      right: 0,
      marginTop: 8,
    },
    dropdownContentShow: {
      display: 'block',
    },
    dropdownLink: {
      color: '#3b2f2f',
      padding: '10px 18px',
      textDecoration: 'none',
      display: 'block',
      fontSize: 15,
      borderBottom: '1px solid #e0c9a6',
      background: 'none',
      cursor: 'pointer',
    },
    dropdownLast: {
      borderBottom: 'none',
    },
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownTimeout = useRef();

  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setDropdownOpen(true);
  };
  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 120);
  };

  const renderAuth = () => {
    return username ? (
      <div
        style={styles.dropdown}
        onMouseEnter={handleDropdownEnter}
        onMouseLeave={handleDropdownLeave}
      >
        <span style={styles.user}>
          Hi, {username.split(" ")[0]} &#x25BC;
        </span>
        <div
          style={{ ...styles.dropdownContent, ...(dropdownOpen ? styles.dropdownContentShow : {}) }}
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleDropdownLeave}
        >
          <Link to="/orders" style={styles.dropdownLink}>Orders</Link>
          <Link to="/profile" style={styles.dropdownLink}>Profile</Link>
          <Link to="/my-reviews" style={styles.dropdownLink}>My Reviews</Link>
          <Link to="/settings" style={styles.dropdownLink}>Settings</Link>
          <Link to="/help" style={styles.dropdownLink}>Help</Link>
          <button onClick={handleLogout} style={{ ...styles.dropdownLink, ...styles.dropdownLast, background: 'none', border: 'none', textAlign: 'left' }}>Logout</button>
        </div>
      </div>
    ) : (
      <Link to="/signin" style={styles.login}>Login</Link>
    );
  };

  return (
    <header>
      <nav style={styles.nav}>
        <Link to="/" style={styles.brandContainer}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/415/415733.png"
            alt="logo"
            style={styles.logo}
          />
          <span style={styles.brandText}>Brew Haven</span>
        </Link>

        {!isMobile && (
          <div style={styles.links}>
            <Link to="/" style={styles.link}>Home</Link>
          <Link to="/menu" style={styles.link}>Menu</Link>
          <Link to="/about" style={styles.link}>About</Link>
            <Link to="/cart" style={{ ...styles.link, position: 'relative', fontSize: 22, marginLeft: 8 }}>
              🛒
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -8, right: -12, background: '#ff5858', color: '#fff', borderRadius: '50%', fontSize: 13, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{cartCount}</span>
              )}
            </Link>
            {renderAuth()}
          </div>
        )}

        {isMobile && (
          <button onClick={() => setMenuOpen(!menuOpen)} style={styles.hamburger}>
            {menuOpen ? '✖' : '☰'}
          </button>
        )}
      </nav>

      {menuOpen && isMobile && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={styles.link}>Home</Link>
          <Link to="/menu" style={styles.link}>Menu</Link>
          <Link to="/orders" style={styles.link}>Orders</Link>
          <Link to="/about" style={styles.link}>About</Link>
          {username ? (
            <>
              <span style={styles.user}>Hi, {username.split(" ")[0]}</span>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </>
          ) : (
            <Link to="/signin" style={styles.login}>Login</Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
