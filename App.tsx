import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import PropertyListings from './components/PropertyListings';
import MapDrawPage from './components/MapDrawPage';
import { PublishJourneyPage } from './components/PublishJourneyPage';
import GeolocationErrorModal from './components/GeolocationErrorModal';
import InitialGeolocationModal from './components/InitialGeolocationModal';
import SearchResultsPage from './components/SearchResultsPage';
import PropertyDetailPage from './components/PropertyDetailPage';
import MyAdsPage from './components/MyAdsPage';
import SystemModal from './components/SystemModal';
import AllListingsPage from './components/AllListingsPage';
import ExplorePage from './components/ExplorePage';
import GuideToSellPage from './components/GuideToSellPage';
import DocumentsForSalePage from './components/DocumentsForSalePage';
import SplashScreen from './components/SplashScreen';
import AdminLoginPage from './components/AdminLoginPage';
import { supabase } from './supabaseClient';
import type { Property, Media, User } from './types';
import { useLanguage } from './contexts/LanguageContext';
import { QUALLITY_HOME_USER_ID } from './config';
import LockIcon from './components/icons/LockIcon';

interface PageState {
  page: 'home' | 'map' | 'publish-journey' | 'searchResults' | 'propertyDetail' | 'edit-journey' | 'allListings' | 'guideToSell' | 'documentsForSale' | 'adminLogin' | 'adminDashboard' | 'explore';
  userLocation: { lat: number; lng: number } | null;
  searchQuery?: string;
  propertyId?: number;
  propertyToEdit?: Property;
  initialMapMode?: 'draw' | 'proximity';
  showAdminSuccessBanner?: 'published' | 'updated';
  exploreOperation?: 'venda' | 'aluguel' | 'temporada';
}

export interface ModalConfig {
  isOpen: boolean;
  type: 'success' | 'error' | 'confirm';
  title: string;
  message: string;
  onConfirm?: () => void;
}

const PAGE_SIZE = 6;

// NOTE: This function is for development purposes and can be run from the browser console.
// e.g., window.seedDatabase()
const seedDatabase = async () => {
  const testUserId = QUALLITY_HOME_USER_ID;
  console.log('--- Iniciando o processo de seeding do banco de dados ---');
  console.log(`Usuário de teste ID: ${testUserId}`);

  try {
    // 1. Limpar dados antigos (incluindo arquivos do storage)
    console.log('Limpando anúncios e mídias antigas...');
    const { data: userProperties, error: fetchError } = await supabase
      .from('imoveis')
      .select('id')
      .eq('anunciante_id', testUserId);
    
    if (fetchError) throw new Error(`Erro ao buscar imóveis antigos: ${fetchError.message}`);

    if (userProperties && userProperties.length > 0) {
      const propertyIds = userProperties.map(p => p.id);
      
      const { data: media, error: fetchMediaError } = await supabase
          .from('midias_imovel')
          .select('url')
          .in('imovel_id', propertyIds);

      if (fetchMediaError) {
          throw new Error(`Erro ao buscar mídias antigas para limpeza: ${fetchMediaError.message}`);
      }
      
      if (media && media.length > 0) {
          const pathsToRemove = media.map(m => {
              try {
                  const url = new URL(m.url);
                  const pathParts = url.pathname.split('/midia/');
                  if (pathParts.length > 1) return pathParts[1];
                  return null;
              } catch (e) { return null; }
          }).filter((p): p is string => p !== null);

          if (pathsToRemove.length > 0) {
              const { error: storageError } = await supabase.storage.from('midia').remove(pathsToRemove);
              if (storageError) {
                  console.error(`Falha ao remover arquivos antigos do armazenamento: ${storageError.message}`);
              } else {
                  console.log(`${pathsToRemove.length} arquivos antigos removidos do armazenamento.`);
              }
          }
      }

      const { error: mediaDeleteError } = await supabase.from('midias_imovel').delete().in('imovel_id', propertyIds);
      if (mediaDeleteError) console.error("Erro ao limpar mídias antigas do DB:", mediaDeleteError.message);
      
      const { error: propertyDeleteError } = await supabase.from('imoveis').delete().in('id', propertyIds);
      if (propertyDeleteError) throw new Error(`Erro ao limpar imóveis antigos: ${propertyDeleteError.message}`);
      
      console.log(`${propertyIds.length} imóvel(is) e suas mídias associadas foram removidos.`);
    }

    console.log('Seeding concluído com sucesso (apenas limpeza).');

  } catch (error: any) {
    console.error('--- FALHA NO SEEDING ---');
    console.error(error.message);
  } finally {
    console.log('--- Processo de seeding finalizado ---');
  }
};


