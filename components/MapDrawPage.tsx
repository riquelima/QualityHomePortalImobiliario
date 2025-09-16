import React, { useEffect, useRef, useState } from 'react';
import { MOCK_PROPERTIES } from './PropertyListings';
import type { Property } from '../types';
import PropertyCard from './PropertyCard';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

// Declaração para informar ao TypeScript sobre a variável global L do Leaflet
declare const L: any;

interface MapDrawPageProps {
  onBack: () => void;
}

const MapDrawPage: React.FC<MapDrawPageProps> = ({ onBack }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const drawControlRef = useRef<any>(null);
  const drawnItemsRef = useRef<any>(null);
  const propertyMarkersRef = useRef<any>(null);
  
  const [propertiesInZone, setPropertiesInZone] = useState<Property[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    const intervalId = setInterval(() => {
      // Verifica se L e L.Control.Draw estão definidos no objeto window
      if (typeof L !== 'undefined' && L.Control && L.Control.Draw) {
        clearInterval(intervalId);

        if (mapInstance.current) return; // Evita re-inicialização

        mapInstance.current = L.map(mapRef.current, {
          zoomControl: false
        }).setView([-13.29, -41.71], 7);

        // Usando o tile layer da CARTO (Positron) para um visual mais limpo
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(mapInstance.current);
        
        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

        drawnItemsRef.current = new L.FeatureGroup();
        mapInstance.current.addLayer(drawnItemsRef.current);

        propertyMarkersRef.current = L.layerGroup();
        mapInstance.current.addLayer(propertyMarkersRef.current);

        // Escondendo a barra de ferramentas de desenho padrão
        drawControlRef.current = new L.Control.Draw({
          position: 'bottomleft',
          draw: {
            polygon: false,
            marker: false,
            circlemarker: false,
            polyline: false,
            rectangle: false,
            circle: {
              shapeOptions: {
                color: '#D81B2B'
              }
            },
          },
          edit: {
            featureGroup: drawnItemsRef.current,
            remove: false // Desabilitar a edição por padrão
          }
        });
        mapInstance.current.addControl(drawControlRef.current);
        // Oculta o controle de desenho da interface
        drawControlRef.current.getContainer().style.display = 'none';

        mapInstance.current.on(L.Draw.Event.CREATED, (event: any) => {
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
          if (foundProperties.length > 0) {
              foundProperties.forEach(prop => {
                  L.marker([prop.lat, prop.lng])
                      .addTo(propertyMarkersRef.current)
                      .bindPopup(`<b>${prop.title}</b><br>${prop.address}`);
              });
          }
        });
        
        setIsMapReady(true);
      }
    }, 100); // Verifica a cada 100ms

    return () => {
      clearInterval(intervalId);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const handleDrawClick = () => {
    if (mapInstance.current && L && L.Draw && L.Draw.Circle) {
        new L.Draw.Circle(mapInstance.current, drawControlRef.current.options.draw.circle).enable();
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[100]">
      <div ref={mapRef} className="w-full h-full" />
      
      {!isMapReady && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <p className="text-brand-navy text-lg font-semibold animate-pulse">Carregando mapa...</p>
        </div>
      )}

      {isMapReady && (
        <>
          {/* Header com breadcrumbs e título */}
          <div className="absolute top-0 left-0 w-full p-6 z-10 bg-gradient-to-b from-white/80 to-transparent">
             <div className="container mx-auto">
                <div className="text-sm mb-4">
                    <span onClick={onBack} className="text-brand-red hover:underline cursor-pointer">Início</span>
                    <span className="text-brand-gray mx-2">&gt;</span>
                    <span className="text-brand-dark font-medium">Desenhar no mapa</span>
                </div>
                <h1 className="text-4xl font-bold text-brand-navy">Desenhe a sua pesquisa na Bahia</h1>
            </div>
          </div>

          {/* Caixa de instrução */}
          <div className="absolute top-40 left-1/2 -translate-x-1/2 bg-white/90 p-4 rounded-lg shadow-md max-w-sm text-center z-10">
            <p className="text-brand-navy">
              Move o mapa para localizar a área que te interessa antes de desenhar a zona onde procuras
            </p>
          </div>

          {/* Botão para desenhar */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={handleDrawClick}
              className="bg-brand-red hover:opacity-90 text-white font-bold py-3 px-8 rounded-full shadow-2xl transition duration-300 flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
              </svg>
              <span>Desenhar a tua zona</span>
            </button>
          </div>
        </>
      )}

      {/* Painel lateral de resultados */}
      <aside className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-20 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-navy">{propertiesInZone.length} imóveis encontrados</h3>
                <button onClick={() => setIsSidebarOpen(false)} className="text-2xl text-brand-gray hover:text-brand-dark">&times;</button>
            </div>
            <div className="overflow-y-auto p-4 flex-grow">
                <div className="space-y-4">
                {propertiesInZone.length > 0 ? (
                    propertiesInZone.map(prop => (
                        <PropertyCard key={prop.id} property={prop} />
                    ))
                ) : (
                    <div className="text-center text-brand-gray mt-8">
                        <p>Nenhum imóvel encontrado nesta área.</p>
                        <p>Tente desenhar uma área maior ou em outra localização.</p>
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
