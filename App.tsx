
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import PropertyListings, { MOCK_PROPERTIES } from './components/PropertyListings';
import MapDrawPage from './components/MapDrawPage';
import PublishAdPage from './components/PublishAdPage';
import PublishJourneyPage from './components/PublishJourneyPage';
import LoginModal from './components/LoginModal';
import GeolocationErrorModal from './components/GeolocationErrorModal';
import SearchResultsPage from './components/SearchResultsPage';
import PropertyDetailPage from './components/PropertyDetailPage';
import FavoritesPage from './components/FavoritesPage';
import { useLanguage } from './contexts/LanguageContext';
import type { User } from './types';

interface PageState {
  page: 'home' | 'map' | 'publish' | 'publish-journey' | 'searchResults' | 'propertyDetail' | 'favorites';
  userLocation: { lat: number; lng: number } | null;
  searchQuery?: string;
  propertyId?: number;
}

// Função para decodificar o JWT do Google de forma segura
function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

const App: React.FC = () => {
  const [pageState, setPageState] = useState<PageState>({ page: 'home', userLocation: null, searchQuery: '' });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isGeoErrorModalOpen, setIsGeoErrorModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loginIntent, setLoginIntent] = useState<'default' | 'publish'>('default');
  const [favorites, setFavorites] = useState<number[]>([]);
  const { t } = useLanguage();

  const navigateHome = () => setPageState({ page: 'home', userLocation: null, searchQuery: '' });
  const navigateToMap = (location: { lat: number; lng: number } | null = null) => setPageState({ page: 'map', userLocation: location, searchQuery: '' });
  const navigateToPublish = () => setPageState({ page: 'publish', userLocation: null, searchQuery: '' });
  const navigateToPublishJourney = () => setPageState({ page: 'publish-journey', userLocation: null, searchQuery: '' });
  const navigateToSearchResults = (query: string) => setPageState({ page: 'searchResults', userLocation: null, searchQuery: query });
  const navigateToPropertyDetail = (id: number) => setPageState({ page: 'propertyDetail', propertyId: id, userLocation: null, searchQuery: '' });
  const navigateToFavorites = () => setPageState({ page: 'favorites', userLocation: null, searchQuery: '' });
  
  const openLoginModal = (intent: 'default' | 'publish' = 'default') => {
    setLoginIntent(intent);
    setIsLoginModalOpen(true);
  }
  const closeLoginModal = () => setIsLoginModalOpen(false);
  
  const openGeoErrorModal = () => setIsGeoErrorModalOpen(true);
  const closeGeoErrorModal = () => setIsGeoErrorModalOpen(false);

  const handleLoginSuccess = (credentialResponse: any) => {
    const decoded: { name: string, email: string, picture: string } | null = decodeJwt(credentialResponse.credential);
    if (decoded) {
      setUser({
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      });
      closeLoginModal();
      if (loginIntent === 'publish') {
        navigateToPublishJourney();
        setLoginIntent('default'); // Reset intent
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setFavorites([]); // Limpa os favoritos ao deslogar
  };

  const toggleFavorite = (propertyId: number) => {
    if (!user) {
      openLoginModal();
      return;
    }
    setFavorites(prevFavorites =>
      prevFavorites.includes(propertyId)
        ? prevFavorites.filter(id => id !== propertyId)
        : [...prevFavorites, propertyId]
    );
  };


  const renderCurrentPage = () => {
    switch (pageState.page) {
      case 'map':
        return <MapDrawPage 
                  onBack={navigateHome} 
                  userLocation={pageState.userLocation} 
                  onViewDetails={navigateToPropertyDetail}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
               />;
      case 'publish':
        return <PublishAdPage 
                  onBack={navigateHome} 
                  onPublishAdClick={navigateToPublish}
                  onOpenLoginModal={() => openLoginModal('publish')} 
                  onNavigateToJourney={navigateToPublishJourney}
                  user={user}
                  onLogout={handleLogout}
                  onNavigateToFavorites={navigateToFavorites}
               />;
      case 'publish-journey':
        return <PublishJourneyPage
                  onBack={navigateHome}
                  onPublishAdClick={navigateToPublish}
                  onOpenLoginModal={() => openLoginModal('default')}
                  user={user}
                  onLogout={handleLogout}
                  onNavigateToFavorites={navigateToFavorites}
                />;
      case 'searchResults':
        const query = pageState.searchQuery?.toLowerCase() ?? '';
        const filteredProperties = query
          ? MOCK_PROPERTIES.filter(p =>
            p.title.toLowerCase().includes(query) || p.address.toLowerCase().includes(query)
          )
          : [];
        return <SearchResultsPage
          onBack={navigateHome}
          searchQuery={pageState.searchQuery ?? ''}
          properties={filteredProperties}
          onPublishAdClick={navigateToPublish}
          onAccessClick={() => openLoginModal('default')}
          user={user}
          onLogout={handleLogout}
          onViewDetails={navigateToPropertyDetail}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />;
      case 'propertyDetail':
        const property = MOCK_PROPERTIES.find(p => p.id === pageState.propertyId);
        if (!property) {
          navigateHome();
          return null;
        }
        return <PropertyDetailPage 
                  property={property}
                  onBack={() => window.history.back()}
                  onPublishAdClick={navigateToPublish} 
                  onAccessClick={() => openLoginModal('default')} 
                  user={user} 
                  onLogout={handleLogout}
                  isFavorite={favorites.includes(property.id)}
                  onToggleFavorite={toggleFavorite}
                />;
      case 'favorites':
          const favoriteProperties = MOCK_PROPERTIES.filter(p => favorites.includes(p.id));
          return <FavoritesPage
            onBack={navigateHome}
            properties={favoriteProperties}
            onPublishAdClick={navigateToPublish}
            onAccessClick={() => openLoginModal('default')}
            user={user}
            onLogout={handleLogout}
            onViewDetails={navigateToPropertyDetail}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onNavigateToFavorites={navigateToFavorites}
          />;
      case 'home':
      default:
        return (
          <div className="bg-white font-sans text-brand-dark">
            <Header onPublishAdClick={navigateToPublish} onAccessClick={() => openLoginModal('default')} user={user} onLogout={handleLogout} onNavigateToFavorites={navigateToFavorites} />
            <main>
              <Hero 
                onDrawOnMapClick={() => navigateToMap()} 
                onSearchNearMe={(location) => navigateToMap(location)}
                onGeolocationError={openGeoErrorModal}
                onSearchSubmit={navigateToSearchResults}
              />
              <InfoSection 
                onDrawOnMapClick={() => navigateToMap()}
                onPublishAdClick={navigateToPublish}
              />
              <PropertyListings 
                onViewDetails={navigateToPropertyDetail} 
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            </main>
            <footer className="bg-brand-light-gray text-brand-gray py-8 text-center mt-20">
              <div className="container mx-auto">
                <p>&copy; {new Date().getFullYear()} {t('footer.text')}</p>
              </div>
            </footer>
          </div>
        );
    }
  };

  return (
    <>
      {renderCurrentPage()}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} onLoginSuccess={handleLoginSuccess} />
      <GeolocationErrorModal isOpen={isGeoErrorModalOpen} onClose={closeGeoErrorModal} />
    </>
  );
};

export default App;
