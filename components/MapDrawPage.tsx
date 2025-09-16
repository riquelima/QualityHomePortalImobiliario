import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import { MOCK_PROPERTIES } from './PropertyListings';
import type { Property } from '../types';
import PropertyCard from './PropertyCard';
import { useLanguage } from '../contexts/LanguageContext';

declare const L: any;

interface MapDrawPageProps {
  onBack: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

// Componente para atualizar a visão do mapa e limpar camadas
const MapUpdater: React.FC<{ 
  userLocation: { lat: number, lng: number } | null, 
  onPropertiesFound: (props: Property[]) => void 
}> = ({ userLocation, onPropertiesFound }) => {
  const map = useMap();
  const { t } = useLanguage();

  useEffect(() => {
    map.invalidateSize(); 

    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 14);
      const searchRadius = 5000; // 5km
      const userLatLng = L.latLng(userLocation.lat, userLocation.lng);
      const foundProperties = MOCK_PROPERTIES
        .map(prop => ({ ...prop, distance: userLatLng.distanceTo(L.latLng(prop.lat, prop.lng)) }))
        .filter(prop => prop.distance <= searchRadius)
        .sort((a, b) => a.distance - b.distance);
      onPropertiesFound(foundProperties);
    } else {
      map.setView([-12.9777, -38.5016], 13);
      onPropertiesFound([]);
    }
  }, [userLocation, map, onPropertiesFound, t]);

  return null;
};

// Wrapper customizado para o controle de desenho do Leaflet
const DrawControl = ({ onCreated, onDeleted }: { onCreated: (e: any) => void, onDeleted: () => void }) => {
  const map = useMap();
  
  // Refs to hold the Leaflet instances, preventing them from being recreated on re-renders
  // FIX: Initialize useRef with null to satisfy a strict linting rule expecting an argument.
  const drawControlRef = useRef<any>(null);
  // FIX: Initialize useRef with null to satisfy a strict linting rule expecting an argument.
  const featureGroupRef = useRef<any>(null);

  // Effect to create and remove the control. Runs only once when the map is available.
  useEffect(() => {
    if (!map || typeof L.Control.Draw === 'undefined') {
      return;
    }

    // Create the feature group for drawn items
    featureGroupRef.current = new L.FeatureGroup();
    map.addLayer(featureGroupRef.current);

    // Create the draw control
    drawControlRef.current = new L.Control.Draw({
      position: 'topleft', // CSS will move this container to 'bottomcenter'
      edit: {
        featureGroup: featureGroupRef.current,
        edit: false,
        remove: true,
      },
      draw: {
        rectangle: false,
        polygon: false,
        circlemarker: false,
        marker: false,
        polyline: false,
        circle: {
          shapeOptions: {
            color: '#D81B2B',
          },
        },
      },
    });
    map.addControl(drawControlRef.current);

    // Cleanup function for when the component unmounts
    return () => {
      if (map) {
         if (drawControlRef.current) {
            map.removeControl(drawControlRef.current);
            drawControlRef.current = null;
         }
         if (featureGroupRef.current && map.hasLayer(featureGroupRef.current)) {
            map.removeLayer(featureGroupRef.current);
            featureGroupRef.current = null;
         }
      }
    };
  }, [map]); // This effect depends only on the map instance.

  // Effect to handle the drawing events.
  useEffect(() => {
    if (!map) {
      return;
    }

    const handleCreated = (e: any) => {
      if (featureGroupRef.current) {
        featureGroupRef.current.clearLayers();
        featureGroupRef.current.addLayer(e.layer);
      }
      onCreated(e);
    };

    const handleDeleted = () => {
      onDeleted();
    };

    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.DELETED, handleDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.DELETED, handleDeleted);
    };
  }, [map, onCreated, onDeleted]); // This re-binds events if handlers change.

  return null;
};


