
import React, { useEffect, useRef, useState } from 'react';
import { MOCK_PROPERTIES } from './PropertyListings';
import type { Property } from '../types';
import PropertyCard from './PropertyCard';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import { useLanguage } from '../contexts/LanguageContext';

// Declaração para informar ao TypeScript sobre a variável global L do Leaflet
declare const L: any;

interface MapDrawPageProps {
  onBack: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

const MapDrawPage: React.FC<MapDrawPageProps> = ({ onBack, userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const drawControlRef = useRef<any>(null);
  const drawnItemsRef = useRef<any>(null);
  const propertyMarkersRef = useRef<any>(null);
  
  const [propertiesInZone, setPropertiesInZone] = useState<Property[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const { t } = useLanguage();

  // Efeito para configuração única e inicialização do mapa
  useEffect(() => {
    if (mapInstance.current || !mapRef.current) {
        return; // Garante que a inicialização ocorra apenas uma vez
    }

    try {
        // 1. Inicializa o mapa base
        const map = L.map(mapRef.current, {
            zoomControl: false,
            scrollWheelZoom: true,
        }).setView([-12.9777, -38.5016], 13);
        mapInstance.current = map;

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // 2. Configura as camadas de desenho e marcadores
        drawnItemsRef.current = new L.FeatureGroup();
        map.addLayer(drawnItemsRef.current);

        propertyMarkersRef.current = L.layerGroup();
        map.addLayer(propertyMarkersRef.current);
        
        // 3. Configura o controle de desenho
        drawControlRef.current = new L.Control.Draw({
            position: 'topleft', // Posição não importa, pois será ocultado
            draw: {
                polygon: false, marker: false, circlemarker: false, polyline: false, rectangle: false,
                circle: { shapeOptions: { color: '#D81B2B' } },
            },
            edit: { featureGroup: drawnItemsRef.current, remove: false }
        });
        
        // 4. Adiciona o listener para quando uma área é desenhada
        map.on(L.Draw.Event.CREATED, (event: any) => {
            const layer = event.layer;
            const drawnLatLng = layer.getLatLng();
            const drawnRadius = layer.getRadius();

            drawnItemsRef.current.clearLayers();
            drawnItemsRef.current.addLayer(layer);
            
            const foundProperties = MOCK_PROPERTIES.filter(prop => {
                const propLatLng = L.latLng(prop.lat, prop.lng);
                const distance = drawnLatLng.distanceTo(propLatLng);
                return distance <= drawnRadius;
            });

            setPropertiesInZone(foundProperties);
            setIsSidebarOpen(foundProperties.length > 0);

            propertyMarkersRef.current.clearLayers();
            foundProperties.forEach(prop => {
                L.marker([prop.lat, prop.lng])
                    .addTo(propertyMarkersRef.current)
                    .bindPopup(`<b>${prop.title}</b><br>${prop.address}`);
            });
        });

        // 5. Finaliza e marca o mapa como pronto
        map.invalidateSize();
        setIsMapReady(true);

    } catch (error) {
        console.error("Falha ao inicializar o mapa:", error);
    }
    
    // Função de limpeza ao desmontar o componente
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []); // Array de dependências vazio para rodar apenas uma vez

  // Efeito para ATUALIZAR o estado do mapa (desenho vs. proximidade)
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) {
      return;
    }
    
    const map = mapInstance.current;
    
    // Limpa camadas de estados anteriores
    propertyMarkersRef.current.clearLayers();
    drawnItemsRef.current.clearLayers();
    map.eachLayer((layer: any) => {
        if (layer.options && layer.options.fillColor === '#4285F4') {
            map.removeLayer(layer);
        }
    });

    if (userLocation) {
        // --- Modo de Busca por Proximidade ---
        if (drawControlRef.current._map) {
            map.removeControl(drawControlRef.current);
        }

        map.setView([userLocation.lat, userLocation.lng], 14);
        
        L.circleMarker([userLocation.lat, userLocation.lng], {
          radius: 8, fillColor: '#4285F4', color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.9
        }).addTo(map).bindPopup(t('map.userLocationPopup')).openPopup();

        const searchRadius = 5000; // 5km
        const userLatLng = L.latLng(userLocation.lat, userLocation.lng);
        const foundProperties = MOCK_PROPERTIES
          .map(prop => ({ ...prop, distance: userLatLng.distanceTo(L.latLng(prop.lat, prop.lng)) }))
          .filter(prop => prop.distance <= searchRadius)
          .sort((a, b) => a.distance - b.distance);

        setPropertiesInZone(foundProperties);
        setIsSidebarOpen(foundProperties.length > 0);
        foundProperties.forEach(prop => {
            L.marker([prop.lat, prop.lng])
                .addTo(propertyMarkersRef.current)
                .bindPopup(`<b>${prop.title}</b><br>${prop.address}`);
        });

    } else {
        // --- Modo de Desenhar no Mapa ---
        if (!drawControlRef.current._map) {
            map.addControl(drawControlRef.current);
        }
        
        if(drawControlRef.current.getContainer()) {
          drawControlRef.current.getContainer().style.display = 'none';
        }

        map.setView([-12.9777, -38.5016], 13);
        setPropertiesInZone([]);
        setIsSidebarOpen(false);
    }

  }, [isMapReady, userLocation, t]);

  const handleDrawClick = () => {
    if (drawnItemsRef.current) drawnItemsRef.current.clearLayers();
    if (propertyMarkersRef.current) propertyMarkersRef.current.clearLayers();

    setPropertiesInZone([]);
    setIsSidebarOpen(false);
    
    if (mapInstance.current && L?.Draw?.Circle) {
        new L.Draw.Circle(mapInstance.current, drawControlRef.current.options.draw.circle).enable();
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[100]">
      <div ref={mapRef} className="w-full h-full" />
      
      {!isMapReady && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[1200]">
          <p className="text-brand-navy text-lg font-semibold animate-pulse">{t('map.loading')}</p>
        </div>
      )}

      {isMapReady && (
        <>
          <div className="absolute top-0 left-0 w-full p-4 md:p-6 z-[1000] bg-gradient-to-b from-white/80 to-transparent">
             <div className="container mx-auto">
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
        </>
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
