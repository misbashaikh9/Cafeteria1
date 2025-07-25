import React from 'react';

const PromoSection = () => {
  const styles = {
    promo: {
      backgroundColor: '#d6bfa1',
      textAlign: 'center',
      padding: '48px 24px',
    },
    promoTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#5c3b1e',
      marginBottom: '16px',
    },
    promoText: {
      fontSize: '16px',
      color: '#3b2f2f',
      marginBottom: '24px',
    },
    button: {
      backgroundColor: '#d6a96d',
      color: 'white',
      border: 'none',
      borderRadius: '9999px',
      padding: '10px 24px',
      cursor: 'pointer',
      fontSize: '16px',
    },
  };

  return (
    <section style={styles.promo}>
      <h3 style={styles.promoTitle}>Morning Happy Hours</h3>
      <p style={styles.promoText}>Enjoy flat 20% off on all beverages every weekday 8AM - 10AM</p>
      <button style={styles.button}>Visit Store</button>
    </section>
  );
};

export default PromoSection;
