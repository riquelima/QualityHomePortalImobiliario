import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import PropertyListings from './components/PropertyListings';

const App: React.FC = () => {
  return (
    <div className="bg-white font-sans text-brand-dark">
      <Header />
      <main>
        <Hero />
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