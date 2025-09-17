
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import PropertyListings from './components/PropertyListings';
import { MOCK_PROPERTIES } from './components/PropertyListings';
import MapDrawPage from './components/MapDrawPage';
import PublishAdPage from './components/PublishAdPage';
import PublishJourneyPage from './components/PublishJourneyPage';
import LoginModal from './components/LoginModal';
import GeolocationErrorModal from './components/GeolocationErrorModal';
import SearchResultsPage from './components/SearchResultsPage';
import PropertyDetailPage from './components/PropertyDetailPage';
import FavoritesPage from './components/FavoritesPage';
import ChatListPage from './components/ChatListPage';
import ChatPage from './components/ChatPage';
import { useLanguage } from './contexts/LanguageContext';
import type { User, Property, ChatSession, Message } from './types';
import { PropertyStatus } from './types';

interface PageState {
  page: 'home' | 'map' | 'publish' | 'publish-journey' | 'searchResults' | 'propertyDetail' | 'favorites' | 'chatList' | 'chat';
  userLocation: { lat: number; lng: number } | null;
  searchQuery?: string;
  propertyId?: number;
  chatSessionId?: string;
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
  const [pageState, setPageState] = useState<PageState>({ page: 'home', userLocation: null });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isGeoErrorModalOpen, setIsGeoErrorModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loginIntent, setLoginIntent] = useState<'default' | 'publish'>('default');
  const [favorites, setFavorites] = useState<number[]>([]);
  const { t } = useLanguage();
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  // Carregar sessão do usuário ao iniciar o app
  useEffect(() => {
    const savedSession = localStorage.getItem('userSession');
    if (savedSession) {
      try {
        const { user: savedUser, timestamp } = JSON.parse(savedSession);
        const sessionAge = Date.now() - timestamp;
        const oneHour = 60 * 60 * 1000;

        if (sessionAge < oneHour) {
          setUser(savedUser);
          // Opcional: futuramente, poderíamos salvar e restaurar favoritos/chats aqui também
        } else {
          // A sessão expirou
          localStorage.removeItem('userSession');
        }
      } catch (error) {
        console.error("Failed to parse user session:", error);
        localStorage.removeItem('userSession');
      }
    }
  }, []);

  const navigateHome = () => setPageState({ page: 'home', userLocation: null });
  const navigateToMap = (location: { lat: number; lng: number } | null = null) => setPageState({ page: 'map', userLocation: location });
  const navigateToPublish = () => setPageState({ page: 'publish', userLocation: null });
  const navigateToPublishJourney = () => setPageState({ page: 'publish-journey', userLocation: null });
  const navigateToSearchResults = (query: string) => setPageState({ page: 'searchResults', userLocation: null, searchQuery: query });
  const navigateToPropertyDetail = (id: number) => setPageState({ page: 'propertyDetail', propertyId: id, userLocation: null });
  const navigateToFavorites = () => setPageState({ page: 'favorites', userLocation: null });
  const navigateToChatList = () => setPageState({ page: 'chatList', userLocation: null });
  const navigateToChat = (sessionId: string) => setPageState({ page: 'chat', chatSessionId: sessionId, userLocation: null });
  
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
      const userData = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      };
      setUser(userData);
      
      // Salvar sessão no localStorage
      const sessionData = {
        user: userData,
        timestamp: Date.now(),
      };
      localStorage.setItem('userSession', JSON.stringify(sessionData));

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
    setChatSessions([]); // Limpa os chats ao deslogar
    localStorage.removeItem('userSession'); // Remove a sessão salva
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

  const handleAddProperty = (newPropertyData: Omit<Property, 'id' | 'images' | 'status'>) => {
    const newProperty: Property = {
      ...newPropertyData,
      id: properties.length + 1, // Simple ID generation
      images: ['https://picsum.photos/seed/newprop' + (properties.length + 1) + '/800/600', 'https://picsum.photos/seed/newprop' + (properties.length + 2) + '/800/600'], // Placeholder image
      status: PropertyStatus.New,
    };
    setProperties(prev => [newProperty, ...prev]);
    alert(t('publishJourney.adPublishedSuccess'));
    navigateHome();
  };
  
  const handleStartChat = (property: Property) => {
    if (!user || !property.owner) {
      openLoginModal();
      return;
    }
    const participants = [user.email, property.owner.email].sort();
    const sessionId = `${property.id}-${participants[0]}-${participants[1]}`;
    const existingSession = chatSessions.find(s => s.sessionId === sessionId);

    if (existingSession) {
      navigateToChat(sessionId);
    } else {
      const newSession: ChatSession = {
        sessionId,
        propertyId: property.id,
        participants: {
          [user.email]: user.name,
          [property.owner.email]: property.owner.name,
        },
        messages: [],
      };
      setChatSessions(prev => [...prev, newSession]);
      navigateToChat(sessionId);
    }
  };

  const handleSendMessage = (sessionId: string, text: string) => {
    if (!user || !text.trim()) return;

    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      senderId: user.email,
      text: text.trim(),
      timestamp: new Date(),
    };

    setChatSessions(prevSessions =>
      prevSessions.map(session =>
        session.sessionId === sessionId
          ? { ...session, messages: [...session.messages, newMessage] }
          : session
      )
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
                  properties={properties}
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
                  onNavigateToChatList={navigateToChatList}
               />;
      case 'publish-journey':
        return <PublishJourneyPage
                  onBack={navigateHome}
                  onPublishAdClick={navigateToPublish}
                  onOpenLoginModal={() => openLoginModal('default')}
                  user={user}
                  onLogout={handleLogout}
                  onNavigateToFavorites={navigateToFavorites}
                  onAddProperty={handleAddProperty}
                  onNavigateToChatList={navigateToChatList}
                />;
      case 'searchResults':
        const query = pageState.searchQuery?.toLowerCase() ?? '';
        const filteredProperties = query
          ? properties.filter(p =>
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
          onNavigateToFavorites={navigateToFavorites}
          onNavigateToChatList={navigateToChatList}
        />;
      case 'propertyDetail':
        const property = properties.find(p => p.id === pageState.propertyId);
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
                  onNavigateToFavorites={navigateToFavorites}
                  onStartChat={handleStartChat}
                  onNavigateToChatList={navigateToChatList}
                />;
      case 'favorites':
          const favoriteProperties = properties.filter(p => favorites.includes(p.id));
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
            onNavigateToChatList={navigateToChatList}
          />;
      case 'chatList':
        if (!user) {
          navigateHome();
          return null;
        }
        return <ChatListPage
                  onBack={navigateHome}
                  user={user}
                  onLogout={handleLogout}
                  onPublishAdClick={navigateToPublish}
                  onAccessClick={() => openLoginModal('default')}
                  onNavigateToFavorites={navigateToFavorites}
                  onNavigateToChatList={navigateToChatList}
                  chatSessions={chatSessions.filter(s => Object.keys(s.participants).includes(user.email))}
                  properties={properties}
                  onNavigateToChat={navigateToChat}
               />;
      case 'chat':
        const session = chatSessions.find(s => s.sessionId === pageState.chatSessionId);
        const propertyForChat = properties.find(p => p.id === session?.propertyId);
        if (!session || !user || !propertyForChat) {
          navigateHome();
          return null;
        }
        return <ChatPage
                  onBack={navigateToChatList}
                  user={user}
                  session={session}
                  property={propertyForChat}
                  onSendMessage={handleSendMessage}
               />;
      case 'home':
      default:
        return (
          <div className="bg-white font-sans text-brand-dark">
            <Header onPublishAdClick={navigateToPublish} onAccessClick={() => openLoginModal('default')} user={user} onLogout={handleLogout} onNavigateToFavorites={navigateToFavorites} onNavigateToChatList={navigateToChatList} />
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
                properties={properties}
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
