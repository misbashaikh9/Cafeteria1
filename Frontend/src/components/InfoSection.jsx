import React, { useState, useEffect } from 'react';

const InfoSection = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

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
      { threshold: 0.3 }
    );

    const element = document.querySelector('#info-section');
    if (element) {
      observer.observe(element);
    }

    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
      if (element) observer.unobserve(element);
    };
  }, []);

  const features = [
    {
      icon: '☕',
      title: 'Premium Quality',
      description: 'Ethically sourced beans, roasted to perfection for the ultimate coffee experience.'
    },
    {
      icon: '🎨',
      title: 'Artisan Crafted',
      description: 'Every cup is handcrafted with love and attention to detail by our expert baristas.'
    },
    {
      icon: '🌱',
      title: 'Sustainable',
      description: 'Committed to eco-friendly practices and supporting local coffee communities.'
    }
  ];

  const styles = {
    infoSection: {
      backgroundColor: '#f3e9d2',
      padding: '100px 24px',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '600px',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      gap: '80px',
      flexWrap: 'wrap',
    },
    infoText: {
      flex: '1 1 500px',
      maxWidth: '600px',
      position: 'relative',
      zIndex: 2,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateX(0)' : 'translateX(-50px)',
      transition: 'all 0.8s ease-out',
    },
    infoHeading: {
      fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
      fontWeight: '800',
      marginBottom: '32px',
      color: '#5d4037',
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
    },
    infoPara: {
      fontSize: 'clamp(1rem, 1.5vw, 1.1rem)',
      color: '#6d4c41',
      marginBottom: '24px',
      lineHeight: '1.7',
      fontWeight: '400',
    },
    highlightText: {
      color: '#b8860b',
      fontWeight: '700',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '24px',
      marginTop: '40px',
    },
    featureCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: '24px',
      borderRadius: '16px',
      textAlign: 'center',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      border: '2px solid transparent',
      cursor: 'pointer',
    },
    featureIcon: {
      fontSize: '2.5rem',
      marginBottom: '16px',
      display: 'block',
    },
    featureTitle: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#5d4037',
      marginBottom: '8px',
    },
    featureDescription: {
      fontSize: '0.9rem',
      color: '#6d4c41',
      lineHeight: '1.5',
    },
    infoImage: {
      flex: '1 1 500px',
      maxWidth: '500px',
      borderRadius: '20px',
      width: '100%',
      height: '450px',
      objectFit: 'cover',
      objectPosition: 'center',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.5s ease',
      position: 'relative',
      zIndex: 2,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(50px) scale(0.95)',
      imageRendering: 'crisp-edges', // Ensure crisp image rendering
      backfaceVisibility: 'hidden', // Prevent blur during transforms
    },
    decorativeElement: {
      position: 'absolute',
      top: '10%',
      right: '5%',
      width: '250px',
      height: '250px',
      background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.06) 70%, transparent 100%)',
      borderRadius: '50%',
      zIndex: 1,
      animation: 'float 8s ease-in-out infinite',
    },
    decorativeElement2: {
      position: 'absolute',
      bottom: '20%',
      left: '10%',
      width: '180px',
      height: '180px',
      background: 'radial-gradient(circle, rgba(193, 154, 107, 0.1) 0%, rgba(193, 154, 107, 0.05) 70%, transparent 100%)',
      borderRadius: '50%',
      zIndex: 1,
      animation: 'float 6s ease-in-out infinite reverse',
    },
    // Mobile responsive styles
    mobileContainer: {
      flexDirection: 'column',
      textAlign: 'center',
      gap: '60px',
    },
    mobileImage: {
      order: -1,
    },
  };

  // Add CSS animations
  const animationStyles = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
    }
  `;

  return (
    <section id="info-section" style={styles.infoSection}>
      <style>{animationStyles}</style>
      
      {/* Decorative elements */}
      <div style={styles.decorativeElement}></div>
      <div style={styles.decorativeElement2}></div>
      
      <div style={{...styles.container, ...(isMobile && styles.mobileContainer)}}>
        <div style={styles.infoText}>
          <h2 style={styles.infoHeading}>
            Why Choose <span style={styles.highlightText}>Brew Haven</span>?
          </h2>
          <p style={styles.infoPara}>
            At Brew Haven, we serve <span style={styles.highlightText}>passion in every cup</span>. From rich espresso shots to silky cold brews, we handcraft everything fresh with love and attention to detail.
          </p>
          <p style={styles.infoPara}>
            Our beans are <span style={styles.highlightText}>ethically sourced</span>, roasted to perfection, and brewed with the expertise that comes from years of dedication to the art of coffee making.
          </p>
          
          <div style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  ...styles.featureCard,
                  border: activeFeature === index ? '2px solid #b8860b' : '2px solid transparent',
                  transform: activeFeature === index ? 'translateY(-8px)' : 'translateY(0)',
                  boxShadow: activeFeature === index 
                    ? '0 12px 40px rgba(184, 134, 11, 0.2)' 
                    : '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <span style={styles.featureIcon}>{feature.icon}</span>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <img
          src="/menu-images/Cafe_info.jpg"
          alt="Brew Haven Cafe Atmosphere"
          style={{...styles.infoImage, ...(isMobile && styles.mobileImage)}}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateX(0) scale(1.05)';
            e.target.style.boxShadow = '0 30px 60px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateX(0) scale(1)';
            e.target.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
          }}
        />
      </div>
    </section>
  );
};

export default InfoSection;
    