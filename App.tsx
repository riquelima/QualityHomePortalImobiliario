
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import PropertyListings from './components/PropertyListings';
import MapDrawPage from './components/MapDrawPage';
import PublishAdPage from './components/PublishAdPage';
import LoginModal from './components/LoginModal'; // Importar o novo modal
import { useLanguage } from './contexts/LanguageContext';

interface PageState {
  page: 'home' | 'map' | 'publish';
  userLocation: { lat: number; lng: number } | null;
}

const App: React.FC = () => {
  const [pageState, setPageState] = useState<PageState>({ page: 'home', userLocation: null });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // Estado para o modal
  const { t } = useLanguage();

  const navigateHome = () => setPageState({ page: 'home', userLocation: null });
  const navigateToMap = (location: { lat: number; lng: number } | null = null) => setPageState({ page: 'map', userLocation: location });
  const navigateToPublish = () => setPageState({ page: 'publish', userLocation: null });
  
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  if (pageState.page === 'map') {
    return <MapDrawPage 
              onBack={navigateHome} 
              userLocation={pageState.userLocation} 
           />;
  }
  
  if (pageState.page === 'publish') {
    return <PublishAdPage onBack={navigateHome} onPublishAdClick={openLoginModal} onOpenLoginModal={openLoginModal} />;
  }

  return (
    <div className="bg-white font-sans text-brand-dark">
      <Header onPublishAdClick={navigateToPublish} onAccessClick={openLoginModal} />
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
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </div>
  );
};

export default App;
