import React from 'react';

const Hero = () => {
  const styles = {
    hero: {
      backgroundColor: '#3b2f2f',
      color: 'white',
      textAlign: 'center',
      padding: '48px 24px',
    },
    heroTitle: {
      fontSize: '36px',
      fontWeight: 'bold',
      marginBottom: '16px',
    },
    heroSubtitle: {
      fontSize: '18px',
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
    <section style={styles.hero}>
      <h1 style={styles.heroTitle}>Start Your Day Right ☕</h1>
      <p style={styles.heroSubtitle}>Delicious brews, cozy vibes, and your perfect cup of coffee</p>
      <button style={styles.button}>Read More</button>
    </section>
  );
};

export default Hero;