const MapDrawPage: React.FC<MapDrawPageProps> = ({ onBack, userLocation }) => {
  const [propertiesInZone, setPropertiesInZone] = useState<Property[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDrawPluginLoaded, setIsDrawPluginLoaded] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const checkDrawPlugin = () => 
        typeof window !== 'undefined' && 
        window.L && 
        window.L.Control && 
        window.L.Control.Draw;

    if (checkDrawPlugin()) {
      setIsDrawPluginLoaded(true);
      return;
    }
    
    const interval = setInterval(() => {
      if (checkDrawPlugin()) {
        setIsDrawPluginLoaded(true);
        clearInterval(interval);
      }
    }, 100); // Poll every 100ms

    const timeout = setTimeout(() => {
        clearInterval(interval);
        if (!checkDrawPlugin()){
            console.error("Leaflet Draw plugin failed to load after 5 seconds.");
        }
    }, 5000);

    return () => {
        clearInterval(interval);
        clearTimeout(timeout);
    };
  }, []);

  const handleDrawCreated = useCallback((e: any) => {
    const layer = e.layer;
    
    if (layer.getLatLng && layer.getRadius) { // Verifica se é um círculo
        const drawnLatLng = layer.getLatLng();
        const drawnRadius = layer.getRadius();

        const foundProperties = MOCK_PROPERTIES.filter(prop => {
        const propLatLng = L.latLng(prop.lat, prop.lng);
        const distance = drawnLatLng.distanceTo(propLatLng);
        return distance <= drawnRadius;
        });

        setPropertiesInZone(foundProperties);
        setIsSidebarOpen(foundProperties.length > 0);
    }
  }, []);

  const handleDrawDeleted = useCallback(() => {
      setPropertiesInZone([]);
      setIsSidebarOpen(false);
  }, []);
  
  const handlePropertiesFound = useCallback((props: Property[]) => {
      setPropertiesInZone(props);
      setIsSidebarOpen(props.length > 0);
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-[100]">
      <MapContainer 
        center={userLocation ? [userLocation.lat, userLocation.lng] : [-12.9777, -38.5016]} 
        zoom={13} 
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        placeholder={<div className="w-full h-full flex items-center justify-center bg-gray-100"><p>{t('map.loading')}</p></div>}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapUpdater userLocation={userLocation} onPropertiesFound={handlePropertiesFound} />
        
        {isDrawPluginLoaded && !userLocation && <DrawControl onCreated={handleDrawCreated} onDeleted={handleDrawDeleted} />}
        
        {propertiesInZone.map(prop => (
          <Marker key={prop.id} position={[prop.lat, prop.lng]}>
            <Popup>
              <b>{prop.title}</b><br/>{prop.address}
            </Popup>
          </Marker>
        ))}

        {userLocation && (
            <CircleMarker 
                center={[userLocation.lat, userLocation.lng]}
                radius={8}
                pathOptions={{ fillColor: '#4285F4', color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.9 }}
            >
                 <Popup>{t('map.userLocationPopup')}</Popup>
            </CircleMarker>
        )}
        
      </MapContainer>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-4 md:p-6 z-[1000] bg-gradient-to-b from-white/80 to-transparent pointer-events-none">
         <div className="container mx-auto pointer-events-auto">
            <div className="text-sm mb-4">
                <span onClick={onBack} className="text-brand-red hover:underline cursor-pointer">{t('map.breadcrumbs.home')}</span>
                <span className="text-brand-gray mx-2">&gt;</span>
                <span className="text-brand-dark font-medium">{userLocation ? t('map.breadcrumbs.proximitySearch') : t('map.breadcrumbs.drawOnMap')}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-brand-navy">
              {userLocation ? t('map.title.proximity') : t('map.title.draw')}
            </h1>
        </div>
      </div>
      
      {userLocation && propertiesInZone.length > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="bg-brand-navy hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-full shadow-2xl transition duration-300"
          >
            {isSidebarOpen ? t('map.toggleResults.hide') : t('map.toggleResults.show', { count: propertiesInZone.length })}
          </button>
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
                    <h3 className="text-xl font-bold text-brand-navy">{t('map.resultsPanel.title', { count: propertiesInZone.length })}</h3>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-2xl text-brand-gray hover:text-brand-dark">&times;</button>
                </div>
            </div>
            <div className="overflow-y-auto p-4 flex-grow">
                <div className="space-y-4">
                {propertiesInZone.length > 0 ? (
                    propertiesInZone.map(prop => (
                        <PropertyCard key={prop.id} property={prop} />
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