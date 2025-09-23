import React, { useState, useEffect } from 'react';
import Header from './Header';
import PropertyListings from './PropertyListings';
import type { Property, User, Profile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import SearchIcon from './icons/SearchIcon';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import FilterIcon from './icons/FilterIcon';
import FilterPanel, { Filters } from './FilterPanel';

interface AllListingsPageProps {
  onBack: () => void;
  properties: Property[];
  onPublishAdClick: () => void;
  onAccessClick: () => void;
  user: User | null;
  profile: Profile | null;
  onLogout: () => void;
  onViewDetails: (id: number) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  onNavigateToFavorites: () => void;
  onNavigateToChatList: () => void;
  onNavigateToMyAds: () => void;
  onSearchSubmit: (query: string) => void;
  onNavigateToAllListings: () => void;
  hasUnreadMessages: boolean;
  onGeolocationError: () => void;
  onContactClick: (property: Property) => void;
  navigateToGuideToSell: () => void;
  navigateToDocumentsForSale: () => void;
  navigateHome: () => void;
}

const AllListingsPage: React.FC<AllListingsPageProps> = (props) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Filters>({
    operation: '',
    propertyType: '',
    bedrooms: null,
    minPrice: '',
    maxPrice: '',
  });
  
  const [mapCenter, setMapCenter] = useState<[number, number]>([-12.9777, -38.5016]); // Default to Salvador
  const [isLoadingGeo, setIsLoadingGeo] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            setMapCenter([latitude, longitude]);
            setIsLoadingGeo(false);
        },
        (error) => {
            console.error("Falha ao obter geolocalização, usando localização padrão:", error);
            setIsLoadingGeo(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);
  
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearchQuery(searchQuery);
  };

  const handleApplyFilters = (filters: Filters) => {
    setActiveFilters(filters);
    setIsFilterPanelOpen(false);
  };

  const filteredProperties = props.properties.filter(p => {
    const searchMatch = activeSearchQuery.trim()
        ? p.title.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
          p.address.toLowerCase().includes(activeSearchQuery.toLowerCase())
        : true;

    if (!searchMatch) return false;

    const { operation, propertyType, bedrooms, minPrice, maxPrice } = activeFilters;
    if (operation && p.tipo_operacao !== operation) return false;
    if (propertyType && p.tipo_imovel !== propertyType) return false;
    if (bedrooms) {
        if (bedrooms === 4) { // 4+ case
            if (p.quartos < 4) return false;
        } else {
            if (p.quartos !== bedrooms) return false;
        }
    }
    const minPriceNum = minPrice ? parseInt(minPrice, 10) : 0;
    const maxPriceNum = maxPrice ? parseInt(maxPrice, 10) : Infinity;

    if (!isNaN(minPriceNum) && p.price < minPriceNum) return false;
    if (!isNaN(maxPriceNum) && p.price > maxPriceNum) return false;

    return true;
  });

  return (
    <div className="bg-white min-h-screen flex flex-col">
       <Header {...props} />
       <div className="p-4 border-b md:border-none sticky top-[68px] md:top-[88px] bg-white z-30">
            <div className="container mx-auto">
                <button onClick={props.onBack} className="md:hidden flex items-center text-sm text-brand-red mb-2">
                    <ArrowLeftIcon className="w-5 h-5 mr-1" />
                    {t('map.breadcrumbs.home')}
                </button>
                <div className="flex gap-2 items-center">
                    <form onSubmit={handleSearchSubmit} className="flex-grow">
                        <div className="relative">
                            <SearchIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                                placeholder={t('hero.locationPlaceholder')}
                                className="w-full pl-11 pr-4 py-3 rounded-full text-brand-dark bg-brand-light-gray border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-red"
                                autoComplete="off"
                            />
                        </div>
                    </form>
                    <button
                        onClick={() => setIsFilterPanelOpen(true)}
                        className="flex-shrink-0 p-3 border border-gray-300 rounded-full flex items-center gap-2 text-brand-dark hover:bg-gray-100 transition-colors"
                        aria-label="Abrir filtros"
                    >
                        <FilterIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>

      <main className="flex-grow bg-brand-light-gray">
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="h-[400px] md:h-[500px] w-full mb-8 rounded-lg overflow-hidden shadow-md relative z-0">
                {isLoadingGeo ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center animate-pulse">
                        <p className="text-brand-gray">{t('map.loading')}</p>
                    </div>
                ) : (
                    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        />
                        {filteredProperties.map(property => (
                            <Marker key={property.id} position={[property.lat, property.lng]}>
                                <Popup>
                                    <div className="w-48">
                                         <img 
                                            src={property.images?.[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'} 
                                            alt={property.title}
                                            className="w-full h-24 object-cover rounded-md mb-2"
                                        />
                                        <h3 className="font-bold text-sm mb-1 truncate">{property.title}</h3>
                                        <p className="text-xs text-brand-gray mb-2 truncate">{property.address}</p>
                                        <button 
                                            onClick={() => props.onViewDetails(property.id)}
                                            className="w-full bg-brand-red text-white text-xs font-bold py-1 px-2 rounded hover:opacity-90"
                                        >
                                            {t('propertyCard.details')}
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>
       
            <PropertyListings
            title={activeSearchQuery || Object.values(activeFilters).some(v => v) ? t('listings.foundTitle') : undefined}
            properties={filteredProperties}
            onViewDetails={props.onViewDetails}
            favorites={props.favorites}
            onToggleFavorite={props.onToggleFavorite}
            isLoading={false}
            onContactClick={props.onContactClick}
            />
        </div>
      </main>
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        initialFilters={activeFilters}
        onApply={handleApplyFilters}
      />
    </div>
  );
};

export default AllListingsPage;