
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import PropertyListings from './components/PropertyListings';
import MapDrawPage from './components/MapDrawPage';
import PublishAdPage from './components/PublishAdPage';
import { PublishJourneyPage } from './components/PublishJourneyPage';
import LoginModal from './components/LoginModal';
import GeolocationErrorModal from './components/GeolocationErrorModal';
import SearchResultsPage from './components/SearchResultsPage';
import PropertyDetailPage from './components/PropertyDetailPage';
import FavoritesPage from './components/FavoritesPage';
import ChatListPage from './components/ChatListPage';
import ChatPage from './components/ChatPage';
import MyAdsPage from './components/MyAdsPage';
import SystemModal from './components/SystemModal';
import AllListingsPage from './components/AllListingsPage';
import ContactModal from './components/ContactModal';
import GuideToSellPage from './components/GuideToSellPage';
import DocumentsForSalePage from './components/DocumentsForSalePage';
import { useLanguage } from './contexts/LanguageContext';
import { supabase } from './supabaseClient';
import type { User, Property, ChatSession, Message, Profile, Media } from './types';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';

type MainPage = 'home' | 'favorites' | 'myAds' | 'chatList' | 'publish';
type OverlayPage = 'map' | 'publish-journey' | 'searchResults' | 'propertyDetail' | 'chat' | 'edit-journey' | 'allListings' | 'guideToSell' | 'documentsForSale';

interface PageState {
  id: string;
  page: MainPage | OverlayPage;
  userLocation?: { lat: number; lng: number } | null;
  searchQuery?: string;
  propertyId?: number;
  chatSessionId?: string;
  propertyToEdit?: Property;
}

interface ModalConfig {
  isOpen: boolean;
  type: 'success' | 'error' | 'confirm';
  title: string;
  message: string;
  onConfirm?: () => void;
}

interface TouchState {
    startX: number;
    currentX: number;
    isDragging: boolean;
}

