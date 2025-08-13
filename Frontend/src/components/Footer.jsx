import React from 'react';

const Footer = () => {
  const styles = {
    footer: {
      backgroundColor: '#3b2f2f',
      color: 'white',
      padding: '60px 24px 40px 24px',
      position: 'relative',
      overflow: 'hidden',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '40px',
      marginBottom: '40px',
    },
    section: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    sectionTitle: {
      fontSize: '1.2rem',
      fontWeight: '700',
      color: '#d6a96d',
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    link: {
      color: '#f5f1eb',
      textDecoration: 'none',
      fontSize: '0.95rem',
      transition: 'color 0.3s ease',
      display: 'block',
      padding: '4px 0',
    },
    linkHover: {
      color: '#d6a96d',
    },
    description: {
      color: '#f5f1eb',
      fontSize: '0.9rem',
      lineHeight: '1.6',
      marginBottom: '16px',
    },
    socialLinks: {
      display: 'flex',
      gap: '16px',
      marginTop: '8px',
    },
    socialIcon: {
      width: '40px',
      height: '40px',
      backgroundColor: 'rgba(214, 169, 109, 0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#d6a96d',
      fontSize: '1.2rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    },
    socialIconHover: {
      backgroundColor: '#d6a96d',
      color: '#3b2f2f',
      transform: 'translateY(-2px)',
    },
    bottomBar: {
      borderTop: '1px solid rgba(214, 169, 109, 0.3)',
      paddingTop: '24px',
      textAlign: 'center',
      fontSize: '0.9rem',
      color: '#f5f1eb',
    },
    copyright: {
      marginBottom: '8px',
    },
    bottomLinks: {
      display: 'flex',
      justifyContent: 'center',
      gap: '24px',
      flexWrap: 'wrap',
    },
    bottomLink: {
      color: '#d6a96d',
      textDecoration: 'none',
      fontSize: '0.85rem',
      transition: 'color 0.3s ease',
    },
    decorativeElement: {
      position: 'absolute',
      top: '10%',
      right: '10%',
      width: '150px',
      height: '150px',
      background: 'radial-gradient(circle, rgba(214, 169, 109, 0.1) 0%, rgba(214, 169, 109, 0.05) 70%, transparent 100%)',
      borderRadius: '50%',
      zIndex: 1,
    },
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      {/* Decorative element */}
      <div style={styles.decorativeElement}></div>
      
      <div style={styles.container}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Brew Haven</h3>
          <p style={styles.description}>
            Experience the perfect blend of tradition and innovation. From rich espresso to creamy lattes, every cup tells a story of passion and craftsmanship.
          </p>
          <div style={styles.socialLinks}>
            <div style={styles.socialIcon}>📘</div>
            <div style={styles.socialIcon}>📷</div>
            <div style={styles.socialIcon}>🐦</div>
            <div style={styles.socialIcon}>📺</div>
          </div>
        </div>
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Quick Links</h3>
          <a href="/menu" style={styles.link}>Our Menu</a>
          <a href="/about" style={styles.link}>About Us</a>
          <a href="/orders" style={styles.link}>Order History</a>
          <a href="/reviews" style={styles.link}>Reviews</a>
          <a href="/contact" style={styles.link}>Contact</a>
        </div>
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Support</h3>
          <a href="/help" style={styles.link}>Help Center</a>
          <a href="/faq" style={styles.link}>FAQ</a>
          <a href="/shipping" style={styles.link}>Shipping Info</a>
          <a href="/returns" style={styles.link}>Returns</a>
          <a href="/feedback" style={styles.link}>Feedback</a>
        </div>
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Contact Info</h3>
          <p style={styles.description}>
            📍 123 Coffee Street, Brew City<br/>
            📞 +1 (555) 123-4567<br/>
            ✉️ hello@brewhaven.com<br/>
            🕒 Mon-Sun: 7AM - 10PM
          </p>
        </div>
      </div>
      
      <div style={styles.bottomBar}>
        <div style={styles.copyright}>
          &copy; {currentYear} Brew Haven. All rights reserved.
        </div>
        <div style={styles.bottomLinks}>
          <a href="#privacy" style={styles.bottomLink}>Privacy Policy</a>
          <a href="#terms" style={styles.bottomLink}>Terms of Service</a>
          <a href="#cookies" style={styles.bottomLink}>Cookie Policy</a>
          <a href="#accessibility" style={styles.bottomLink}>Accessibility</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
