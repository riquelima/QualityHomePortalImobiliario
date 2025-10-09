import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './Header';
import PropertyCard from './PropertyCard';
import type { Property } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import SearchIcon from './icons/SearchIcon';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Autocomplete } from '@react-google-maps/api';
import SpinnerIcon from './icons/SpinnerIcon';
import MapIcon from './icons/MapIcon';
import ShareIcon from './icons/ShareIcon';

interface ExplorePageProps {
  onBack: () => void;
  properties: Property[];
  onViewDetails: (id: number) => void;
  onShare: (id: number) => void;
  onSearchSubmit: (query: string) => void;
  onGeolocationError: () => void;
  deviceLocation: { lat: number; lng: number } | null;
  initialOperation?: 'venda' | 'aluguel' | 'temporada';
  // Header props
  navigateHome: () => void;
  onNavigateToBuy: () => void;
  onNavigateToRent: () => void;
  onNavigateToSeason: () => void;
  navigateToGuideToSell: () => void;
  navigateToDocumentsForSale: () => void;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const libraries: ('drawing' | 'places' | 'visualization')[] = ['drawing', 'places', 'visualization'];

const ExplorePage: React.FC<ExplorePageProps> = (props) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'venda' | 'aluguel' | 'temporada'>(props.initialOperation || 'venda');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  
  const [map, setMap] = useState<any | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [autocomplete, setAutocomplete] = useState<any | null>(null);

