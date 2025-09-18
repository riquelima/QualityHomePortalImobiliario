

import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import PropertyListings from './components/PropertyListings';
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
import MyAdsPage from './components/MyAdsPage';
import { useLanguage } from './contexts/LanguageContext';
import { supabase } from './supabaseClient';
import type { User, Property, ChatSession, Message, Profile } from './types';

interface PageState {
  page: 'home' | 'map' | 'publish' | 'publish-journey' | 'searchResults' | 'propertyDetail' | 'favorites' | 'chatList' | 'chat' | 'myAds';
  userLocation: { lat: number; lng: number } | null;
  searchQuery?: string;
  propertyId?: number;
  chatSessionId?: string;
}

const App: React.FC = () => {
  const [pageState, setPageState] = useState<PageState>({ page: 'home', userLocation: null });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isGeoErrorModalOpen, setIsGeoErrorModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loginIntent, setLoginIntent] = useState<'default' | 'publish'>('default');
  const [favorites, setFavorites] = useState<number[]>([]);
  const { t } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  const [myAds, setMyAds] = useState<Property[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  // Adapt Supabase property data to legacy frontend Property type
  const adaptSupabaseProperty = (dbProperty: any): Property => {
    return {
      ...dbProperty,
      title: dbProperty.titulo,
      address: dbProperty.endereco_completo,
      bedrooms: dbProperty.quartos,
      bathrooms: dbProperty.banheiros,
      area: dbProperty.area_bruta,
      lat: dbProperty.latitude,
      lng: dbProperty.longitude,
      price: dbProperty.preco,
      description: dbProperty.descricao,
      images: dbProperty.midias_imovel?.filter((m: any) => m.tipo === 'imagem').map((m: any) => m.url) || ['https://picsum.photos/seed/' + dbProperty.id + '/800/600'],
      videos: dbProperty.midias_imovel?.filter((m: any) => m.tipo === 'video').map((m: any) => m.url),
      owner: dbProperty.owner ? {
          ...dbProperty.owner,
          phone: dbProperty.owner.telefone,
          email: 'user-not-exposed-for-privacy@email.com',
      } : undefined,
      caracteristicas_imovel: dbProperty.caracteristicas_imovel,
      caracteristicas_condominio: dbProperty.caracteristicas_condominio,
      situacao_ocupacao: dbProperty.situacao_ocupacao,
      taxa_condominio: dbProperty.taxa_condominio,
      possui_elevador: dbProperty.possui_elevador,
    };
  };

  const fetchAllData = useCallback(async (currentUser: User | null) => {
    // Fetch Properties
    let query = supabase
      .from('imoveis')
      .select('*, owner:anunciante_id(*), midias_imovel(*)');
      
    if (currentUser) {
      // For a logged-in user, fetch their own ads (any status) OR other people's active ads.
      query = query.or(`anunciante_id.eq.${currentUser.id},status.eq.ativo`);
    } else {
      // For a guest, just show all active properties.
      query = query.eq('status', 'ativo');
    }

    const { data: propertiesData, error: propertiesError } = await query;
      
    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      setProperties([]);
      setMyAds([]);
    } else {
      // Use a Map to handle potential duplicates if an ad is both owned by the user and active.
      const propertyMap = new Map();
      propertiesData.forEach(prop => propertyMap.set(prop.id, prop));
      const uniquePropertiesData = Array.from(propertyMap.values());

      const adaptedProperties = uniquePropertiesData.map(adaptSupabaseProperty);
      setProperties(adaptedProperties);
      
      if (currentUser) {
        setMyAds(adaptedProperties.filter(p => p.anunciante_id === currentUser.id));
      } else {
        setMyAds([]);
      }
    }


    if(currentUser) {
      // Fetch Favorites
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favoritos_usuario')
        .select('imovel_id')
        .eq('usuario_id', currentUser.id);
      
      if(favoritesError) console.error('Error fetching favorites:', favoritesError);
      else setFavorites(favoritesData.map(f => f.imovel_id));

      // Fetch Chat Sessions
      const { data: chatData, error: chatError } = await supabase
        .rpc('get_user_chat_sessions', { user_id_param: currentUser.id });

      if (chatError) console.error('Error fetching chat sessions:', chatError);
      else if (chatData) {
        const adaptedSessions = chatData.map((s: any) => ({
            id: s.session_id,
            sessionId: s.session_id,
            propertyId: s.imovel_id,
            imovel_id: s.imovel_id,
            participants: s.participants.reduce((acc: any, p: any) => {
                acc[p.id] = { id: p.id, nome_completo: p.nome_completo };
                return acc;
            }, {}),
            messages: s.messages.map((m: any): Message => ({
                id: m.id,
                senderId: m.remetente_id,
                text: m.conteudo,
                timestamp: new Date(m.data_envio),
                remetente_id: m.remetente_id,
                conteudo: m.conteudo,
                data_envio: m.data_envio,
            })),
            mensagens: s.messages,
            participantes: s.participants.reduce((acc: any, p: any) => {
                acc[p.id] = { id: p.id, nome_completo: p.nome_completo };
                return acc;
            }, {}),
        }));
        setChatSessions(adaptedSessions);
      }
    } else {
      setFavorites([]);
      setChatSessions([]);
      setMyAds([]);
    }
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (event === 'SIGNED_IN' && currentUser) {
        const { data: userProfile, error } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (error && error.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from('perfis')
            .insert({
              id: currentUser.id,
              nome_completo: currentUser.user_metadata.full_name || currentUser.email,
              url_foto_perfil: currentUser.user_metadata.avatar_url,
            })
            .select()
            .single();
          if(insertError) console.error("Error creating profile:", insertError);
          else setProfile(newProfile);
        } else if (userProfile) {
          setProfile(userProfile);
        }
        fetchAllData(currentUser);

        if (loginIntent === 'publish') {
          navigateToPublishJourney();
          setLoginIntent('default');
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        fetchAllData(null);
      }
    });
    
    // Initial fetch for guest user
    const session = supabase.auth.getSession();
    session.then(({ data }) => fetchAllData(data.session?.user ?? null));


    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loginIntent, fetchAllData]);
  
  useEffect(() => {
    const channel = supabase
      .channel('public:mensagens_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens_chat' }, (payload) => {
        const newMessage = payload.new as any;
        setChatSessions(prevSessions => {
            const sessionExists = prevSessions.some(s => s.id === newMessage.sessao_id);
            if (!sessionExists) return prevSessions;

            return prevSessions.map(session => {
                if(session.id === newMessage.sessao_id) {
                    const messageExists = session.mensagens.some(m => m.id === newMessage.id);
                    if(messageExists) return session;

                    const adaptedMessage: Message = {
                        id: newMessage.id,
                        senderId: newMessage.remetente_id,
                        text: newMessage.conteudo,
                        timestamp: new Date(newMessage.data_envio),
                        remetente_id: newMessage.remetente_id,
                        conteudo: newMessage.conteudo,
                        data_envio: newMessage.data_envio,
                    };

                    return { ...session, messages: [...session.messages, adaptedMessage], mensagens: [...session.mensagens, adaptedMessage] };
                }
                return session;
            });
        });
      })
      .subscribe();

      return () => {
        supabase.removeChannel(channel);
      }
  }, [user]);


  const navigateHome = () => setPageState({ page: 'home', userLocation: null });
  const navigateToMap = (location: { lat: number; lng: number } | null = null) => setPageState({ page: 'map', userLocation: location });
  const navigateToPublish = () => setPageState({ page: 'publish', userLocation: null });
  const navigateToPublishJourney = () => setPageState({ page: 'publish-journey', userLocation: null });
  const navigateToSearchResults = (query: string) => setPageState({ page: 'searchResults', userLocation: null, searchQuery: query });
  const navigateToPropertyDetail = (id: number) => setPageState({ page: 'propertyDetail', propertyId: id, userLocation: null });
  const navigateToFavorites = () => setPageState({ page: 'favorites', userLocation: null });
  const navigateToChatList = () => setPageState({ page: 'chatList', userLocation: null });
  const navigateToChat = (sessionId: string) => setPageState({ page: 'chat', chatSessionId: sessionId, userLocation: null });
  const navigateToMyAds = () => {
    if (user) {
      setPageState({ page: 'myAds', userLocation: null });
    } else {
      openLoginModal();
    }
  };

  const openLoginModal = (intent: 'default' | 'publish' = 'default') => {
    setLoginIntent(intent);
    setIsLoginModalOpen(true);
  }
  const closeLoginModal = () => setIsLoginModalOpen(false);
  
  const openGeoErrorModal = () => setIsGeoErrorModalOpen(true);
  const closeGeoErrorModal = () => setIsGeoErrorModalOpen(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleFavorite = async (propertyId: number) => {
    if (!user) {
      openLoginModal();
      return;
    }
    const isCurrentlyFavorite = favorites.includes(propertyId);
    if (isCurrentlyFavorite) {
      const { error } = await supabase.from('favoritos_usuario').delete().match({ usuario_id: user.id, imovel_id: propertyId });
      if (!error) setFavorites(prev => prev.filter(id => id !== propertyId));
      else console.error("Error removing favorite:", error);
    } else {
      const { error } = await supabase.from('favoritos_usuario').insert({ usuario_id: user.id, imovel_id: propertyId });
      if (!error) setFavorites(prev => [...prev, propertyId]);
      else console.error("Error adding favorite:", error);
    }
  };

  const handleAddProperty = useCallback((newProperty: Property) => {
    if (user) {
      fetchAllData(user);
    }
    alert(t('publishJourney.adPublishedSuccess'));
  }, [t, user, fetchAllData]);
  
  const handleDeactivateProperty = useCallback(async (propertyId: number) => {
    const { error } = await supabase
      .from('imoveis')
      .update({ status: 'inativo' })
      .eq('id', propertyId);

    if (error) {
      alert(t('myAdsPage.adDeletedError'));
      console.error('Error deactivating property:', error);
    } else {
      alert(t('myAdsPage.adDeletedSuccess'));
      if(user) {
        fetchAllData(user);
      }
    }
  }, [user, fetchAllData, t]);

  const handleStartChat = async (property: Property) => {
    if (!user || !property.anunciante_id) {
      openLoginModal();
      return;
    }
    
    const { data: existing, error: findError } = await supabase.rpc('find_chat_session', {
      p_imovel_id: property.id,
      user1_id: user.id,
      user2_id: property.anunciante_id
    });

    if (findError) {
      console.error("Error finding chat session:", findError);
      return;
    }

    if (existing) {
        navigateToChat(existing);
    } else {
        const { data: newSession, error: createError } = await supabase.rpc('create_chat_session', {
            p_imovel_id: property.id,
            user1_id: user.id,
            user2_id: property.anunciante_id
        });
        if (createError) {
            console.error("Error creating chat session:", createError);
        } else if (newSession) {
            fetchAllData(user);
            navigateToChat(newSession);
        }
    }
  };

  const handleSendMessage = async (sessionId: string, text: string) => {
    if (!user || !text.trim()) return;

    const newMessage = {
      sessao_id: sessionId,
      remetente_id: user.id,
      conteudo: text.trim(),
    };

    const { error } = await supabase.from('mensagens_chat').insert(newMessage);
    if(error) console.error("Error sending message:", error);
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
                  profile={profile}
                  onLogout={handleLogout}
                  onNavigateToFavorites={navigateToFavorites}
                  onNavigateToChatList={navigateToChatList}
                  onNavigateToMyAds={navigateToMyAds}
               />;
      case 'publish-journey':
        return <PublishJourneyPage
                  onBack={navigateHome}
                  onPublishAdClick={navigateToPublish}
                  onOpenLoginModal={() => openLoginModal('default')}
                  user={user}
                  profile={profile}
                  onLogout={handleLogout}
                  onNavigateToFavorites={navigateToFavorites}
                  onAddProperty={handleAddProperty}
                  onNavigateToChatList={navigateToChatList}
                  onNavigateToMyAds={navigateToMyAds}
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
          profile={profile}
          onLogout={handleLogout}
          onViewDetails={navigateToPropertyDetail}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onNavigateToFavorites={navigateToFavorites}
          onNavigateToChatList={navigateToChatList}
          onNavigateToMyAds={navigateToMyAds}
        />;
      case 'propertyDetail':
        const property = [...properties, ...myAds].find(p => p.id === pageState.propertyId);
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
                  profile={profile}
                  onLogout={handleLogout}
                  isFavorite={favorites.includes(property.id)}
                  onToggleFavorite={toggleFavorite}
                  onNavigateToFavorites={navigateToFavorites}
                  onStartChat={handleStartChat}
                  onNavigateToChatList={navigateToChatList}
                  onNavigateToMyAds={navigateToMyAds}
                />;
      case 'favorites':
          const favoriteProperties = properties.filter(p => favorites.includes(p.id));
          return <FavoritesPage
            onBack={navigateHome}
            properties={favoriteProperties}
            onPublishAdClick={navigateToPublish}
            onAccessClick={() => openLoginModal('default')}
            user={user}
            profile={profile}
            onLogout={handleLogout}
            onViewDetails={navigateToPropertyDetail}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onNavigateToFavorites={navigateToFavorites}
            onNavigateToChatList={navigateToChatList}
            onNavigateToMyAds={navigateToMyAds}
          />;
      case 'chatList':
        if (!user) { navigateHome(); return null; }
        return <ChatListPage
                  onBack={navigateHome}
                  user={user}
                  profile={profile}
                  onLogout={handleLogout}
                  onPublishAdClick={navigateToPublish}
                  onAccessClick={() => openLoginModal('default')}
                  onNavigateToFavorites={navigateToFavorites}
                  onNavigateToChatList={navigateToChatList}
                  chatSessions={chatSessions.filter(s => s.participantes[user.id])}
                  properties={properties}
                  onNavigateToChat={navigateToChat}
                  onNavigateToMyAds={navigateToMyAds}
               />;
      case 'chat':
        const session = chatSessions.find(s => s.id === pageState.chatSessionId);
        const propertyForChat = properties.find(p => p.id === session?.imovel_id);
        if (!session || !user || !propertyForChat) { navigateHome(); return null; }
        return <ChatPage
                  onBack={navigateToChatList}
                  user={user}
                  session={session}
                  property={propertyForChat}
                  onSendMessage={handleSendMessage}
               />;
      case 'myAds':
        if (!user) { navigateHome(); return null; }
        return <MyAdsPage
            onBack={navigateHome}
            user={user}
            profile={profile}
            onLogout={handleLogout}
            onPublishAdClick={navigateToPublishJourney}
            onAccessClick={() => openLoginModal('default')}
            onNavigateToFavorites={navigateToFavorites}
            onNavigateToChatList={navigateToChatList}
            onNavigateToMyAds={navigateToMyAds}
            userProperties={myAds}
            onViewDetails={navigateToPropertyDetail}
            onDeleteProperty={handleDeactivateProperty}
        />;
      case 'home':
      default:
        return (
          <div className="bg-white font-sans text-brand-dark">
            <Header onPublishAdClick={navigateToPublish} onAccessClick={() => openLoginModal('default')} user={user} profile={profile} onLogout={handleLogout} onNavigateToFavorites={navigateToFavorites} onNavigateToChatList={navigateToChatList} onNavigateToMyAds={navigateToMyAds} />
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
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      <GeolocationErrorModal isOpen={isGeoErrorModalOpen} onClose={closeGeoErrorModal} />
    </>
  );
};

export default App;
