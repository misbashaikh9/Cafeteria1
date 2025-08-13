import React, { useState, useEffect } from 'react';

const PromoSection = () => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Trigger animation when component comes into view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.querySelector('#promo-section');
    if (element) {
      observer.observe(element);
    }

    // Calculate time until next 8AM
    const calculateTimeUntilNextHappyHour = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentSecond = now.getSeconds();
      
      let targetHour = 8; // 8AM
      let targetDate = new Date();
      
      // If it's past 10AM today, count down to 8AM tomorrow
      if (currentHour >= 10) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      // If it's before 8AM today, count down to 8AM today
      else if (currentHour < 8) {
        // Keep today's date
      }
      // If it's between 8AM and 10AM, count down to 10AM (end of happy hour)
      else if (currentHour >= 8 && currentHour < 10) {
        targetHour = 10; // 10AM
      }
      // If it's between 10AM and midnight, count down to 8AM tomorrow
      else {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      
      targetDate.setHours(targetHour, 0, 0, 0);
      
      const timeDifference = targetDate.getTime() - now.getTime();
      
      if (timeDifference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      
      const hours = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds };
    };

    // Update countdown every second
    const updateCountdown = () => {
      setCountdown(calculateTimeUntilNextHappyHour());
    };

    // Initial update
    updateCountdown();

    // Set up interval
    const timer = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(timer);
      if (element) observer.unobserve(element);
    };
  }, []);

  // Get the current status message based on time
  const getStatusMessage = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour >= 8 && currentHour < 10) {
      return "🎉 Happy Hour is NOW LIVE! 🎉";
    } else if (currentHour >= 10) {
      return "⏰ Next Happy Hour Tomorrow";
    } else {
      return "⏰ Morning Happy Hour Starting Soon";
    }
  };

  // Get the countdown message
  const getCountdownMessage = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour >= 8 && currentHour < 10) {
      return "Happy Hour ends in:";
    } else {
      return "Happy Hour starts in:";
    }
  };

  const styles = {
    promo: {
      backgroundColor: 'linear-gradient(135deg, #f3e9d2 0%, #e8d5b7 100%)',
      background: 'linear-gradient(135deg, #f3e9d2 0%, #e8d5b7 100%)',
      textAlign: 'center',
      padding: '100px 24px',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '500px',
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
    promoTitle: {
      fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
      fontWeight: '800',
      color: '#5d4037',
      marginBottom: '24px',
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
    },
    promoText: {
      fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
      color: '#6d4c41',
      marginBottom: '40px',
      lineHeight: '1.6',
      maxWidth: '700px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    countdownContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      marginBottom: '40px',
    },
    countdownItems: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      flexWrap: 'wrap',
    },
    countdownItem: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '24px 20px',
      borderRadius: '16px',
      minWidth: '100px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '2px solid rgba(184, 134, 11, 0.2)',
      textAlign: 'center',
      transition: 'all 0.3s ease',
    },
    countdownNumber: {
      fontSize: '2rem',
      fontWeight: '800',
      color: '#b8860b',
      display: 'block',
    },
    countdownLabel: {
      fontSize: '0.8rem',
      color: '#6d4c41',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginTop: '4px',
    },
    button: {
      backgroundColor: isButtonHovered ? '#b8860b' : '#d4af37',
      color: '#fff',
      border: 'none',
      borderRadius: '50px',
      padding: '16px 40px',
      cursor: 'pointer',
      fontSize: '1.1rem',
      fontWeight: '700',
      transition: 'all 0.3s ease',
      boxShadow: isButtonHovered ? '0 8px 30px rgba(212, 175, 55, 0.6)' : '0 6px 25px rgba(212, 175, 55, 0.4)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      transform: isButtonHovered ? 'translateY(-3px)' : 'translateY(0)',
      position: 'relative',
      overflow: 'hidden',
    },
    decorativeElement: {
      position: 'absolute',
      top: '10%',
      left: '5%',
      width: '200px',
      height: '200px',
      background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.08) 70%, transparent 100%)',
      borderRadius: '50%',
      zIndex: 1,
      animation: 'float 6s ease-in-out infinite',
    },
    decorativeElement2: {
      position: 'absolute',
      bottom: '20%',
      right: '10%',
      width: '250px',
      height: '250px',
      background: 'radial-gradient(circle, rgba(193, 154, 107, 0.12) 0%, rgba(193, 154, 107, 0.06) 70%, transparent 100%)',
      borderRadius: '50%',
      zIndex: 1,
      animation: 'float 8s ease-in-out infinite reverse',
    },
    highlightText: {
      color: '#b8860b',
      fontWeight: '800',
    },
    badge: {
      display: 'inline-block',
      backgroundColor: '#b8860b',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: '700',
      marginBottom: '16px',
      boxShadow: '0 4px 16px rgba(184, 134, 11, 0.3)',
    },
  };

  // Add CSS animations
  const animationStyles = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `;

  return (
    <section id="promo-section" style={styles.promo}>
      <style>{animationStyles}</style>
      
      {/* Decorative elements */}
      <div style={styles.decorativeElement}></div>
      <div style={styles.decorativeElement2}></div>
      
      <div style={styles.container}>
        <div style={styles.badge}>
          {getStatusMessage()}
        </div>
        
        <h3 style={styles.promoTitle}>
          <span style={styles.highlightText}>Morning Happy Hours</span> ☕
        </h3>
        
        <p style={styles.promoText}>
          Start your day right with <span style={styles.highlightText}>20% off</span> on all beverages every weekday from 8AM to 10AM. Perfect for early birds and coffee enthusiasts!
        </p>
        
        <div style={styles.countdownContainer}>
          <div style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '600', color: '#5d4037' }}>
            {getCountdownMessage()}
          </div>
          <div style={styles.countdownItems}>
            <div style={styles.countdownItem}>
              <span style={styles.countdownNumber}>{countdown.hours.toString().padStart(2, '0')}</span>
              <span style={styles.countdownLabel}>Hours</span>
            </div>
            <div style={styles.countdownItem}>
              <span style={styles.countdownNumber}>{countdown.minutes.toString().padStart(2, '0')}</span>
              <span style={styles.countdownLabel}>Minutes</span>
            </div>
            <div style={styles.countdownItem}>
              <span style={styles.countdownNumber}>{countdown.seconds.toString().padStart(2, '0')}</span>
              <span style={styles.countdownLabel}>Seconds</span>
            </div>
          </div>
        </div>
        
        <button 
          style={styles.button}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          onClick={() => window.location.href = '/menu'}
        >
          {countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0 ? 'Happy Hour is Live!' : 'Visit Store Now'}
        </button>
      </div>
    </section>
  );
};

export default PromoSection;
