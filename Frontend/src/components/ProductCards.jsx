import React from 'react';

const getStars = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <span style={{ color: '#FFD700', fontSize: 18 }}>
      {'★'.repeat(fullStars)}{halfStar ? '½' : ''}{'☆'.repeat(emptyStars)}
    </span>
  );
};

const ProductCards = ({ products = [], onAddToCart, showcase = null }) => {
  const showcaseProducts = showcase ? products.slice(0, showcase) : products;

  const styles = {
    cardsSection: {
      backgroundColor: '#f7e5c5',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '32px',
      padding: '48px 24px',
      justifyItems: 'center',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      maxWidth: 320,
      width: '100%',
      padding: 0,
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transition: 'transform 0.15s, box-shadow 0.15s',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    },
    cardImageWrap: {
      width: '100%',
      aspectRatio: '4/3',
      overflow: 'hidden',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      background: '#f3e9d2',
    },
    cardImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.3s',
    },
    badge: {
      position: 'absolute',
      top: 14,
      left: 14,
      background: '#b8860b',
      color: 'white',
      borderRadius: 12,
      padding: '2px 12px',
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: 0.5,
      zIndex: 2,
      boxShadow: '0 1px 4px rgba(184,134,11,0.10)',
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: 700,
      color: '#3b2f2f',
      margin: '18px 0 4px',
      minHeight: 28,
    },
    cardText: {
      fontSize: 14,
      color: '#555',
      margin: '0 0 10px',
      minHeight: 36,
    },
    price: {
      fontWeight: 700,
      color: '#b8860b',
      fontSize: 18,
      margin: '0 0 10px',
    },
    ratingRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginBottom: 8,
    },
    addButton: {
      backgroundColor: '#d6a96d',
      color: 'white',
      border: 'none',
      borderRadius: 9999,
      padding: '10px 0',
      cursor: 'pointer',
      fontSize: 16,
      fontWeight: 700,
      width: '90%',
      margin: '16px auto 18px',
      boxShadow: '0 2px 8px rgba(214,169,109,0.10)',
      letterSpacing: 0.5,
      transition: 'background 0.2s',
      display: 'block',
    },
  };

  return (
    <section style={styles.cardsSection}>
      {showcaseProducts.map(product => (
        <div
          key={product._id || product.id}
          style={styles.card}
          tabIndex={0}
          aria-label={product.name}
          onMouseOver={e => {
            const img = e.currentTarget.querySelector('img');
            if (img) img.style.transform = 'scale(1.07)';
          }}
          onMouseOut={e => {
            const img = e.currentTarget.querySelector('img');
            if (img) img.style.transform = 'scale(1)';
          }}
        >
          {product.badge && (
            <span style={styles.badge}>{product.badge}</span>
          )}
          <div style={styles.cardImageWrap}>
            <img
              src={`http://localhost:3001/images/${product.image}`}
              alt={product.name}
              style={styles.cardImage}
              loading="lazy"
            />
          </div>
          <div style={{ padding: '0 18px', width: '100%' }}>
            <h4 style={styles.cardTitle}>{product.name}</h4>
            <div style={styles.ratingRow}>
              {getStars(product.rating || 0)}
              <span style={{ color: '#b8860b', fontWeight: 600, fontSize: 14, marginLeft: 4 }}>
                {product.rating ? product.rating.toFixed(1) : '—'}
              </span>
              {product.ratingsCount !== undefined && (
                <span style={{ color: '#888', fontSize: 13, marginLeft: 4 }}>
                  ({product.ratingsCount})
                </span>
              )}
            </div>
            <p style={styles.cardText}>{product.description}</p>
            <div style={styles.price}>₹{product.price}</div>
            <button
              style={styles.addButton}
              onClick={() => onAddToCart && onAddToCart(product)}
              aria-label={`Add ${product.name} to cart`}
            >
              ADD TO CART
            </button>
          </div>
        </div>
      ))}
    </section>
  );
};

export default ProductCards;