const App: React.FC = () => {
  const { t } = useLanguage();
  const [pageState, setPageState] = useState<PageState>({ page: 'home', userLocation: null });
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSplashScreenFading, setIsSplashScreenFading] = useState(false);
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  
  const [deviceLocation, setDeviceLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeolocationModalOpen, setGeolocationModalOpen] = useState(false);
  const [isGeolocationErrorModalOpen, setGeolocationErrorModalOpen] = useState(false);
  
  const [modalConfig, setModalConfig] = useState<ModalConfig>({ isOpen: false, type: 'success', title: '', message: '' });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState<User | null>(null);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('imoveis')
      .select('*, midias_imovel (id, url, tipo)');

    if (error) {
      console.error("Error fetching properties:", error);
      setModalConfig({ isOpen: true, type: 'error', title: t('systemModal.errorTitle'), message: t('systemModal.fetchError') });
    } else {
      const formattedProperties: Property[] = data.map((p: any) => ({
        ...p,
        // Frontend compatibility mappings
        bedrooms: p.quartos,
        bathrooms: p.banheiros,
        area: p.area_bruta,
        address: p.endereco_completo,
        title: p.titulo,
        lat: p.latitude,
        lng: p.longitude,
        price: p.preco,
        description: p.descricao,
        images: p.midias_imovel.filter((m: Media) => m.tipo === 'imagem').map((m: Media) => m.url),
        videos: p.midias_imovel.filter((m: Media) => m.tipo === 'video').map((m: Media) => m.url),
      }));
      setAllProperties(formattedProperties);
    }
    setIsLoading(false);
  }, [t]);

  const handleAllowGeolocation = useCallback(() => {
    setGeolocationModalOpen(false);
    navigator.geolocation.getCurrentPosition(
      (position) => setDeviceLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => setGeolocationErrorModalOpen(true),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const handlePopState = useCallback(() => {
      const params = new URLSearchParams(window.location.search);
      const page = params.get('page');
      const propertyId = params.get('propertyId');
      if (page === 'propertyDetail' && propertyId) {
          setPageState(prev => ({
              ...prev,
              page: 'propertyDetail',
              propertyId: parseInt(propertyId, 10),
          }));
      } else {
          setPageState(prev => ({ ...prev, page: 'home' }));
      }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const propertyId = params.get('propertyId');
    let navigatedFromUrl = false;

    if (page === 'propertyDetail' && propertyId) {
        setPageState(prev => ({ ...prev, page: 'propertyDetail', propertyId: parseInt(propertyId, 10) }));
        navigatedFromUrl = true;
    }
    
    fetchProperties();
    setTimeout(() => {
        setIsSplashScreenFading(true);
        setTimeout(() => setShowSplashScreen(false), 500);
    }, 2000);
    
    if (!navigatedFromUrl) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            if (result.state === 'prompt') {
                setGeolocationModalOpen(true);
            } else if (result.state === 'granted') {
                handleAllowGeolocation();
            }
        });
    }

    if (typeof window !== 'undefined') {
        (window as any).seedDatabase = seedDatabase;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setAdminUser(user);
      setIsAdminLoggedIn(!!user);
    });

    window.addEventListener('popstate', handlePopState);
    return () => {
        window.removeEventListener('popstate', handlePopState);
        authListener?.subscription.unsubscribe();
    };
  }, [fetchProperties, handleAllowGeolocation, handlePopState]);
  
  const publicProperties = useMemo(() => allProperties.filter(p => p.status === 'ativo'), [allProperties]);
  const adminProperties = useMemo(() => {
    if (!adminUser) return [];
    return allProperties;
  }, [allProperties, adminUser]);

  const handleDenyGeolocation = () => setGeolocationModalOpen(false);

  const navigateTo = (page: PageState['page'], extraState: Partial<Omit<PageState, 'page'>> = {}) => {
    setPageState(prev => ({ ...prev, page, ...extraState }));
    window.scrollTo(0, 0);

    const url = new URL(window.location.href);
    const currentParams = new URLSearchParams(url.search);
    let newParams = new URLSearchParams();

    if (page === 'propertyDetail' && extraState.propertyId) {
        newParams.set('page', page);
        newParams.set('propertyId', String(extraState.propertyId));
    }
    
    if (currentParams.toString() !== newParams.toString()) {
        url.search = newParams.toString();
        window.history.pushState({}, '', url);
    }
  };
  
  const handleSearchSubmit = (query: string) => navigateTo('searchResults', { searchQuery: query });
  
  const handleViewDetails = (id: number) => navigateTo('propertyDetail', { propertyId: id });
  
  const handleNavigateToBuy = () => navigateTo('explore', { exploreOperation: 'venda' });
  const handleNavigateToRent = () => navigateTo('explore', { exploreOperation: 'aluguel' });
  const handleNavigateToSeason = () => navigateTo('explore', { exploreOperation: 'temporada' });

  const handleAdminLogin = (success: boolean) => {
    if (success) {
      navigateTo('adminDashboard');
    }
  };
  
  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    navigateTo('home');
  };

  const handleShareProperty = (propertyId: number) => {
    const url = `${window.location.origin}${window.location.pathname}?page=propertyDetail&propertyId=${propertyId}`;
    navigator.clipboard.writeText(url).then(() => {
        setModalConfig({
            isOpen: true,
            type: 'success',
            title: t('systemModal.linkCopiedTitle'),
            message: t('systemModal.linkCopiedMessage'),
        });
    }).catch(err => {
        console.error('Failed to copy: ', err);
        setModalConfig({
            isOpen: true,
            type: 'error',
            title: t('systemModal.linkCopyErrorTitle'),
            message: t('systemModal.linkCopyErrorMessage'),
        });
    });
};

  const handleDeleteProperty = async (id: number) => {
    const { data: media, error: mediaError } = await supabase.from('midias_imovel').select('url').eq('imovel_id', id);

    if (mediaError) {
      console.error("Error fetching media to delete:", mediaError);
      setModalConfig({ isOpen: true, type: 'error', title: t('systemModal.errorTitle'), message: t('myAdsPage.adDeletedError') });
      return;
    }

    if (media && media.length > 0) {
      const pathsToRemove = media.map(m => {
        try { return new URL(m.url).pathname.split('/midia/')[1]; }
        catch (e) { return null; }
      }).filter((p): p is string => p !== null);

      if (pathsToRemove.length > 0) {
        const { error: storageError } = await supabase.storage.from('midia').remove(pathsToRemove);
        if (storageError) {
          console.error("Error removing files from storage:", storageError.message);
        }
      }
    }

    const { error: deleteError } = await supabase.from('imoveis').delete().eq('id', id);
    if (deleteError) {
      setModalConfig({ isOpen: true, type: 'error', title: t('systemModal.errorTitle'), message: t('myAdsPage.adDeletedError') });
    } else {
      setModalConfig({ isOpen: true, type: 'success', title: t('systemModal.successTitle'), message: t('myAdsPage.adDeletedSuccess') });
      fetchProperties();
    }
  };

  const confirmDeleteProperty = (id: number) => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: t('systemModal.confirmTitle'),
      message: t('myAdsPage.deleteConfirm'),
      onConfirm: () => handleDeleteProperty(id),
    });
  };

  const selectedProperty = useMemo(() => {
    if (pageState.page === 'propertyDetail' && pageState.propertyId) {
      return allProperties.find(p => p.id === pageState.propertyId);
    }
    return null;
  }, [pageState, allProperties]);

  const renderPage = () => {
    const commonHeaderProps = {
      navigateHome: () => navigateTo('home'),
      onNavigateToBuy: handleNavigateToBuy,
      onNavigateToRent: handleNavigateToRent,
      onNavigateToSeason: handleNavigateToSeason,
      navigateToGuideToSell: () => navigateTo('guideToSell'),
      navigateToDocumentsForSale: () => navigateTo('documentsForSale'),
      isAdminLoggedIn,
      onAdminLogout: handleAdminLogout,
      onNavigateToAdminDashboard: () => navigateTo('adminDashboard'),
    };

    switch(pageState.page) {
      case 'home':
        return (
          <>
            <Header {...commonHeaderProps} />
            <PropertyListings
              title={t('home.title')}
              description={t('home.description')}
              properties={publicProperties.slice(0, PAGE_SIZE)}
              onViewDetails={handleViewDetails}
              onShare={handleShareProperty}
              isLoading={isLoading}
              loadMore={() => navigateTo('explore')}
              isFetchingMore={false}
              hasMore={publicProperties.length > PAGE_SIZE}
            />
            <footer className="bg-white text-brand-gray py-8 text-center relative">
              <div className="container mx-auto px-4 sm:px-6">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); navigateTo('adminLogin'); }} 
                  className="absolute right-4 sm:right-6 bottom-8 text-brand-gray hover:text-brand-dark transition-colors"
                  aria-label="Acesso Restrito"
                  title="Acesso Restrito"
                >
                  <LockIcon className="w-5 h-5" />
                </a>
                
                <p>&copy; {new Date().getFullYear()} {t('footer.text')}</p>
                <div className="mt-4 flex justify-center items-center space-x-4">
                    <a href="https://www.instagram.com/portalimobiliarioquallityhome/" target="_blank" rel="noopener noreferrer" aria-label="Siga-nos no Instagram" className="inline-block hover:opacity-75 transition-opacity"><img src="https://cdn-icons-png.flaticon.com/512/3621/3621435.png" alt="Instagram" className="h-8 w-8" /></a>
                </div>
              </div>
            </footer>
          </>
        );
      case 'map':
        return <MapDrawPage onBack={() => navigateTo('home')} userLocation={pageState.userLocation} onViewDetails={handleViewDetails} onShare={handleShareProperty} properties={publicProperties} initialMapMode={pageState.initialMapMode} />;
      case 'publish-journey':
      case 'edit-journey':
        return <PublishJourneyPage onBack={(status) => navigateTo('adminDashboard', { showAdminSuccessBanner: status })} onAddProperty={fetchProperties} onUpdateProperty={fetchProperties} onPublishError={(msg) => setModalConfig({isOpen: true, type: 'error', title: 'Error', message: msg})} propertyToEdit={pageState.propertyToEdit} onRequestModal={setModalConfig} deviceLocation={deviceLocation} adminUser={adminUser} />;
      case 'searchResults':
         const searchFiltered = publicProperties.filter(p => 
            (p.address.toLowerCase().includes(pageState.searchQuery?.toLowerCase() || '')) || 
            (p.title.toLowerCase().includes(pageState.searchQuery?.toLowerCase() || ''))
        );
        return <SearchResultsPage onBack={() => navigateTo('home')} searchQuery={pageState.searchQuery || ''} properties={searchFiltered} onViewDetails={handleViewDetails} onShare={handleShareProperty} {...commonHeaderProps} onNavigateToAllListings={() => navigateTo('allListings')} />;
      case 'propertyDetail':
        if (!selectedProperty) return <div>{t('listings.noResults.title')}</div>;
        return <PropertyDetailPage property={selectedProperty} onBack={() => navigateTo('home')} onShare={handleShareProperty} {...commonHeaderProps} />;
      case 'allListings':
        return <AllListingsPage properties={publicProperties} onViewDetails={handleViewDetails} onShare={handleShareProperty} onSearchSubmit={handleSearchSubmit} deviceLocation={deviceLocation} onGeolocationError={() => setGeolocationErrorModalOpen(true)} onBack={() => navigateTo('home')} {...commonHeaderProps} onNavigateToAllListings={() => navigateTo('allListings')} />;
      case 'explore':
        return <ExplorePage initialOperation={pageState.exploreOperation} properties={publicProperties} onViewDetails={handleViewDetails} onShare={handleShareProperty} onSearchSubmit={handleSearchSubmit} deviceLocation={deviceLocation} onGeolocationError={() => setGeolocationErrorModalOpen(true)} onBack={() => navigateTo('home')} {...commonHeaderProps} />;
      case 'guideToSell':
        return <GuideToSellPage onBack={() => navigateTo('home')} {...commonHeaderProps} />;
      case 'documentsForSale':
        return <DocumentsForSalePage onBack={() => navigateTo('home')} {...commonHeaderProps} />;
      case 'adminLogin':
        return <AdminLoginPage onAdminLogin={handleAdminLogin} />;
      case 'adminDashboard':
        return <MyAdsPage 
                  showSuccessBanner={pageState.showAdminSuccessBanner}
                  onDismissSuccessBanner={() => setPageState(prev => ({ ...prev, showAdminSuccessBanner: undefined }))}
                  onBack={() => navigateTo('home')} 
                  properties={adminProperties} 
                  onViewDetails={handleViewDetails} 
                  onDeleteProperty={confirmDeleteProperty}
                  onEditProperty={(prop) => navigateTo('edit-journey', { propertyToEdit: prop })}
                  onPublishClick={() => navigateTo('publish-journey')}
                  onAdminLogout={handleAdminLogout}
                  onShareProperty={handleShareProperty}
                />;
      default:
        const homeHeaderProps = {
            ...commonHeaderProps,
            user: null,
            profile: null,
        }
        return (
            <>
                <Header {...homeHeaderProps} />
                <div>Page not found</div>
            </>
        )
    }
  }

  return (
    <div className="page-fade-in">
      {showSplashScreen && <SplashScreen isFadingOut={isSplashScreenFading} />}
      {renderPage()}
      <InitialGeolocationModal isOpen={isGeolocationModalOpen} onAllow={handleAllowGeolocation} onDeny={handleDenyGeolocation} />
      <GeolocationErrorModal isOpen={isGeolocationErrorModalOpen} onClose={() => setGeolocationErrorModalOpen(false)} />
      <SystemModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
};

export default App;