  const [listWidth, setListWidth] = useState(500);
  const isResizingRef = useRef(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>(
    props.deviceLocation || {lat: -12.9777, lng: -38.5016 }
  );
  const [zoom, setZoom] = useState(props.deviceLocation ? 14 : 13);
  
  const [isMobileMapVisible, setIsMobileMapVisible] = useState(false);
  const [isDesktopView, setIsDesktopView] = useState(window.innerWidth >= 1024);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDukeY7JJI9UkHIFbsCZOrjPDRukqvUOfA',
    libraries,
  });
  
  const onLoad = useCallback(function callback(mapInstance: any) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopView(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (props.deviceLocation) {
      setMapCenter(props.deviceLocation);
      setZoom(14);
    }
  }, [props.deviceLocation]);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const keywords = lowerQuery.split(/[\s,]+/).filter(Boolean);

    const newFiltered = props.properties.filter(p => {
        const operationMatch = p.tipo_operacao === activeTab;
        if (!operationMatch) return false;

        if (keywords.length > 0) {
            const propertyText = `${p.title} ${p.address} ${p.cidade || ''} ${p.description}`.toLowerCase();
            return keywords.every(keyword => propertyText.includes(keyword));
        }

        return true;
    });

    setFilteredProperties(newFiltered);
  }, [searchQuery, activeTab, props.properties]);
  
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
  };

  const onMarkerClick = useCallback((property: Property) => {
    setSelectedProperty(property);
    if(map) {
      map.panTo({ lat: property.lat, lng: property.lng });
    }
  }, [map]);

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
          setMapCenter({ lat, lng });
          setZoom(15);
        }
      }
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseUp = useCallback(() => {
    isResizingRef.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current || !mainContainerRef.current) return;
    const containerRect = mainContainerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;
    const minWidth = 320; // min width for list
    const maxWidth = containerRect.width - 320; // min width for map
    
    if (newWidth > minWidth && newWidth < maxWidth) {
      setListWidth(newWidth);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const renderMapContent = () => (
    <>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={zoom}
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
              <div className="w-48 p-1">
                <img src={selectedProperty.images?.[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'} alt={selectedProperty.title} className="w-full h-24 object-cover rounded mb-2" />
                <h3 className="font-bold text-sm mb-2 truncate">{selectedProperty.title}</h3>
                <div className="flex gap-2">
                    <button
                      onClick={() => props.onViewDetails(selectedProperty.id)}
                      className="w-full bg-brand-red text-white text-xs font-bold py-1.5 px-2 rounded hover:opacity-90"
                    >
                      {t('propertyCard.details')}
                    </button>
                    <button
                      onClick={() => props.onShare(selectedProperty.id)}
                      className="flex-shrink-0 bg-gray-200 hover:bg-gray-300 p-1.5 rounded"
                      aria-label="Compartilhar"
                    >
                        <ShareIcon className="w-4 h-4"/>
                    </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      ) : loadError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100"><p>Error loading maps</p></div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100"><SpinnerIcon className="w-12 h-12 animate-spin text-brand-gray" /></div>
      )}
    </>
  );

  return (
    <div className="h-screen flex flex-col bg-brand-light-gray">
      <Header {...props} />
      
      {/* Mobile Map Toggle & Container */}
      <div className="lg:hidden">
        <div className="p-4 bg-white border-b">
            <button 
                onClick={() => setIsMobileMapVisible(p => !p)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white border border-gray-300 text-brand-dark font-semibold hover:bg-gray-50 transition-colors"
            >
                <MapIcon className="w-5 h-5 text-brand-gray"/>
                <span>{isMobileMapVisible ? t('explorePage.hideMap') : t('explorePage.showMap')}</span>
            </button>
        </div>
        <div className={`
            relative transition-all duration-300 ease-in-out overflow-hidden
            ${isMobileMapVisible ? 'h-96' : 'h-0'}
        `}>
          {renderMapContent()}
        </div>
      </div>
      
      <div className="bg-white p-4 border-b shadow-sm">
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold text-brand-navy mb-4 text-center lg:text-left">{t('header.searchDropdown.buy.explore')}</h1>
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex border rounded-lg shadow-sm">
                    <button 
                      onClick={() => setActiveTab('venda')}
                      className={`px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-l-lg ${activeTab === 'venda' ? 'bg-brand-navy text-white' : 'bg-white text-brand-dark hover:bg-gray-50'}`}
                    >
                      {t('header.nav.buy')}
                    </button>
                    <button 
                      onClick={() => setActiveTab('aluguel')}
                      className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-l border-r ${activeTab === 'aluguel' ? 'bg-brand-navy text-white' : 'bg-white text-brand-dark hover:bg-gray-50'}`}
                    >
                      {t('header.nav.rent')}
                    </button>
                    <button 
                      onClick={() => setActiveTab('temporada')}
                      className={`px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-r-lg ${activeTab === 'temporada' ? 'bg-brand-navy text-white' : 'bg-white text-brand-dark hover:bg-gray-50'}`}
                    >
                      {t('header.nav.season')}
                    </button>
                </div>
                <form className="relative flex-grow" onSubmit={(e) => e.preventDefault()}>
                  <SearchIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10"/>
                  {isLoaded && (
                    <Autocomplete
                      onLoad={onAutocompleteLoad}
                      onPlaceChanged={onPlaceChanged}
                      options={{ componentRestrictions: { country: 'br' } }}
                    >
                      <input 
                        type="text" 
                        placeholder={t('hero.locationPlaceholder')}
                        className="w-full pl-12 pr-4 py-2.5 rounded-lg text-brand-dark border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                      />
                    </Autocomplete>
                  )}
                </form>
            </div>
        </div>
      </div>
      <main ref={mainContainerRef} className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        
        {/* List Container */}
        <div
          style={isDesktopView ? { width: listWidth } : {}}
          className="w-full lg:w-auto flex flex-col flex-shrink-0 h-full bg-white lg:border-r"
        >
          <div className="overflow-y-auto">
            <div className="p-4 space-y-4">
                <h2 className="text-lg font-bold text-brand-navy">{t('listings.foundTitle')} ({filteredProperties.length})</h2>
                {filteredProperties.length > 0 ? (
                    filteredProperties.map(p => (
                      <div key={p.id} className="cursor-pointer" onClick={() => onMarkerClick(p)}>
                        <PropertyCard property={p} onViewDetails={props.onViewDetails} onShare={props.onShare} />
                      </div>
                    ))
                ) : (
                    <div className="text-center py-10">
                        <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-brand-navy mb-2">{t('listings.noResults.title')}</h3>
                        <p className="text-brand-gray text-sm">{t('listings.noResults.description')}</p>
                    </div>
                )}
            </div>
          </div>
        </div>
        
        <div onMouseDown={handleMouseDown} className="w-2 cursor-col-resize bg-gray-200 hover:bg-brand-red transition-colors h-full flex-shrink-0 hidden lg:flex" />
        
        {/* Map Container */}
        <div className="flex-shrink-0 lg:flex-grow relative hidden lg:block">
          {renderMapContent()}
        </div>
      </main>
    </div>
  );
};

export default ExplorePage;