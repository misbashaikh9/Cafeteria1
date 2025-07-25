import React, { useState, useEffect } from 'react';
import Header from './Header.jsx';
import { useCart } from './CartContext.jsx';
import Swal from 'sweetalert2';
// import { products, getProductsByCategory, getTopRatedProducts } from '../data/products.js';

const CATEGORY_ALL = 'All';

const Menu = () => {
  // All hooks at the top
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ALL);
  const [modalProduct, setModalProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productsData, setProductsData] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3001/products')
      .then(res => res.json())
      .then(async (products) => {
        // Fetch ratings for each product
        const productsWithRatings = await Promise.all(products.map(async (product) => {
          try {
            const res = await fetch(`http://localhost:3001/products/${product._id}/ratings`);
            if (!res.ok) return product;
            const { average, count } = await res.json();
            return { ...product, rating: average, ratingsCount: count };
          } catch {
            return product;
          }
        }));
        setProductsData(productsWithRatings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const { addToCart } = useCart();

  // Get unique categories
  const categories = [CATEGORY_ALL, ...Array.from(new Set(productsData.map(p => p.category)))];

  // Top rated products (rating >= 4.5)
  const topRated = productsData.filter(p => p.rating >= 4.5);

  // Filtered products by category
  const filteredProducts = selectedCategory === CATEGORY_ALL ? topRated : productsData.filter(p => p.category === selectedCategory);

  // Group filtered products by category
  const grouped = filteredProducts.reduce((acc, product) => {
    acc[product.category] = acc[product.category] || [];
    acc[product.category].push(product);
    return acc;
  }, {});





  // Modal JSX
  const renderModal = () => {
    if (!modalProduct) return null;
    return (
      <div className="menu-modal-overlay" onClick={() => setModalProduct(null)}>
        <div className="menu-modal" onClick={e => e.stopPropagation()}>
          <button className="menu-modal-close" onClick={() => setModalProduct(null)}>&times;</button>
          {modalProduct.badge && (
            <span className={`menu-badge menu-badge-${modalProduct.badge.toLowerCase()}`}>{modalProduct.badge}</span>
          )}
          <img src={`http://localhost:3001/images/${modalProduct.image}`} alt={modalProduct.name} className="menu-modal-img" />
          <h2 className="menu-modal-title">{modalProduct.name}</h2>
          {/* Show average rating and count if available */}
          {typeof modalProduct.rating === 'number' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 12px' }}>
              <span style={{ color: '#FFD700', fontSize: 20 }}>{'★'.repeat(Math.round(modalProduct.rating))}{'☆'.repeat(5 - Math.round(modalProduct.rating))}</span>
              <span style={{ color: '#b8860b', fontWeight: 600, fontSize: 16 }}>{modalProduct.rating.toFixed(1)}</span>
              {modalProduct.ratingsCount !== undefined && (
                <span style={{ color: '#888', fontSize: 15, marginLeft: 6 }}>
                  ({modalProduct.ratingsCount} rating{modalProduct.ratingsCount === 1 ? '' : 's'})
                </span>
              )}
            </div>
          )}
          <p className="menu-modal-desc">{modalProduct.description}</p>
          <div className="menu-modal-details">
            <span><b>Serving Size:</b> {modalProduct.servingSize}</span>
            <span><b>Calories:</b> {modalProduct.calories} kcal</span>
            <span><b>Allergy Info:</b> {modalProduct.allergyInfo}</span>
          </div>
          <p className="menu-modal-price"><b>₹{modalProduct.price.toLocaleString()}</b></p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="menu-container" style={{ padding: '24px 8px', maxWidth: 1200, margin: '0 auto' }}>
        <h1 className="menu-title" style={{ fontSize: '2.2em', textAlign: 'center', marginBottom: 24 }}>Menu</h1>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#b8860b', fontSize: 22, marginTop: 60 }}>
            <div className="spinner" style={{ margin: '0 auto 18px', width: 48, height: 48, border: '6px solid #f3e9d2', borderTop: '6px solid #b8860b', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            Loading menu...
            <style>{`
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
          </div>
        ) : productsData.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', fontSize: 18, marginTop: 60 }}>
            <img src="/menu-images/CoffeeCup.jpeg" alt="No products" style={{ width: 80, opacity: 0.5, marginBottom: 18 }} />
            <div>No products available.</div>
          </div>
        ) : (
          <>
            {/* Filter Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
              {categories.map(category => (
                <button
                  key={category}
                  className={category === selectedCategory ? 'menu-filter-active' : 'menu-filter'}
                  onClick={() => setSelectedCategory(category)}
                  style={{ fontSize: '1em', padding: '10px 18px', borderRadius: 8, marginBottom: 8, minWidth: 90 }}
                >
                  {category}
                </button>
              ))}
            </div>
            {/* Category Sections (only show when a filter is selected) */}
            {selectedCategory !== CATEGORY_ALL && Object.keys(grouped).map((category) => (
              <div key={category} style={{ marginBottom: 32 }}>
                <h2 className="menu-category" style={{ fontSize: '1.2em', marginBottom: 16 }}>{category}</h2>
                <div className="menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48, width: '100%' }}>
                  {grouped[category].map((product) => (
                    <div key={product._id || product.id} className="menu-card" onClick={() => setModalProduct(product)} style={{ cursor: 'pointer', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(59,47,47,0.08)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0, width: '100%' }}>
                      {product.badge && (
                        <span className={`menu-badge menu-badge-${product.badge.toLowerCase()}`}>{product.badge}</span>
                      )}
                      <img src={`http://localhost:3001/images/${product.image}`} alt={product.name} style={{ width: '100%', maxWidth: 180, height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />
                      <h3 style={{ fontSize: '1.1em', margin: '8px 0 4px', textAlign: 'center' }}>{product.name}</h3>
                      <p style={{ fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 8 }}>{product.description}</p>
                      <p style={{ fontWeight: 600, color: '#b8860b', marginBottom: 8 }}>₹{product.price}</p>
                      <button className="menu-order-btn" style={{ width: '100%', padding: '10px 0', borderRadius: 8, fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', margin: '0 auto', letterSpacing: 0.5, boxShadow: '0 1px 4px rgba(184,134,11,0.08)' }} onClick={e => {
                        e.stopPropagation();
                        addToCart(product);
                        Swal.fire({
                          toast: true,
                          position: 'top-end',
                          icon: 'success',
                          title: 'Added to cart!',
                          showConfirmButton: false,
                          timer: 1200,
                          timerProgressBar: true,
                          background: '#fffbe6',
                          color: '#3b2f2f',
                          iconColor: '#b8860b',
                        });
                      }}><span style={{ fontWeight: 800, width: '100%', textAlign: 'center', letterSpacing: 0.5 }}>ADD TO CART</span></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <style>{`
              @media (max-width: 900px) {
                .menu-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 32px !important; }
                .menu-order-btn { display: flex !important; align-items: center !important; justify-content: center !important; font-weight: 700 !important; }
              }
              @media (max-width: 600px) {
                .menu-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
                .menu-title { font-size: 1.1em !important; }
                .menu-category { font-size: 1em !important; }
                .menu-card { padding: 10px !important; }
                .menu-order-btn { font-size: 14px !important; padding: 8px 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; font-weight: 700 !important; }
              }
            `}</style>
          </>
        )}
      </div>
      {renderModal()}
    </>
  );
};

export default Menu; 