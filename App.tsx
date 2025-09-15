
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import PropertyListings from './components/PropertyListings';

const App: React.FC = () => {
  return (
    <div className="bg-brand-neutral-light font-sans text-brand-neutral-black">
      <Header />
      <main>
        <Hero />
        <PropertyListings />
      </main>
      <footer className="bg-brand-neutral-black text-white py-8 text-center">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} Quality Home. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
