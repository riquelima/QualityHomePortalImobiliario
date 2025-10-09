import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle, DrawingManager } from '@react-google-maps/api';
import type { Property } from '../types';
import PropertyCard from './PropertyCard';
import { useLanguage } from '../contexts/LanguageContext';
import DrawIcon from './icons/DrawIcon';
import CloseIcon from './icons/CloseIcon';
import SpinnerIcon from './icons/SpinnerIcon';


interface MapDrawPageProps {
  onBack: () => void;
  userLocation?: { lat: number; lng: number } | null;
  onViewDetails: (id: number) => void;
  onShare: (id: number) => void;
  properties: Property[];
  initialMapMode?: 'draw' | 'proximity';
}

interface PropertyWithDistance extends Property {
  distance: number;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const libraries: ('drawing' | 'places' | 'visualization')[] = ['drawing', 'places', 'visualization'];

const MapDrawPage: React.FC<MapDrawPageProps> = ({ onBack, userLocation, onViewDetails, onShare, properties, initialMapMode = 'proximity' }) => {
  const { t } = useLanguage();
  const [map, setMap] = useState<any | null>(null);
  const [propertiesInZone, setPropertiesInZone] = useState<PropertyWithDistance[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDrawing, setIsDrawing] = useState(initialMapMode === 'draw');
  const [drawnCircle, setDrawnCircle] = useState<{center: any, radius: number} | null>(null);
  
  const [mapCenter, setMapCenter] = useState(userLocation || { lat: -12.9777, lng: -38.5016 });
  const [zoom, setZoom] = useState(userLocation ? (initialMapMode === 'proximity' ? 14 : 13) : 13);


  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDukeY7JJI9UkHIFbsCZOrjPDRukqvUOfA',
    libraries,
  });

  const onLoad = useCallback(function callback(mapInstance: any) {
    setMap(mapInstance);
  }, []);

  useEffect(() => {
    if (userLocation) {
        setMapCenter(userLocation);
        setZoom(initialMapMode === 'proximity' ? 14 : 13);
    }
  }, [userLocation, initialMapMode]);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const onMarkerClick = useCallback((property: Property) => {
    setSelectedProperty(property);
    if (map) {
      map.panTo({ lat: property.lat, lng: property.lng });
    }
  }, [map]);

  useEffect(() => {
    if (isLoaded && userLocation && initialMapMode === 'proximity' && (window as any).google?.maps?.geometry) {
      const searchRadius = 5000; // 5km
      const userLatLng = new (window as any).google.maps.LatLng(userLocation.lat, userLocation.lng);
      
      const foundProperties: PropertyWithDistance[] = properties
        .map(prop => {
          const propLatLng = new (window as any).google.maps.LatLng(prop.lat, prop.lng);
          const distance = (window as any).google.maps.geometry.spherical.computeDistanceBetween(userLatLng, propLatLng);
          return { ...prop, distance };
        })
        .filter(prop => prop.distance <= searchRadius)
        .sort((a, b) => a.distance - b.distance);
      
      setPropertiesInZone(foundProperties);
      setIsSidebarOpen(foundProperties.length > 0);
    }
  }, [isLoaded, userLocation, properties, initialMapMode]);
  
  const onCircleComplete = (circle: any) => {
    const radius = circle.getRadius();
    const center = circle.getCenter();
    setIsDrawing(false);

    if (center && radius && (window as any).google?.maps?.geometry) {
      setDrawnCircle({ center: center.toJSON(), radius });
      const foundProperties: PropertyWithDistance[] = properties.map(prop => {
        const propLatLng = new (window as any).google.maps.LatLng(prop.lat, prop.lng);
        const distance = (window as any).google.maps.geometry.spherical.computeDistanceBetween(center, propLatLng);
        return { ...prop, distance };
      }).filter(prop => prop.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
        
      setPropertiesInZone(foundProperties);
      setIsSidebarOpen(foundProperties.length > 0);
    }
    circle.setMap(null);
  };
  
  const handleStartDrawing = () => {
    handleClearDrawing();
    setIsDrawing(true);
  }

  const handleClearDrawing = useCallback(() => {
    setDrawnCircle(null);
    setPropertiesInZone([]);
    setIsSidebarOpen(false);
    setIsDrawing(false);
  }, []);

  const renderMap = () => {
    if (loadError) return <div className="w-full h-full flex items-center justify-center bg-gray-100"><p>Error loading maps</p></div>;
    if (!isLoaded) return <div className="w-full h-full flex items-center justify-center bg-gray-100"><SpinnerIcon className="w-12 h-12 animate-spin text-brand-gray" /></div>;

    return (
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
        onClick={() => setSelectedProperty(null)}
      >
        {properties.map(prop => (
          <Marker 
            key={prop.id} 
            position={{ lat: prop.lat, lng: prop.lng }}
            onClick={() => onMarkerClick(prop)}
          />
        ))}

        {userLocation && <Marker position={userLocation} icon={{ path: (window as any).google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#4285F4', fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 }} />}
        
        {isDrawing && (
          <DrawingManager
            onCircleComplete={onCircleComplete}
            options={{
              drawingControl: true,
              drawingControlOptions: {
                position: (window as any).google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [(window as any).google.maps.drawing.OverlayType.CIRCLE],
              },
              drawingMode: (window as any).google.maps.drawing.OverlayType.CIRCLE,
              circleOptions: {
                fillColor: '#D81B2B',
                fillOpacity: 0.2,
                strokeColor: '#D81B2B',
                strokeWeight: 2,
                clickable: false,
                editable: false,
                zIndex: 1,
              },
            }}
          />
        )}
        
        {drawnCircle && (
          <Circle
            center={drawnCircle.center}
            radius={drawnCircle.radius}
            options={{
              fillColor: '#D81B2B',
              fillOpacity: 0.2,
              strokeColor: '#D81B2B',
              strokeWeight: 2,
            }}
          />
        )}
      </GoogleMap>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-[100]">
      {renderMap()}

      <div className="absolute top-0 left-0 w-full p-4 md:p-6 z-10 bg-gradient-to-b from-white/80 to-transparent pointer-events-none">
         <div className="container mx-auto pointer-events-auto">
            <div className="text-sm mb-4">
                <span onClick={onBack} className="text-brand-red hover:underline cursor-pointer">{t('map.breadcrumbs.home')}</span>
                <span className="text-brand-gray mx-2">&gt;</span>
                <span className="text-brand-dark font-medium">{initialMapMode === 'proximity' ? t('map.breadcrumbs.proximitySearch') : t('map.breadcrumbs.drawOnMap')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy">
              {initialMapMode === 'proximity' ? t('map.title.proximity') : t('map.title.draw')}
            </h1>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          {!isDrawing && !drawnCircle && (
              <button
                  onClick={handleStartDrawing}
                  className="bg-brand-red hover:opacity-90 text-white font-bold py-3 px-6 rounded-full shadow-2xl transition duration-300 flex items-center space-x-2"
              >
                  <DrawIcon className="w-5 h-5" />
                  <span>{t('map.drawButton')}</span>
              </button>
          )}
          {isDrawing && (
              <div className="bg-white text-brand-dark font-bold py-3 px-6 rounded-full shadow-2xl animate-pulse">
                  <span>{t('map.drawingInProgress')}</span>
              </div>
          )}
          {drawnCircle && (
              <button
                  onClick={handleClearDrawing}
                  className="bg-brand-dark hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full shadow-2xl transition duration-300 flex items-center space-x-2"
              >
                  <CloseIcon className="w-5 h-5"/>
                  <span>{t('map.clearButton')}</span>
              </button>
          )}
      </div>
      
      {initialMapMode === 'proximity' && propertiesInZone.length > 0 && !selectedProperty && (
        <div className="absolute bottom-8 right-4 z-10">
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="bg-brand-navy hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-full shadow-2xl transition duration-300"
          >
            {isSidebarOpen ? t('map.toggleResults.hide') : t('map.toggleResults.show', { count: propertiesInZone.length })}
          </button>
        </div>
      )}
      
      {selectedProperty && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-10 page-fade-in">
          <div className="relative">
            <PropertyCard
              key={selectedProperty.id}
              property={selectedProperty}
              onViewDetails={onViewDetails}
              onShare={onShare}
            />
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedProperty(null); }}
              className="absolute -top-2 -right-2 bg-white p-1 rounded-full text-brand-dark shadow-lg hover:bg-gray-200 transition-all duration-200 z-20"
              aria-label="Close property details"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}


      {isSidebarOpen && (
          <div 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-black/30 z-[1050] transition-opacity duration-300"
          />
      )}

      <aside className={`
        fixed md:absolute bottom-0 left-0 right-0 md:top-0 md:left-auto
        h-2/3 md:h-full w-full md:max-w-md 
        bg-white shadow-2xl z-[1100] rounded-t-2xl md:rounded-t-none
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen 
          ? 'translate-y-0 md:translate-x-0' 
          : 'translate-y-full md:translate-y-0 md:translate-x-full'
        }`}>
        <div className="h-full flex flex-col">
            <div className="p-4 border-b flex-shrink-0">
                <div className="md:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-2 cursor-grab" />
                <div className="flex justify-between items-center">
                    <h3 className="text-lg sm:text-xl font-bold text-brand-navy">
                        {initialMapMode === 'proximity'
                            ? t('map.resultsPanel.proximityTitle', { count: propertiesInZone.length, radius: 5 })
                            : t('map.resultsPanel.title', { count: propertiesInZone.length })
                        }
                    </h3>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-2xl text-brand-gray hover:text-brand-dark">&times;</button>
                </div>
            </div>
            <div className="overflow-y-auto p-4 flex-grow">
                <div className="space-y-4">
                {propertiesInZone.length > 0 ? (
                    propertiesInZone.map(prop => (
                        <PropertyCard 
                            key={prop.id} 
                            property={prop} 
                            onViewDetails={onViewDetails}
                            onShare={onShare}
                        />
                    ))
                ) : (
                    <div className="text-center text-brand-gray mt-8">
                        <p>{t('map.resultsPanel.noResults.line1')}</p>
                        <p>{t('map.resultsPanel.noResults.line2')}</p>
                    </div>
                )}
                </div>
            </div>
        </div>
      </aside>
    </div>
  );
};

export default MapDrawPage;