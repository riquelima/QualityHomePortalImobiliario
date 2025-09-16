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
  const propertyMarkersRef = useRef<any>(null); // Ref para a camada de marcadores de imóveis
  
  const [propertiesInZone, setPropertiesInZone] = useState<Property[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      // Inicializa o mapa
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false // Desativa o controle de zoom padrão
      }).setView([-13.29, -41.71], 7); // Centralizado na Bahia

      // Adiciona a camada de tiles do OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);
      
      // Adiciona controle de zoom na posição inferior direita
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

      // Camada para os itens desenhados
      drawnItemsRef.current = new L.FeatureGroup();
      mapInstance.current.addLayer(drawnItemsRef.current);

      // Camada para os marcadores de imóveis
      propertyMarkersRef.current = L.layerGroup();
      mapInstance.current.addLayer(propertyMarkersRef.current);

      // Configuração do controle de desenho (desabilitado por padrão)
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
          remove: true
        }
      });
      mapInstance.current.addControl(drawControlRef.current);

      // Evento disparado ao criar um desenho
      mapInstance.current.on(L.Draw.Event.CREATED, (event: any) => {
        const layer = event.layer;
        const drawnLatLng = layer.getLatLng();
        const drawnRadius = layer.getRadius();

        drawnItemsRef.current.clearLayers(); // Limpa desenhos anteriores
        drawnItemsRef.current.addLayer(layer);
        
        // Filtra os imóveis que estão dentro do círculo desenhado
        const foundProperties = MOCK_PROPERTIES.filter(prop => {
          const propLatLng = L.latLng(prop.lat, prop.lng);
          const distance = drawnLatLng.distanceTo(propLatLng);
          return distance <= drawnRadius;
        });

        setPropertiesInZone(foundProperties);
        setIsSidebarOpen(foundProperties.length > 0);

        // Adiciona marcadores para os imóveis encontrados
        propertyMarkersRef.current.clearLayers();
        if (foundProperties.length > 0) {
            foundProperties.forEach(prop => {
                L.marker([prop.lat, prop.lng])
                    .addTo(propertyMarkersRef.current)
                    .bindPopup(`<b>${prop.title}</b><br>${prop.address}`);
            });
        }
      });
      
      // Evento disparado ao remover desenhos
      mapInstance.current.on(L.Draw.Event.DELETED, () => {
        setPropertiesInZone([]);
        setIsSidebarOpen(false);
        propertyMarkersRef.current.clearLayers(); // Limpa marcadores também
      });
    }

    // Cleanup
    return () => {
      // Comentado para evitar que o mapa seja destruído em re-renders no modo de desenvolvimento do React
      // if (mapInstance.current) {
      //   mapInstance.current.remove();
      //   mapInstance.current = null;
      // }
    };
  }, []);

  const handleDrawClick = () => {
    // Ativa a ferramenta de desenho de círculo programaticamente
    new L.Draw.Circle(mapInstance.current, drawControlRef.current.options.draw.circle).enable();
  };

  return (
    <div className="fixed inset-0 bg-white z-[100]">
      <div ref={mapRef} className="w-full h-full" />

      {/* Header com botão de voltar */}
      <header className="absolute top-0 left-0 p-4 z-10">
        <button 
          onClick={onBack} 
          className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Voltar para a página inicial"
        >
          <ArrowLeftIcon className="w-6 h-6 text-brand-dark" />
        </button>
      </header>

      {/* Caixa de instrução */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 p-4 rounded-lg shadow-md max-w-sm text-center z-10">
        <p className="text-brand-navy">
          Move o mapa para localizar a área que te interessa antes de desenhar a zona onde procuras
        </p>
      </div>

      {/* Botão para desenhar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={handleDrawClick}
          className="bg-brand-red hover:opacity-90 text-white font-bold py-3 px-8 rounded-full shadow-2xl transition duration-300"
        >
          Desenhar a tua zona
        </button>
      </div>

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