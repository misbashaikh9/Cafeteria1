import React from 'react';

const Footer = () => {
  const styles = {
    footer: {
      backgroundColor: '#3b2f2f',
      color: 'white',
      textAlign: 'center',
      padding: '20px 16px',
      fontSize: '14px',
      borderTop: '1px solid #d6a96d',
    },
    link: {
      color: '#d6a96d',
      textDecoration: 'none',
      margin: '0 8px',
    }
  };

  return (
    <footer style={styles.footer}>
      <p>&copy; {new Date().getFullYear()} Brew Haven. All rights reserved.</p>
      <div>
        <a href="#privacy" style={styles.link}>Privacy</a>
        |
        <a href="#terms" style={styles.link}>Terms</a>
        |
        <a href="#contact" style={styles.link}>Contact</a>
      </div>
    </footer>
  );
};

export default Footer;
