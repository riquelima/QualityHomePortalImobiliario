import React, { useEffect, useState, useRef } from 'react';
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

// Componente para lidar com o controle de desenho do Leaflet Draw
const DrawControl: React.FC<{ onDraw: (layer: any) => void }> = ({ onDraw }) => {
  const map = useMap();
  const drawControlRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !L.Control.Draw) return; // Defensive check

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    drawControlRef.current = new L.Control.Draw({
      position: 'topleft',
      draw: {
        polygon: false, marker: false, circlemarker: false, polyline: false, rectangle: false,
        circle: { shapeOptions: { color: '#D81B2B' } },
      },
      edit: { featureGroup: drawnItems, remove: false },
    });

    map.addControl(drawControlRef.current);
    
    map.on(L.Draw.Event.CREATED, (event: any) => {
      drawnItems.clearLayers();
      const layer = event.layer;
      drawnItems.addLayer(layer);
      onDraw(layer);
    });

    // Esconde a toolbar de desenho por padrão, será ativada por botão
    if (drawControlRef.current.getContainer()) {
      drawControlRef.current.getContainer().style.display = 'none';
    }

    return () => {
      if (drawControlRef.current && map) {
        map.removeControl(drawControlRef.current);
      }
      if (map && drawnItems && map.hasLayer(drawnItems)) {
        map.removeLayer(drawnItems);
      }
    };
  }, [map, onDraw]);
  
  // Função para ativar o desenho
  const startDrawing = () => {
    if (map && L?.Draw?.Circle && drawControlRef.current) {
        new L.Draw.Circle(map, drawControlRef.current.options.draw.circle).enable();
    }
  };
  
  (window as any).startDrawing = startDrawing;

  return null;
};


// Componente para atualizar a visão do mapa e limpar camadas
const MapUpdater: React.FC<{ 
  userLocation: { lat: number, lng: number } | null, 
  onPropertiesFound: (props: Property[]) => void 
}> = ({ userLocation, onPropertiesFound }) => {
  const map = useMap();
  const { t } = useLanguage();

  useEffect(() => {
    map.invalidateSize(); // Garante que o mapa se redimensione corretamente

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


const MapDrawPage: React.FC<MapDrawPageProps> = ({ onBack, userLocation }) => {
  const [propertiesInZone, setPropertiesInZone] = useState<Property[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useLanguage();
  const [isDrawReady, setIsDrawReady] = useState(false);

  // Efeito para verificar se a biblioteca Leaflet Draw está pronta
  useEffect(() => {
    // Se for busca por proximidade, não precisamos do Draw Control
    if (userLocation) {
      setIsDrawReady(true);
      return;
    }

    const interval = setInterval(() => {
      if (typeof L !== 'undefined' && L.Control && L.Control.Draw) {
        setIsDrawReady(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [userLocation]);


  const handleDraw = (layer: any) => {
    const drawnLatLng = layer.getLatLng();
    const drawnRadius = layer.getRadius();

    const foundProperties = MOCK_PROPERTIES.filter(prop => {
      const propLatLng = L.latLng(prop.lat, prop.lng);
      const distance = drawnLatLng.distanceTo(propLatLng);
      return distance <= drawnRadius;
    });

    setPropertiesInZone(foundProperties);
    setIsSidebarOpen(foundProperties.length > 0);
  };
  
  const handlePropertiesFound = (props: Property[]) => {
      setPropertiesInZone(props);
      setIsSidebarOpen(props.length > 0);
  }

  const handleDrawClick = () => {
    setPropertiesInZone([]);
    setIsSidebarOpen(false);
    // Chama a função global para iniciar o desenho
    if ((window as any).startDrawing) {
        (window as any).startDrawing();
    }
  };

  if (!isDrawReady) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
        <p className="text-brand-navy text-lg animate-pulse">{t('map.loading')}</p>
      </div>
    );
  }

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

        {!userLocation && isDrawReady && <DrawControl onDraw={handleDraw} />}
        
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
      
      {!userLocation && (
        <>
          <div className="absolute top-32 md:top-40 left-1/2 -translate-x-1/2 bg-white/90 p-4 rounded-lg shadow-md w-11/12 max-w-sm text-center z-[1000]">
            <p className="text-brand-navy">
              {t('map.drawInstruction')}
            </p>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
            <button
              onClick={handleDrawClick}
              className="bg-brand-red hover:opacity-90 text-white font-bold py-2 px-6 rounded-full shadow-2xl transition duration-300 flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
              </svg>
              <span>{t('map.drawButton')}</span>
            </button>
          </div>
        </>
      )}

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