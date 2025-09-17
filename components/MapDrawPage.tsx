
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import { MOCK_PROPERTIES } from './PropertyListings';
import type { Property } from '../types';
import PropertyCard from './PropertyCard';
import { useLanguage } from '../contexts/LanguageContext';
import DrawIcon from './icons/DrawIcon';
import CloseIcon from './icons/CloseIcon';

interface MapDrawPageProps {
  onBack: () => void;
  userLocation?: { lat: number; lng: number } | null;
  onViewDetails: (id: number) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}

// Interface for properties with a calculated distance for sorting
interface PropertyWithDistance extends Property {
  distance: number;
}

// Componente para atualizar a visão do mapa e limpar camadas
const MapUpdater: React.FC<{ 
  userLocation: { lat: number, lng: number } | null, 
  onPropertiesFound: (props: PropertyWithDistance[]) => void 
}> = ({ userLocation, onPropertiesFound }) => {
  const map = useMap();
  const { t } = useLanguage();

  useEffect(() => {
    map.invalidateSize(); 

    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 14);
      const searchRadius = 5000; // 5km
      const userLatLng = L.latLng(userLocation.lat, userLocation.lng);
      const foundProperties: PropertyWithDistance[] = MOCK_PROPERTIES
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

// Componente para gerenciar a lógica de desenho do Leaflet
const DrawingManager: React.FC<{
    onDrawCreated: (layer: L.Layer) => void;
    drawingState: 'idle' | 'drawing' | 'drawn';
    setDrawingState: (state: 'idle' | 'drawing' | 'drawn') => void;
    featureGroupRef: React.MutableRefObject<L.FeatureGroup | null>;
}> = ({ onDrawCreated, drawingState, setDrawingState, featureGroupRef }) => {
    const map = useMap();
    const drawHandlerRef = useRef<L.Draw.Circle | null>(null);
    const isDrawingCancelledRef = useRef(true);

    // Configura o feature group e o listener de criação
    useEffect(() => {
        if (!featureGroupRef.current) {
            featureGroupRef.current = new L.FeatureGroup();
            map.addLayer(featureGroupRef.current);
        }

        const handleCreated = (e: any) => {
            isDrawingCancelledRef.current = false;
            onDrawCreated(e.layer);
        };
        
        map.on(L.Draw.Event.CREATED, handleCreated);

        return () => {
            map.off(L.Draw.Event.CREATED, handleCreated);
        };
    }, [map, onDrawCreated, featureGroupRef]);

    // Gerencia o processo de desenho com base no estado
    useEffect(() => {
        if (drawingState === 'drawing') {
            isDrawingCancelledRef.current = true; // Reseta para a nova sessão de desenho

            // FIX: Cast map to 'any' to resolve TypeScript error with leaflet-draw.
            // The useMap() hook from react-leaflet returns a type that is not fully
            // compatible with the type expected by leaflet-draw's constructor.
            const newDrawHandler = new L.Draw.Circle(map as any, {
                shapeOptions: {
                    color: '#D81B2B',
                    fillColor: '#D81B2B',
                    fillOpacity: 0.2,
                },
                showRadius: false,
                metric: true,
            });
            drawHandlerRef.current = newDrawHandler;
            newDrawHandler.enable();

            const onDrawStop = () => {
                if (isDrawingCancelledRef.current) {
                    setDrawingState('idle'); // Foi um cancelamento
                }
            };

            map.on('draw:drawstop', onDrawStop);

            return () => {
                map.off('draw:drawstop', onDrawStop);
                if (drawHandlerRef.current && drawHandlerRef.current.enabled()) {
                    drawHandlerRef.current.disable();
                }
            };
        } else if (drawHandlerRef.current && drawHandlerRef.current.enabled()) {
            drawHandlerRef.current.disable();
        }
    }, [drawingState, map, setDrawingState]);

    return null;
};


const MapDrawPage: React.FC<MapDrawPageProps> = ({ onBack, userLocation, onViewDetails, favorites, onToggleFavorite }) => {
  const [propertiesInZone, setPropertiesInZone] = useState<PropertyWithDistance[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useLanguage();
  const [drawingState, setDrawingState] = useState<'idle' | 'drawing' | 'drawn'>('idle');
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);

  const handleDrawCreated = useCallback((layer: L.Layer) => {
    if (featureGroupRef.current) {
        featureGroupRef.current.clearLayers();
        featureGroupRef.current.addLayer(layer);
    }
    
    if (layer instanceof L.Circle) {
        const drawnLatLng = layer.getLatLng();
        const drawnRadius = layer.getRadius();

        const foundProperties = MOCK_PROPERTIES.filter(prop => {
            const propLatLng = L.latLng(prop.lat, prop.lng);
            const distance = drawnLatLng.distanceTo(propLatLng);
            return distance <= drawnRadius;
        });

        const foundPropertiesWithDistance = foundProperties.map(prop => {
          const propLatLng = L.latLng(prop.lat, prop.lng);
          return { ...prop, distance: drawnLatLng.distanceTo(propLatLng) };
        }).sort((a, b) => a.distance - b.distance);

        setPropertiesInZone(foundPropertiesWithDistance);
        setIsSidebarOpen(foundProperties.length > 0);
        setDrawingState('drawn');
    } else {
        setDrawingState('idle');
    }
  }, []);

  const handleClearDrawing = useCallback(() => {
      if(featureGroupRef.current) {
        featureGroupRef.current.clearLayers();
      }
      setPropertiesInZone([]);
      setIsSidebarOpen(false);
      setDrawingState('idle');
  }, []);
  
  const handlePropertiesFound = useCallback((props: PropertyWithDistance[]) => {
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
        
        {!userLocation && (
          <DrawingManager
            onDrawCreated={handleDrawCreated}
            drawingState={drawingState}
            setDrawingState={setDrawingState}
            featureGroupRef={featureGroupRef}
          />
        )}
        
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
            {drawingState === 'idle' && (
                <button
                    onClick={() => setDrawingState('drawing')}
                    className="bg-brand-red hover:opacity-90 text-white font-bold py-3 px-6 rounded-full shadow-2xl transition duration-300 flex items-center space-x-2"
                >
                    <DrawIcon className="w-5 h-5" />
                    <span>{t('map.drawButton')}</span>
                </button>
            )}
            {drawingState === 'drawing' && (
                <div className="bg-white text-brand-dark font-bold py-3 px-6 rounded-full shadow-2xl animate-pulse">
                    <span>{t('map.drawingInProgress')}</span>
                </div>
            )}
            {drawingState === 'drawn' && (
                <button
                    onClick={handleClearDrawing}
                    className="bg-brand-dark hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full shadow-2xl transition duration-300 flex items-center space-x-2"
                >
                    <CloseIcon className="w-5 h-5"/>
                    <span>{t('map.clearButton')}</span>
                </button>
            )}
        </div>
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
                    <h3 className="text-xl font-bold text-brand-navy">
                        {userLocation 
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
                            isFavorite={favorites.includes(prop.id)}
                            onToggleFavorite={onToggleFavorite}
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
