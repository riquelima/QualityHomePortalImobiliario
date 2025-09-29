

import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import PropertyListings from './PropertyListings';
import type { Property, User, Profile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import SearchIcon from './icons/SearchIcon';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Autocomplete } from '@react-google-maps/api';

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
  unreadCount: number;
  onGeolocationError: () => void;
  onContactClick: (property: Property) => void;
  navigateToGuideToSell: () => void;
  navigateToDocumentsForSale: () => void;
  navigateHome: () => void;
  deviceLocation: { lat: number; lng: number } | null;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const libraries: ('drawing' | 'places' | 'visualization')[] = ['places'];

const AllListingsPage: React.FC<AllListingsPageProps> = (props) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'venda' | 'aluguel' | 'temporada'>('venda');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  
  const [map, setMap] = useState<any | null>(null);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>({lat: -12.9777, lng: -38.5016}); // Default to Salvador
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [autocomplete, setAutocomplete] = useState<any | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-all-listings',
    googleMapsApiKey: (window as any).APP_CONFIG.MAPS_API_KEY,
    libraries,
  });
  
  const onLoad = useCallback(function callback(mapInstance: any) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);
  
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const keywords = lowerQuery.split(/[\s,]+/).filter(Boolean);

    const newFiltered = props.properties.filter(p => {
        const operationMatch = p.tipo_operacao === activeTab;
        if (!operationMatch) return false;

        if (keywords.length > 0) {
            // Updated to include description as per user request
            const propertyText = `${p.title} ${p.address} ${p.cidade || ''} ${p.description}`.toLowerCase();
            return keywords.every(keyword => propertyText.includes(keyword));
        }

        return true;
    });

    setFilteredProperties(newFiltered);
  }, [searchQuery, activeTab, props.properties]);


  useEffect(() => {
    if (props.deviceLocation) {
        setMapCenter(props.deviceLocation);
    }
  }, [props.deviceLocation]);
  
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The search logic is already handled by the useEffect on searchQuery change.
    // This function can remain to prevent default form submission.
  };

  const onMarkerClick = useCallback((property: Property) => {
    setSelectedProperty(property);
  }, []);

  const onInfoWindowClose = useCallback(() => {
    setSelectedProperty(null);
  }, []);
  
  const onAutocompleteLoad = (autocompleteInstance: any) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place) {
        let newQuery = '';

        if (place.address_components) {
          const getComponent = (type: string, useShortName = false) =>
            place.address_components.find((c: any) => c.types.includes(type))
              ?.[useShortName ? 'short_name' : 'long_name'];
          
          const street = getComponent('route');
          const neighborhood = getComponent('sublocality_level_1');
          const city = getComponent('administrative_area_level_2');
          const state = getComponent('administrative_area_level_1', true);
          
          const queryParts = [street, neighborhood, city, state].filter(Boolean);
          newQuery = [...new Set(queryParts)].join(', ');

        } else {
          newQuery = (place.formatted_address || place.name || '').replace(/, Brazil|, Brasil/i, '').trim();
        }
        
        setSearchQuery(newQuery);

        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const newCenter = { lat, lng };
          setMapCenter(newCenter);
          if (map) {
            map.panTo(newCenter);
            map.setZoom(15);
          }
        }
      }
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };


  return (
    <div className="bg-brand-light-gray min-h-screen flex flex-col">
      <Header {...props} />
      <main className="flex-grow">
        <section className="bg-white py-12">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <img src="https://i.imgur.com/FuxDdyF.png" alt="Quallity Home Logo" className="h-24 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">{t('header.searchDropdown.buy.explore')}</h1>
            
            <div className="flex justify-center border-b mb-6 max-w-2xl mx-auto">
                <button 
                  onClick={() => setActiveTab('venda')}
                  className={`px-4 sm:px-6 py-2 text-base sm:text-lg font-medium transition-colors duration-300 ${activeTab === 'venda' ? 'border-b-4 border-brand-red text-brand-dark' : 'text-brand-gray'}`}
                >
                  {t('hero.tabs.buy')}
                </button>
                <button 
                  onClick={() => setActiveTab('aluguel')}
                  className={`px-4 sm:px-6 py-2 text-base sm:text-lg font-medium transition-colors duration-300 ${activeTab === 'aluguel' ? 'border-b-4 border-brand-red text-brand-dark' : 'text-brand-gray'}`}
                >
                  {t('hero.tabs.rent')}
                </button>
                 <button 
                  onClick={() => setActiveTab('temporada')}
                  className={`px-4 sm:px-6 py-2 text-base sm:text-lg font-medium transition-colors duration-300 ${activeTab === 'temporada' ? 'border-b-4 border-brand-red text-brand-dark' : 'text-brand-gray'}`}
                >
                  {t('hero.tabs.season')}
                </button>
            </div>
            
            <form className="relative max-w-2xl mx-auto" onSubmit={handleSearchSubmit}>
              <SearchIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10"/>
              {isLoaded && (
                <Autocomplete
                  onLoad={onAutocompleteLoad}
                  onPlaceChanged={onPlaceChanged}
                  options={{
                    componentRestrictions: { country: 'br' } // Restrict to Brazil
                  }}
                >
                  <input 
                    type="text" 
                    placeholder={t('hero.locationPlaceholder')}
                    className="w-full pl-12 pr-4 py-3 rounded-full text-brand-dark border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red shadow-sm"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                  />
                </Autocomplete>
              )}
            </form>
          </div>
        </section>
        
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                     <PropertyListings 
                        properties={filteredProperties} 
                        onViewDetails={props.onViewDetails} 
                        favorites={props.favorites} 
                        onToggleFavorite={props.onToggleFavorite} 
                        isLoading={false} 
                        onContactClick={props.onContactClick}
                        title={t('listings.foundTitle')}
                        noResultsTitle="Nenhum imóvel encontrado"
                        noResultsDescription="Tente ajustar seus filtros ou pesquisar por uma localização diferente."
                    />
                </div>
                <div className="lg:col-span-1">
                    <div className="sticky top-24 h-96 lg:h-[600px] bg-gray-300 rounded-lg shadow-md overflow-hidden">
                       {isLoaded && (
                          <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={mapCenter}
                            zoom={13}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                             options={{
                                fullscreenControl: false,
                                streetViewControl: false,
                                mapTypeControl: false,
                                zoomControl: true,
                            }}
                          >
                            {filteredProperties.map(prop => (
                              <Marker 
                                key={prop.id} 
                                position={{ lat: prop.lat, lng: prop.lng }}
                                onClick={() => onMarkerClick(prop)}
                              />
                            ))}
                             {selectedProperty && (
                              <InfoWindow
                                position={{ lat: selectedProperty.lat, lng: selectedProperty.lng }}
                                onCloseClick={onInfoWindowClose}
                              >
                                 <div className="w-48">
                                     <h3 className="font-bold text-sm mb-1 truncate">{selectedProperty.title}</h3>
                                     <button 
                                         onClick={() => props.onViewDetails(selectedProperty.id)}
                                         className="w-full bg-brand-red text-white text-xs font-bold py-1 px-2 rounded hover:opacity-90"
                                     >
                                         {t('propertyCard.details')}
                                     </button>
                                 </div>
                              </InfoWindow>
                            )}
                          </GoogleMap>
                       )}
                       {loadError && <div>Error loading map</div>}
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default AllListingsPage;
