import React from 'react';
import CoffeeCup from '/menu-images/CoffeeCup.jpeg';

const InfoSection = () => {
  const styles = {
    infoSection: {
      backgroundColor: '#e8d1b4',
      display: 'flex',
      flexWrap: 'wrap',
      padding: '48px 24px',
      justifyContent: 'center',
      gap: '32px',
    },
    infoText: {
      flex: '1 1 300px',
      maxWidth: '500px',
    },
    infoHeading: {
      fontSize: '30px',
      fontWeight: 'bold',
      marginBottom: '16px',
      color: '#7a4c1e',
    },
    infoPara: {
      fontSize: '16px',
      color: '#3b2f2f',
      marginBottom: '12px',
    },
    infoImage: {
      flex: '1 1 300px',
      maxWidth: '500px',
      borderRadius: '12px',
      width: '100%',
      height: 'auto',
    },
  };

  return (
    <section style={styles.infoSection}>
      <div style={styles.infoText}>
        <h2 style={styles.infoHeading}>Why Choose Us?</h2>
        <p style={styles.infoPara}>At Brew Haven, we serve passion in every cup. From rich espresso shots to silky cold brews, we handcraft everything fresh.</p>
        <p style={styles.infoPara}>Our beans are ethically sourced, roasted to perfection, and brewed with love.</p>
      </div>
      <img
       src={CoffeeCup}
        alt="Coffee Cup"
        style={styles.infoImage}
      />
    </section>
  );
};

export default InfoSection;
    