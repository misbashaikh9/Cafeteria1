import React, { useState, useEffect } from 'react';
import Header from './Header.jsx';

const Hero = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Preload the hero image - Update this path when you add a new high-quality hero image
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    // Change this to your new image path (e.g., '/menu-images/Cafe_Hero.jpg' or '/menu-images/Cafe_Hero.webp')
    // For testing, you can use: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&h=1080&fit=crop'
    img.src = '/menu-images/Cafe_Hero.avif'; // ← CHANGE THIS LINE

    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const styles = {
    hero: {
      backgroundImage: imageLoaded 
        ? 'url("/menu-images/Cafe_Hero.jpg")' // Your new beautiful coffee image
        : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      color: '#fff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background-image 0.5s ease',
      // Better image rendering for crisp display
      imageRendering: 'crisp-edges',
      WebkitImageRendering: 'crisp-edges',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.15)', // Very light overlay
      zIndex: 1,
    },
    headerContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    heroContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end', // Position to the right
      padding: '120px 120px 60px 24px', // Increased right padding to move text more to the right
      position: 'relative',
      zIndex: 2,
      flex: 1,
    },
    heroContent: {
      flex: '0 1 auto', // Don't stretch, just take needed space
      maxWidth: '600px',
      zIndex: 2,
      position: 'relative',
      opacity: 1, // Set to 1 to remove animation
      transition: 'none', // Remove transition to prevent sliding
      textAlign: 'right', // Align text to the right
      marginRight: '0', // Ensure it's aligned to the right
      paddingRight: '0', // Remove right padding to position text closer to the right edge
      marginLeft: 'auto', // Push content to the right
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end', // Align all content to the right
      transform: 'translateX(-10px)', // Move content further to the right
    },
    textContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end', // Align title to the right
      maxWidth: '900px', // Increased to match subtitle maxWidth
      width: '100%',
      marginRight: '0', // Reset margin
      textAlign: 'right', // Ensure text alignment
    },
    subtitleWrapper: {
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-start', // Left align the subtitle
      marginBottom: '40px',
      alignSelf: 'stretch', // Allow the wrapper to stretch full width
      marginRight: '-30px', // Match the title's right margin
      maxWidth: '100%', // Ensure full width is available
    },
    heroTitle: {
      fontSize: 'clamp(3rem, 6vw, 4.5rem)',
      fontWeight: '800',
      marginBottom: '24px',
      color: '#fff', // White color for better contrast
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
      textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 255, 255, 0.3)', // Enhanced shadow for crisp text
      WebkitFontSmoothing: 'antialiased', // Fix font blurriness
      MozOsxFontSmoothing: 'grayscale', // Fix font blurriness
      fontSmooth: 'never', // Prevent font smoothing issues
      textRendering: 'optimizeLegibility', // Optimize text rendering
      whiteSpace: 'nowrap', // Keep text in one line
      textAlign: 'right', // Keep title right-aligned
      alignSelf: 'flex-end', // Ensure title aligns to the right
      marginLeft: 'auto', // Push title to the right
      marginRight: '-30px', // Move title even further to the right
    },
    heroSubtitle: {
      fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
      color: '#fff', // White color for better contrast
      lineHeight: '1.6', // Good line height for readability
      maxWidth: '900px', // Increased width for longer line
      textShadow: '1px 1px 4px rgba(0, 0, 0, 0.8), 0 0 15px rgba(255, 255, 255, 0.2)', // Enhanced shadow
      fontWeight: '500', // Medium weight for better readability
      WebkitFontSmoothing: 'antialiased', // Fix font blurriness
      MozOsxFontSmoothing: 'grayscale', // Fix font blurriness
      textRendering: 'optimizeLegibility', // Optimize text rendering
      textAlign: 'left', // Left align the subtitle text
      alignSelf: 'flex-start', // Left align the subtitle within the wrapper
      marginLeft: '0', // Align to the left
      marginRight: 'auto', // Let it take natural width
      fontFamily: 'inherit', // Inherit font family from parent
      whiteSpace: 'pre-line', // Allow line breaks and preserve them
      margin: '0', // Reset default margins
      padding: '0', // Reset default padding
      wordWrap: 'break-word', // Ensure proper word wrapping
      width: '100%', // Ensure full width is used
    },
    buttonGroup: {
      display: 'flex',
      gap: '20px',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'flex-end', // Align buttons to the right to match text
    },
    primaryButton: {
      backgroundColor: isButtonHovered ? '#b8860b' : '#d4af37',
      color: '#fff',
      border: 'none',
      borderRadius: '50px',
      padding: '16px 32px',
      cursor: 'pointer',
      fontSize: '1.1rem',
      fontWeight: '700',
      transition: 'all 0.3s ease',
      boxShadow: isButtonHovered ? '0 8px 30px rgba(212, 175, 55, 0.6)' : '0 6px 25px rgba(212, 175, 55, 0.4)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
      transform: isButtonHovered ? 'translateY(-3px)' : 'translateY(0)',
      position: 'relative',
      overflow: 'hidden',
    },
    secondaryButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
      color: '#2c1810', // Dark text for contrast
      border: '2px solid #d4af37',
      borderRadius: '50px',
      padding: '14px 28px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)', // Subtle shadow
    },
    decorativeElement: {
      position: 'absolute',
      top: '15%',
      right: '8%',
      width: '250px',
      height: '250px',
      background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.08) 70%, transparent 100%)',
      borderRadius: '50%',
      zIndex: 1,
      animation: 'float 6s ease-in-out infinite',
    },
    decorativeElement2: {
      position: 'absolute',
      bottom: '25%',
      left: '5%',
      width: '180px',
      height: '180px',
      background: 'radial-gradient(circle, rgba(193, 154, 107, 0.12) 0%, rgba(193, 154, 107, 0.06) 70%, transparent 100%)',
      borderRadius: '50%',
      zIndex: 1,
      animation: 'float 8s ease-in-out infinite reverse',
    },
    scrollIndicator: {
      position: 'absolute',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '500',
      textAlign: 'center',
      zIndex: 3,
      opacity: 0.8,
      animation: 'bounce 2s infinite',
    },
    scrollArrow: {
      fontSize: '24px',
      marginTop: '8px',
      display: 'block',
    },
    // Mobile responsive styles
    mobileContainer: {
      textAlign: 'center',
    },
    mobileContent: {
      maxWidth: '100%',
    },
    mobileButtonGroup: {
      flexDirection: 'column',
      alignItems: 'center',
    },
  };

  // Add CSS animations
  const animationStyles = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
      40% { transform: translateX(-50%) translateY(-10px); }
      60% { transform: translateX(-50%) translateY(-5px); }
    }
    
    /* Ensure background image is crisp */
    .hero-section {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }
    
    /* Fix text rendering for crisp fonts */
    .hero-section h1,
    .hero-section p {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      font-smooth: never;
    }
  `;

  return (
    <section style={styles.hero} className="hero-section">
      <style>{animationStyles}</style>
      
      {/* Background overlay for text readability */}
      <div style={styles.overlay}></div>
      
      {/* Header overlaid on the hero image */}
      <div style={styles.headerContainer}>
        <Header />
      </div>
      
      {/* Decorative elements */}
      <div style={styles.decorativeElement}></div>
      <div style={styles.decorativeElement2}></div>
      
      <div style={styles.heroContainer}>
        <div style={styles.heroContent}>
          <div style={styles.textContainer}>
            <h1 style={styles.heroTitle}>
              Welcome to <span style={{ color: '#d4af37', textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 255, 255, 0.3)' }}>Brew Haven</span>
            </h1>
            <div style={styles.subtitleWrapper}>
              <p style={styles.heroSubtitle}>
                Experience the perfect blend of tradition and innovation. From rich espresso to creamy lattes,
                every cup tells a story of passion and craftsmanship. Discover your perfect brew today.
              </p>
            </div>
          </div>
          <div style={{...styles.buttonGroup, ...(isMobile && styles.mobileButtonGroup)}}>
            <button 
              style={styles.primaryButton}
              onClick={() => window.location.href = '/menu'}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
            >
              Explore Our Menu
            </button>
            <button 
              style={styles.secondaryButton}
              onClick={() => window.location.href = '/about'}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div style={styles.scrollIndicator}>
        <span>Scroll to explore</span>
        <span style={styles.scrollArrow}>↓</span>
      </div>
    </section>
  );
};

export default Hero;