const App: React.FC = () => {
  const [isSplashing, setIsSplashing] = useState(true);
  const [navigationStack, setNavigationStack] = useState<PageState[]>([{ id: `home-${Date.now()}`, page: 'home' }]);
  const [animationDirection, setAnimationDirection] = useState<'push' | 'pop' | 'none'>('none');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isGeoErrorModalOpen, setIsGeoErrorModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({ isOpen: false, type: 'success', title: '', message: '' });
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loginIntent, setLoginIntent] = useState<'default' | 'publish'>('default');
  const [favorites, setFavorites] = useState<number[]>([]);
  const { t } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  const [myAds, setMyAds] = useState<Property[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const fetchingRef = useRef(false);
  const [contactModalProperty, setContactModalProperty] = useState<Property | null>(null);
  const [touchState, setTouchState] = useState<TouchState>({ startX: 0, currentX: 0, isDragging: false });
  // FIX: Replace NodeJS.Timeout with ReturnType<typeof setTimeout> for browser compatibility.
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPage = navigationStack[navigationStack.length - 1];

  const triggerAnimation = (direction: 'push' | 'pop') => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    setAnimationDirection(direction);
    animationTimeoutRef.current = setTimeout(() => {
      setAnimationDirection('none');
    }, 350); // Match animation duration
  };

  const navigate = useCallback((page: Omit<PageState, 'id'>) => {
    const newPage: PageState = { ...page, id: `${page.page}-${Date.now()}` };
    setNavigationStack(stack => [...stack, newPage]);
    triggerAnimation('push');
  }, []);

  const navigateBack = useCallback(() => {
    if (navigationStack.length > 1) {
      triggerAnimation('pop');
      setTimeout(() => {
        setNavigationStack(stack => stack.slice(0, -1));
      }, 0);
    }
  }, [navigationStack.length]);

  const navigateHome = useCallback(() => {
    if (navigationStack.length > 1) {
      triggerAnimation('pop');
      setTimeout(() => {
        setNavigationStack(stack => [stack[0]]);
      }, 0);
    }
  }, [navigationStack.length]);


  const showModal = useCallback((config: Omit<ModalConfig, 'isOpen'>) => {
    setModalConfig({ ...config, isOpen: true });
  }, []);

  const hideModal = () => {
      setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const fetchAllData = useCallback(async (currentUser: User | null) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setIsLoading(true);
      console.time('fetchAllData');

      try {
          let query = supabase
              .from('imoveis')
              .select(`*, midias_imovel ( id, url, tipo ), perfis:anunciante_id ( id, nome_completo, telefone, url_foto_perfil )`);

          if (currentUser) {
              query = query.or(`status.eq.ativo,anunciante_id.eq.${currentUser.id}`);
          } else {
              query = query.eq('status', 'ativo');
          }

          const { data: propertiesData, error } = await query;
          if (error) throw error;

          const adaptedProperties = (propertiesData || []).map((db:any): Property => ({
            ...db, title: db.titulo, address: db.endereco_completo, bedrooms: db.quartos, bathrooms: db.banheiros, area: db.area_bruta, lat: db.latitude, lng: db.longitude, price: db.preco, description: db.descricao,
            images: (db.midias_imovel || []).filter((m:any)=>m.tipo==='imagem').map((m:any)=>m.url),
            videos: (db.midias_imovel || []).filter((m:any)=>m.tipo==='video').map((m:any)=>m.url),
            owner: db.perfis ? { ...db.perfis, phone: db.perfis.telefone } : undefined,
            midias_imovel: db.midias_imovel || [],
          }));

          setProperties(adaptedProperties);
          setMyAds(currentUser ? adaptedProperties.filter(p => p.anunciante_id === currentUser.id) : []);

          if (currentUser) {
              const { data: favoritesData, error: favoritesError } = await supabase.from('favoritos_usuario').select('imovel_id').eq('usuario_id', currentUser.id);
              if (favoritesError) console.error('Error fetching favorites:', favoritesError);
              else setFavorites(favoritesData.map(f => f.imovel_id));

              const { data: chatData, error: chatError } = await supabase.rpc('get_user_chat_sessions', { user_id_param: currentUser.id });
              if (chatError) console.error('Error fetching chat sessions:', chatError);
              else if (chatData) {
                  setChatSessions(chatData.map((s: any) => ({
                      id: s.session_id, sessionId: s.session_id, propertyId: s.imovel_id, imovel_id: s.imovel_id,
                      participants: (s.participants || []).reduce((acc: any, p: any) => p ? ({ ...acc, [p.id]: { id: p.id, nome_completo: p.nome_completo } }) : acc, {}),
                      messages: (s.messages || []).filter((m: any) => m).map((m: any): Message => ({
                          id: m.id, senderId: m.remetente_id, text: m.conteudo, timestamp: new Date(m.data_envio), remetente_id: m.remetente_id, conteudo: m.conteudo, data_envio: m.data_envio,
                      })),
                      mensagens: s.messages || [], participantes: (s.participants || []).reduce((acc: any, p: any) => p ? ({ ...acc, [p.id]: { id: p.id, nome_completo: p.nome_completo } }) : acc, {}),
                  })));
              }
          } else {
              setFavorites([]); setChatSessions([]); setMyAds([]);
          }
      } catch (error: any) {
          console.error('Falha ao buscar dados:', error);
          setProperties([]); setMyAds([]);
          showModal({ type: 'error', title: t('systemModal.errorTitle'), message: `${t('systemModal.fetchError')} ${t('systemModal.errorDetails')}: ${error.message}` });
      } finally {
          console.timeEnd('fetchAllData');
          setIsLoading(false);
          fetchingRef.current = false;
      }
  }, [t, showModal]);
  
  const navigateToPublishJourney = () => navigate({ page: 'publish-journey' });

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: userProfile, error } = await supabase.from('perfis').select('*').eq('id', currentUser.id).single();
        if (error && error.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase.from('perfis').insert({ id: currentUser.id, nome_completo: currentUser.user_metadata.full_name || currentUser.email, url_foto_perfil: currentUser.user_metadata.avatar_url }).select().single();
          if(insertError) console.error("Error creating profile:", insertError); else setProfile(newProfile);
        } else if (userProfile) setProfile(userProfile);
        
        const savedIntent = localStorage.getItem('loginIntent');
        if ((event === 'SIGNED_IN' && savedIntent === 'publish') || loginIntent === 'publish') {
            navigateToPublishJourney();
            if(savedIntent) localStorage.removeItem('loginIntent');
            if(loginIntent === 'publish') setLoginIntent('default');
        }
      } else {
        setProfile(null);
        navigateHome();
      }
      setIsAuthReady(true);
    });
    return () => authListener.subscription.unsubscribe();
  }, [loginIntent, navigate, navigateHome]);

  useEffect(() => { if(isAuthReady) fetchAllData(user); }, [isAuthReady, user, fetchAllData]);
  
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('public:mensagens_chat').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens_chat' }, () => {
      fetchAllData(user);
      if (currentPage.page !== 'chat') setHasUnreadMessages(true);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchAllData, currentPage.page]);

  useEffect(() => {
    if (!isAuthReady) return;
    const propertiesChannel = supabase.channel('public:imoveis').on('postgres_changes', { event: '*', schema: 'public', table: 'imoveis' }, () => fetchAllData(user)).subscribe();
    return () => { supabase.removeChannel(propertiesChannel); };
  }, [isAuthReady, user, fetchAllData]);

  const mainPages: (MainPage | OverlayPage)[] = ['home', 'favorites', 'myAds', 'chatList', 'publish'];
  const isOverlayPage = !mainPages.includes(currentPage.page);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      if (navigationStack.length <= 1 || e.touches[0].clientX > 40) return;
      setTouchState({ startX: e.touches[0].clientX, currentX: e.touches[0].clientX, isDragging: true });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
      if (!touchState.isDragging) return;
      setTouchState(s => ({ ...s, currentX: e.touches[0].clientX }));
  };

  const handleTouchEnd = () => {
      if (!touchState.isDragging) return;
      const dragDistance = touchState.currentX - touchState.startX;
      if (dragDistance > window.innerWidth / 3) {
          navigateBack();
      }
      setTouchState({ startX: 0, currentX: 0, isDragging: false });
  };

  const navigateToMap = (location: { lat: number; lng: number } | null = null) => navigate({ page: 'map', userLocation: location });
  const navigateToPublish = () => user ? navigateToPublishJourney() : openLoginModal('publish');
  const navigateToSearchResults = (query: string) => navigate({ page: 'searchResults', searchQuery: query });
  const navigateToPropertyDetail = (id: number) => navigate({ page: 'propertyDetail', propertyId: id });
  const navigateToFavorites = () => navigate({ page: 'favorites' });
  const navigateToChatList = () => { setHasUnreadMessages(false); navigate({ page: 'chatList' }); };
  const navigateToChat = (sessionId: string) => navigate({ page: 'chat', chatSessionId: sessionId });
  const navigateToMyAds = () => user ? navigate({ page: 'myAds' }) : openLoginModal();
  const navigateToEditJourney = (property: Property) => navigate({ page: 'edit-journey', propertyToEdit: property });
  const navigateToAllListings = () => navigate({ page: 'allListings' });
  const navigateToGuideToSell = () => navigate({ page: 'guideToSell' });
  const navigateToDocumentsForSale = () => navigate({ page: 'documentsForSale' });
  const openLoginModal = (intent: 'default' | 'publish' = 'default') => { setLoginIntent(intent); setIsLoginModalOpen(true); }
  
  const handleLogout = async () => { await supabase.auth.signOut(); navigateHome(); };

  const toggleFavorite = async (propertyId: number) => {
    if (!user) { openLoginModal(); return; }
    const isFavorite = favorites.includes(propertyId);
    if (isFavorite) {
      await supabase.from('favoritos_usuario').delete().match({ usuario_id: user.id, imovel_id: propertyId });
    } else {
      await supabase.from('favoritos_usuario').insert({ usuario_id: user.id, imovel_id: propertyId });
    }
    fetchAllData(user); // Re-fetch to ensure consistency
  };

  const handleAddProperty = useCallback(async () => {
    showModal({ type: 'success', title: t('systemModal.successTitle'), message: t('confirmationModal.message') });
    navigateHome(); if (user) fetchAllData(user);
  }, [user, fetchAllData, t, showModal, navigateHome]);

  const handleUpdateProperty = useCallback(async () => {
    showModal({ type: 'success', title: t('systemModal.successTitle'), message: t('systemModal.editSuccessMessage') });
    navigateHome(); if (user) fetchAllData(user);
  }, [user, fetchAllData, t, showModal, navigateHome]);

  const handlePublishError = useCallback((message: string) => { showModal({ type: 'error', title: t('systemModal.errorTitle'), message }); }, [t, showModal]);

  const confirmDeleteProperty = async (propertyId: number) => {
    const { error: mediaError } = await supabase.from('midias_imovel').delete().eq('imovel_id', propertyId);
    if (mediaError) { showModal({ type: 'error', title: t('systemModal.errorTitle'), message: `${t('myAdsPage.adDeletedError')} (media): ${mediaError.message}` }); return; }
    const { error: propertyError } = await supabase.from('imoveis').delete().eq('id', propertyId);
    if (propertyError) { showModal({ type: 'error', title: t('systemModal.errorTitle'), message: `${t('myAdsPage.adDeletedError')} ${t('systemModal.errorDetails')}: ${propertyError.message}` }); } 
    else { showModal({ type: 'success', title: t('systemModal.successTitle'), message: t('myAdsPage.adDeletedSuccess') }); if (user) fetchAllData(user); }
  };
  
  const handleRequestDeleteProperty = useCallback((propertyId: number) => { showModal({ type: 'confirm', title: t('systemModal.confirmTitle'), message: t('myAdsPage.deleteConfirm'), onConfirm: () => confirmDeleteProperty(propertyId) }); }, [t, showModal]);
  
  const handleStartChat = async (property: Property) => {
    if (!user || !property.anunciante_id) { openLoginModal(); return; }
    const { data: existing, error: findError } = await supabase.rpc('find_chat_session', { p_imovel_id: property.id, user1_id: user.id, user2_id: property.anunciante_id });
    if (findError) { console.error("Error finding chat session:", findError); return; }
    if (existing) navigateToChat(existing);
    else {
      const { data: newSession, error: createError } = await supabase.rpc('create_chat_session', { p_imovel_id: property.id, user1_id: user.id, user2_id: property.anunciante_id });
      if (createError) console.error("Error creating chat session:", createError);
      else if (newSession) { fetchAllData(user); navigateToChat(newSession); }
    }
  };

  const handleSendMessage = async (sessionId: string, text: string) => { if (!user || !text.trim()) return; await supabase.from('mensagens_chat').insert({ sessao_id: sessionId, remetente_id: user.id, conteudo: text.trim() }); };
  const openContactModal = (property: Property) => setContactModalProperty(property);

  const renderPageContent = (pageState: PageState) => {
      // FIX: Correctly assign handleLogout to onLogout prop.
      const commonProps = { user, profile, onLogout: handleLogout, onNavigateToFavorites: navigateToFavorites, onNavigateToChatList: navigateToChatList, onNavigateToMyAds: navigateToMyAds, onNavigateToAllListings: navigateToAllListings, hasUnreadMessages, navigateToGuideToSell, navigateToDocumentsForSale, navigateHome, onPublishAdClick: navigateToPublish, onAccessClick: () => openLoginModal('default'), onSearchSubmit: navigateToSearchResults };
      switch (pageState.page) {
          case 'home': return (<> <Header {...commonProps} /> <main className="pb-24"> <Hero onDrawOnMapClick={() => navigateToMap()} onSearchNearMe={(location) => navigateToMap(location)} onGeolocationError={() => setIsGeoErrorModalOpen(true)} onSearchSubmit={navigateToSearchResults} /> <PropertyListings properties={properties} onViewDetails={navigateToPropertyDetail} favorites={favorites} onToggleFavorite={toggleFavorite} isLoading={isLoading} onContactClick={openContactModal} /> </main> </>);
          case 'favorites': const favProps = properties.filter(p => favorites.includes(p.id)); return <FavoritesPage {...commonProps} onBack={navigateBack} properties={favProps} onViewDetails={navigateToPropertyDetail} favorites={favorites} onToggleFavorite={toggleFavorite} onContactClick={openContactModal} />;
          case 'myAds': if (!user) { navigateHome(); return null; } return <MyAdsPage {...commonProps} onBack={navigateBack} userProperties={myAds} onViewDetails={navigateToPropertyDetail} onDeleteProperty={handleRequestDeleteProperty} onEditProperty={navigateToEditJourney} />;
          case 'chatList': if (!user) { navigateHome(); return null; } return <ChatListPage {...commonProps} onBack={navigateBack} chatSessions={chatSessions.filter(s => s.participantes[user.id])} properties={properties} onNavigateToChat={navigateToChat} />;
          case 'publish': return <PublishAdPage {...commonProps} onBack={navigateBack} onOpenLoginModal={() => openLoginModal('publish')} onNavigateToJourney={navigateToPublishJourney} />;
          case 'map': return <MapDrawPage onBack={navigateBack} userLocation={pageState.userLocation} onViewDetails={navigateToPropertyDetail} favorites={favorites} onToggleFavorite={toggleFavorite} properties={properties} onContactClick={openContactModal} />;
          case 'publish-journey': case 'edit-journey': return <PublishJourneyPage {...commonProps} propertyToEdit={pageState.page === 'edit-journey' ? pageState.propertyToEdit : null} onBack={navigateBack} onAddProperty={handleAddProperty} onUpdateProperty={handleUpdateProperty} onPublishError={handlePublishError} onRequestModal={showModal} onOpenLoginModal={openLoginModal} />;
          case 'searchResults': const q = pageState.searchQuery?.toLowerCase() ?? ''; const filtered = q ? properties.filter(p => p.title.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)) : []; return <SearchResultsPage {...commonProps} onBack={navigateBack} searchQuery={pageState.searchQuery ?? ''} properties={filtered} onViewDetails={navigateToPropertyDetail} favorites={favorites} onToggleFavorite={toggleFavorite} onContactClick={openContactModal} />;
          case 'propertyDetail': const prop = [...properties, ...myAds].find(p => p.id === pageState.propertyId); if (!prop) { navigateBack(); return null; } return <PropertyDetailPage {...commonProps} property={prop} onBack={navigateBack} isFavorite={favorites.includes(prop.id)} onToggleFavorite={toggleFavorite} onStartChat={handleStartChat} />;
          case 'chat': const session = chatSessions.find(s => s.id === pageState.chatSessionId); const propChat = properties.find(p => p.id === session?.imovel_id); if (!session || !user || !propChat) { navigateBack(); return null; } return <ChatPage onBack={navigateBack} user={user} session={session} property={propChat} onSendMessage={handleSendMessage} />;
          case 'allListings': return <AllListingsPage {...commonProps} onBack={navigateBack} properties={properties} onViewDetails={navigateToPropertyDetail} favorites={favorites} onToggleFavorite={toggleFavorite} onSearchSubmit={navigateToSearchResults} onGeolocationError={() => setIsGeoErrorModalOpen(true)} onContactClick={openContactModal} />;
          case 'guideToSell': return <GuideToSellPage {...commonProps} onBack={navigateBack} />;
          case 'documentsForSale': return <DocumentsForSalePage {...commonProps} onBack={navigateBack} />;
          default: return null;
      }
  };

  if (isSplashing) return <SplashScreen onFinished={() => setIsSplashing(false)} />;

  const dragOffset = touchState.isDragging ? Math.max(0, touchState.currentX - touchState.startX) : 0;

  return (
    <>
      <div className="relative h-screen w-screen overflow-hidden bg-white" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        {navigationStack.map((pageState, index) => {
          const isCurrent = index === navigationStack.length - 1;
          const isPrevious = index === navigationStack.length - 2;
          let pageClasses = "absolute inset-0 w-full h-full bg-white transition-transform duration-300 ease-out";
          let transformStyle = {};

          if (isCurrent) {
            transformStyle = { transform: `translateX(${dragOffset}px)`, transition: touchState.isDragging ? 'none' : undefined };
            if (animationDirection === 'push') pageClasses += ' page-enter';
            if (animationDirection === 'pop') pageClasses += ' page-exit-back';
          } else if (isPrevious) {
            transformStyle = { transform: `translateX(calc(-30% + ${dragOffset * 0.3}px))`, transition: touchState.isDragging ? 'none' : undefined };
            if (animationDirection === 'push') pageClasses += ' page-exit';
            if (animationDirection === 'pop') pageClasses += ' page-enter-back';
          } else {
             transformStyle = { transform: 'translateX(-100%)' };
          }
          
          return (
            <div key={pageState.id} className={pageClasses} style={{ zIndex: index * 2, ...transformStyle }}>
                <div className="w-full h-full overflow-y-auto">
                    {renderPageContent(pageState)}
                </div>
            </div>
          );
        })}
      </div>
      
      {!isOverlayPage && (
        <BottomNav 
            activeView={currentPage.page as MainPage}
            onNavigate={(page) => {
               if (page === 'publish') navigateToPublish();
               else navigate({ page: page as MainPage });
            }}
            hasUnreadMessages={hasUnreadMessages}
        />
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} loginIntent={loginIntent} />
      <GeolocationErrorModal isOpen={isGeoErrorModalOpen} onClose={() => setIsGeoErrorModalOpen(false)} />
      <SystemModal {...modalConfig} onClose={hideModal} />
      <ContactModal isOpen={!!contactModalProperty} onClose={() => setContactModalProperty(null)} owner={contactModalProperty?.owner} propertyTitle={contactModalProperty?.title || ''} onStartChat={() => { if (contactModalProperty) { handleStartChat(contactModalProperty); setContactModalProperty(null); }}} />
    </>
  );
};

export default App;
