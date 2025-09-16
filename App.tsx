import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import PropertyListings from './components/PropertyListings';
import MapDrawPage from './components/MapDrawPage';

interface PageState {
  page: 'home' | 'map';
  userLocation: { lat: number; lng: number } | null;
}

const App: React.FC = () => {
  const [pageState, setPageState] = useState<PageState>({ page: 'home', userLocation: null });

  if (pageState.page === 'map') {
    return <MapDrawPage 
              onBack={() => setPageState({ page: 'home', userLocation: null })} 
              userLocation={pageState.userLocation} 
           />;
  }

  return (
    <div className="bg-white font-sans text-brand-dark">
      <Header />
      <main>
        <Hero 
          onDrawOnMapClick={() => setPageState({ page: 'map', userLocation: null })} 
          onSearchNearMe={(location) => setPageState({ page: 'map', userLocation: location })}
        />
        <InfoSection onDrawOnMapClick={() => setPageState({ page: 'map', userLocation: null })} />
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