import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import PropertyListings from './components/PropertyListings';
import MapDrawPage from './components/MapDrawPage';

const App: React.FC = () => {
  const [page, setPage] = useState<'home' | 'map'>('home');

  if (page === 'map') {
    return <MapDrawPage onBack={() => setPage('home')} />;
  }

  return (
    <div className="bg-white font-sans text-brand-dark">
      <Header />
      <main>
        <Hero onDrawOnMapClick={() => setPage('map')} />
        <InfoSection />
        <PropertyListings />
      </main>
      <footer className="bg-brand-light-gray text-brand-gray py-8 text-center mt-20">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} Quality Home Portal Imobiliário. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;