import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './Header';
import PropertyListings from './PropertyListings';
import type { Property, User, Profile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import SearchIcon from './icons/SearchIcon';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Debounce utility function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  const debounced = (...args: Parameters<F>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced;
}

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
}

const AllListingsPage: React.FC<AllListingsPageProps> = (props) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLFormElement>(null);
  
  const [mapCenter, setMapCenter] = useState<[number, number]>([-12.9777, -38.5016]); // Default to Salvador
  const [userCoordinates, setUserCoordinates] = useState<[number, number] | null>(null);
  const [isLoadingGeo, setIsLoadingGeo] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            setMapCenter([latitude, longitude]);
            setUserCoordinates([latitude, longitude]);
            setIsLoadingGeo(false);
        },
        (error) => {
            console.error("Falha ao obter geolocalização, usando localização padrão:", error);
            setIsLoadingGeo(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

    const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    let endpoint = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=br&limit=5`;
    
    if (userCoordinates) {
        const [lat, lon] = userCoordinates;
        const viewbox = `${lon - 0.5},${lat + 0.5},${lon + 0.5},${lat - 0.5}`;
        endpoint += `&viewbox=${viewbox}&bounded=1`;
    }
    
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        setSuggestions(data);
        if (data.length > 0) setIsSuggestionsOpen(true);
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
    }
  }, [userCoordinates]);

  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), [fetchSuggestions]);
  
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      debouncedFetchSuggestions(query);
  };
  
  const handleSuggestionClick = (suggestion: any) => {
    const suggestionText = suggestion.display_name;
    setSearchQuery(suggestionText);
    setActiveSearchQuery(suggestionText);
    setIsSuggestionsOpen(false);
    setMapCenter([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearchQuery(searchQuery);
    setIsSuggestionsOpen(false);
  };

  const filteredProperties = props.properties.filter(p => {
    return activeSearchQuery.trim()
        ? p.title.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
          p.address.toLowerCase().includes(activeSearchQuery.toLowerCase())
        : true;
  });

  return (
    <div className="bg-brand-light-gray min-h-screen flex flex-col">
      <Header {...props} />
      <main className="flex-grow">
        <section className="bg-white py-12">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <img src="https://i.imgur.com/FuxDdyF.png" alt="Quality Home Logo" className="h-24 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">{t('header.searchDropdown.buy.explore')}</h1>
            <form onSubmit={handleSearchSubmit} ref={searchContainerRef} className="max-w-2xl mx-auto">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-grow">
                    <SearchIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onFocus={() => { if(suggestions.length > 0) setIsSuggestionsOpen(true); }}
                      placeholder={t('hero.locationPlaceholder')}
                      className="w-full px-12 py-3 rounded-full text-brand-dark border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red"
                      autoComplete="off"
                    />
                    {isSuggestionsOpen && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[1000] text-left">
                            {suggestions.map((s) => (
                                <button
                                    type="button"
                                    key={s.place_id}
                                    onClick={() => handleSuggestionClick(s)}
                                    className="w-full text-left px-4 py-3 text-brand-dark hover:bg-gray-100 transition-colors"
                                >
                                    {s.display_name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <button 
                    type="submit"
                    className="bg-brand-red hover:opacity-90 text-white font-bold py-3 px-8 rounded-full transition duration-300"
                >
                    {t('hero.searchButton')}
                </button>
              </div>
            </form>
          </div>
        </section>
        
        <div className="container mx-auto px-4 sm:px-6 mt-8">
            <div className="h-[400px] md:h-[500px] w-full mb-8 rounded-lg overflow-hidden shadow-md">
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
        </div>

        <PropertyListings
          title={activeSearchQuery ? t('listings.foundTitle') : t('listings.title')}
          properties={filteredProperties}
          onViewDetails={props.onViewDetails}
          favorites={props.favorites}
          onToggleFavorite={props.onToggleFavorite}
          isLoading={false}
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
