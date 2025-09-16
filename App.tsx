
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import PropertyListings from './components/PropertyListings';
import MapDrawPage from './components/MapDrawPage';
import PublishAdPage from './components/PublishAdPage';
import { useLanguage } from './contexts/LanguageContext';

interface PageState {
  page: 'home' | 'map' | 'publish';
  userLocation: { lat: number; lng: number } | null;
}

const App: React.FC = () => {
  const [pageState, setPageState] = useState<PageState>({ page: 'home', userLocation: null });
  const { t } = useLanguage();

  const navigateHome = () => setPageState({ page: 'home', userLocation: null });
  const navigateToMap = (location: { lat: number; lng: number } | null = null) => setPageState({ page: 'map', userLocation: location });
  const navigateToPublish = () => setPageState({ page: 'publish', userLocation: null });

  if (pageState.page === 'map') {
    return <MapDrawPage 
              onBack={navigateHome} 
              userLocation={pageState.userLocation} 
           />;
  }
  
  if (pageState.page === 'publish') {
    return <PublishAdPage onBack={navigateHome} onPublishAdClick={navigateToPublish} />;
  }

  return (
    <div className="bg-white font-sans text-brand-dark">
      <Header onPublishAdClick={navigateToPublish} />
      <main>
        <Hero 
          onDrawOnMapClick={() => navigateToMap()} 
          onSearchNearMe={(location) => navigateToMap(location)}
        />
        <InfoSection 
          onDrawOnMapClick={() => navigateToMap()}
          onPublishAdClick={navigateToPublish}
        />
        <PropertyListings />
      </main>
      <footer className="bg-brand-light-gray text-brand-gray py-8 text-center mt-20">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} {t('footer.text')}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
