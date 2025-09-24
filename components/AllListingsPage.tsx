import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import PropertyListings from './PropertyListings';
import type { Property, User, Profile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import SearchIcon from './icons/SearchIcon';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

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

const GOOGLE_MAPS_API_KEY = 'AIzaSyDukeY7JJI9UkHIFbsCZOrjPDRukqvUOfA'; // User provided API key

const containerStyle = {
  width: '100%',
  height: '100%'
};

const libraries: ('drawing' | 'places' | 'visualization')[] = ['places'];

const AllListingsPage: React.FC<AllListingsPageProps> = (props) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>({lat: -12.9777, lng: -38.5016}); // Default to Salvador
  const [isLoadingGeo, setIsLoadingGeo] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-all-listings',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            setMapCenter({lat: latitude, lng: longitude});
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

  const filteredProperties = props.properties.filter(p => {
    return activeSearchQuery.trim()
        ? p.title.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
          p.address.toLowerCase().includes(activeSearchQuery.toLowerCase())
        : true;
  });

  const onMarkerClick = useCallback((property: Property) => {
    setSelectedProperty(property);
  }, []);

  const onInfoWindowClose = useCallback(() => {
    setSelectedProperty(null);
  }, []);

  return (
    <div className="bg-brand-light-gray min-h-screen flex flex-col">
      <Header {...props} />
      <main className="flex-grow">
        <section className="bg-white py-12">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <img src="https://i.imgur.com/FuxDdyF.png" alt="Quality Home Logo" className="h-24 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">{t('header.searchDropdown.buy.explore')}</h1>
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
              <div className="relative flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-grow w-full">
                    <SearchIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      placeholder={t('hero.locationPlaceholder')}
                      className="w-full px-12 py-3 rounded-full text-brand-dark border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red"
                      autoComplete="off"
                    />
                </div>
                <button 
                    type="submit"
                    className="w-full sm:w-auto bg-brand-red hover:opacity-90 text-white font-bold py-3 px-8 rounded-full transition duration-300"
                >
                    {t('hero.searchButton')}
                </button>
              </div>
            </form>
          </div>
        </section>
        
        <div className="container mx-auto px-4 sm:px-6 mt-8">
            <div className="h-[400px] md:h-[500px] w-full mb-8 rounded-lg overflow-hidden shadow-md relative z-0">
                {isLoadingGeo || !isLoaded ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center animate-pulse">
                        <p className="text-brand-gray">{loadError ? 'Error loading map' : t('map.loading')}</p>
                    </div>
                ) : (
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={mapCenter}
                        zoom={13}
                        options={{
                            fullscreenControl: false,
                            streetViewControl: false,
                            mapTypeControl: false,
                            zoomControl: true
                        }}
                    >
                        {filteredProperties.map(property => (
                            <Marker 
                                key={property.id} 
                                position={{ lat: property.lat, lng: property.lng }}
                                onClick={() => onMarkerClick(property)}
                            />
                        ))}

                        {selectedProperty && (
                            <InfoWindow
                                position={{ lat: selectedProperty.lat, lng: selectedProperty.lng }}
                                onCloseClick={onInfoWindowClose}
                            >
                                <div className="w-48">
                                    <img 
                                        src={selectedProperty.images?.[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'} 
                                        alt={selectedProperty.title}
                                        className="w-full h-24 object-cover rounded-md mb-2"
                                    />
                                    <h3 className="font-bold text-sm mb-1 truncate">{selectedProperty.title}</h3>
                                    <p className="text-xs text-brand-gray mb-2 truncate">{selectedProperty.address}</p>
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
            </div>
        </div>

        <PropertyListings
          title={activeSearchQuery ? t('listings.foundTitle') : t('listings.title')}
          properties={filteredProperties}
          onViewDetails={props.onViewDetails}
          favorites={props.favorites}
          onToggleFavorite={props.onToggleFavorite}
          isLoading={false}
          onContactClick={props.onContactClick}
        />
      </main>
      <footer className="bg-brand-light-gray text-brand-gray py-8 text-center mt-12">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} {t('footer.text')}</p>
        </div>
      </footer>
    </div>
  );
};

export default AllListingsPage;