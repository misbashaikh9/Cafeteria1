import React, { useState, useEffect } from 'react';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const showcaseProducts = showcase ? products.slice(0, showcase) : products;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Trigger animation when component comes into view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const element = document.querySelector('#product-cards');
    if (element) {
      observer.observe(element);
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (element) observer.unobserve(element);
    };
  }, []);

  const styles = {
    cardsSection: {
      backgroundColor: '#fff',
      padding: '100px 24px',
      position: 'relative',
      overflow: 'hidden',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 2,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
      transition: 'all 0.8s ease-out',
    },
    sectionTitle: {
      fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
      fontWeight: '800',
      color: '#5d4037',
      textAlign: 'center',
      marginBottom: '16px',
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
    },
    sectionSubtitle: {
      fontSize: 'clamp(1rem, 1.5vw, 1.1rem)',
      color: '#6d4c41',
      textAlign: 'center',
      marginBottom: '80px',
      lineHeight: '1.6',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    cardsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '40px',
      justifyItems: 'center',
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: '24px',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
      maxWidth: 380,
      width: '100%',
      padding: 0,
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(212, 175, 55, 0.1)',
    },
    cardImageWrap: {
      width: '100%',
      aspectRatio: '4/3',
      overflow: 'hidden',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      background: '#f7e5c5',
      position: 'relative',
    },
    cardImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.4s ease',
    },
    badge: {
      position: 'absolute',
      top: 16,
      left: 16,
      background: 'linear-gradient(135deg, #b8860b 0%, #d4af37 100%)',
      color: 'white',
      borderRadius: '16px',
      padding: '6px 14px',
      fontSize: '12px',
      fontWeight: '800',
      letterSpacing: '0.5px',
      zIndex: 2,
      boxShadow: '0 4px 12px rgba(184, 134, 11, 0.4)',
      textTransform: 'uppercase',
    },
    cardContent: {
      padding: '32px 24px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: '100%',
      backgroundColor: '#fff',
    },
    cardTitle: {
      fontSize: '1.4rem',
      fontWeight: '800',
      color: '#5d4037',
      margin: '0 0 12px 0',
      lineHeight: '1.3',
    },
    cardText: {
      fontSize: '1rem',
      color: '#6d4c41',
      margin: '0 0 20px 0',
      lineHeight: '1.6',
      flex: 1,
    },
    price: {
      fontWeight: '800',
      color: '#b8860b',
      fontSize: '1.5rem',
      margin: '0 0 16px 0',
    },
    ratingRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginBottom: '20px',
    },
    addButton: {
      backgroundColor: '#d4af37',
      color: '#fff',
      border: 'none',
      borderRadius: '50px',
      padding: '14px 28px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '700',
      transition: 'all 0.3s ease',
      boxShadow: '0 6px 20px rgba(212, 175, 55, 0.3)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      position: 'relative',
      overflow: 'hidden',
    },
    decorativeElement: {
      position: 'absolute',
      top: '10%',
      right: '5%',
      width: '250px',
      height: '250px',
      background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.04) 70%, transparent 100%)',
      borderRadius: '50%',
      zIndex: 1,
      animation: 'float 8s ease-in-out infinite',
    },
    decorativeElement2: {
      position: 'absolute',
      bottom: '20%',
      left: '10%',
      width: '200px',
      height: '200px',
      background: 'radial-gradient(circle, rgba(193, 154, 107, 0.06) 0%, rgba(193, 154, 107, 0.03) 70%, transparent 100%)',
      borderRadius: '50%',
      zIndex: 1,
      animation: 'float 6s ease-in-out infinite reverse',
    },
  };

  // Add CSS animations
  const animationStyles = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  return (
    <section id="product-cards" style={styles.cardsSection}>
      <style>{animationStyles}</style>
      
      {/* Decorative elements */}
      <div style={styles.decorativeElement}></div>
      <div style={styles.decorativeElement2}></div>
      
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>Featured Products</h2>
        <p style={styles.sectionSubtitle}>
          Discover our most popular and highly-rated beverages, crafted with passion and the finest ingredients.
        </p>
        
        <div style={styles.cardsGrid}>
          {showcaseProducts.map((product, index) => (
            <div 
              key={product._id || product.id} 
              style={{
                ...styles.card,
                transform: hoveredCard === index ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
                boxShadow: hoveredCard === index 
                  ? '0 20px 60px rgba(0, 0, 0, 0.15)' 
                  : '0 12px 40px rgba(0, 0, 0, 0.08)',
                animation: isVisible ? `fadeInUp 0.6s ease-out ${index * 0.1}s both` : 'none',
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={styles.cardImageWrap}>
                {product.badge && (
                  <span style={styles.badge}>{product.badge}</span>
                )}
                <img 
                  src={product.image ? `http://localhost:3001/images/${product.image}` : '/menu-images/default-avatar.svg'} 
                  alt={product.name} 
                  style={{
                    ...styles.cardImage,
                    transform: hoveredCard === index ? 'scale(1.08)' : 'scale(1)',
                  }}
                />
              </div>
              
              <div style={styles.cardContent}>
                <div>
                  <h3 style={styles.cardTitle}>{product.name}</h3>
                  <p style={styles.cardText}>{product.description}</p>
                  <div style={styles.price}>₹{product.price}</div>
                  <div style={styles.ratingRow}>
                    {getStars(product.rating || 0)}
                    <span style={{ color: '#6d4c41', fontSize: '0.9rem', fontWeight: '600' }}>
                      ({product.rating || 0})
                    </span>
                  </div>
                </div>
                
                <button 
                  style={{
                    ...styles.addButton,
                    backgroundColor: hoveredCard === index ? '#b8860b' : '#d4af37',
                    transform: hoveredCard === index ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: hoveredCard === index 
                      ? '0 8px 25px rgba(212, 175, 55, 0.4)' 
                      : '0 6px 20px rgba(212, 175, 55, 0.3)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onAddToCart) onAddToCart(product);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCards;
