import React, { Suspense, lazy } from 'react';
import Hero from './Hero';
import InfoSection from './InfoSection';

// Lazy load components for better performance
const PromoSection = lazy(() => import('./PromoSection'));
const ProductCards = lazy(() => import('./ProductCards'));
const Footer = lazy(() => import('./Footer'));

const Home = () => {
  return (
    <>
      <Hero />
      <InfoSection />
      <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#b8860b' }}>Loading...</div>}>
        <PromoSection />
        <ProductCards />
        <Footer />
      </Suspense>
    </>
  );
};

export default React.memo(Home);
