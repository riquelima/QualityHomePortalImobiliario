import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import PropertyListings from './PropertyListings';
import type { Property, User, Profile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import SearchIcon from './icons/SearchIcon';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';

// This component will handle adding the draw control to the map
const DrawControl: React.FC<{ 
  onShapeDrawn: (layer: L.Layer) => void, 
  onShapeDeleted: () => void 
}> = ({ onShapeDrawn, onShapeDeleted }) => {
    const map = useMap();
    const drawnItems = React.useRef<L.FeatureGroup>(new L.FeatureGroup());

    useEffect(() => {
        map.addLayer(drawnItems.current);
        const drawControl = new L.Control.Draw({
            edit: {
                featureGroup: drawnItems.current,
                remove: true,
            },
            draw: {
                polygon: { allowIntersection: false, shapeOptions: { color: '#D81B2B' } },
                rectangle: { shapeOptions: { color: '#D81B2B' } },
                circle: { shapeOptions: { color: '#D81B2B' } },
                polyline: false,
                marker: false,
                circlemarker: false,
            }
        });
        map.addControl(drawControl);

        const handleCreated = (e: any) => {
            const layer = e.layer;
            drawnItems.current.clearLayers();
            drawnItems.current.addLayer(layer);
            onShapeDrawn(layer);
        };

        const handleDeleted = () => {
            onShapeDeleted();
        };
        
        const handleEdited = (e: any) => {
            e.layers.eachLayer((layer: L.Layer) => {
                onShapeDrawn(layer);
            });
        };

        map.on(L.Draw.Event.CREATED, handleCreated);
        map.on(L.Draw.Event.EDITED, handleEdited);
        map.on(L.Draw.Event.DELETED, handleDeleted);

        return () => {
            map.off(L.Draw.Event.CREATED, handleCreated);
            map.off(L.Draw.Event.EDITED, handleEdited);
            map.off(L.Draw.Event.DELETED, handleDeleted);
            if (map && map.hasLayer(drawnItems.current)) {
                map.removeLayer(drawnItems.current);
            }
            if (map && (drawControl as any)._map) {
                 map.removeControl(drawControl);
            }
        };
    }, [map, onShapeDrawn, onShapeDeleted]);

    return null;
};

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
  const [mapCenter, setMapCenter] = useState<[number, number]>([-12.9777, -38.5016]); // Default to Salvador
  const [isLoadingGeo, setIsLoadingGeo] = useState(true);
  const [drawnShape, setDrawnShape] = useState<L.Layer | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            setMapCenter([latitude, longitude]);
            setIsLoadingGeo(false);
        },
        (error) => {
            // Gracefully handle geolocation errors without showing a modal.
            // The map will default to Salvador's coordinates.
            console.error("Falha ao obter geolocalização, usando localização padrão:", error);
            setIsLoadingGeo(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);
  
  const handleShapeDrawn = useCallback((layer: L.Layer) => {
      setDrawnShape(layer);
  }, []);

  const handleShapeDeleted = useCallback(() => {
      setDrawnShape(null);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const filteredProperties = props.properties.filter(p => {
    const matchesSearch = searchQuery.trim()
        ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.address.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

    if (!matchesSearch) return false;

    if (drawnShape) {
        const point = L.latLng(p.lat, p.lng);
        if (drawnShape instanceof L.Circle) {
            return drawnShape.getLatLng().distanceTo(point) <= drawnShape.getRadius();
        }
        if (drawnShape instanceof L.Rectangle || drawnShape instanceof L.Polygon) {
            return drawnShape.getBounds().contains(point);
        }
    }

    return true;
  });

  return (
    <div className="bg-brand-light-gray min-h-screen flex flex-col">
      <Header {...props} />
      <main className="flex-grow">
        <section className="bg-white py-12">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <img src="https://i.imgur.com/FuxDdyF.png" alt="Quality Home Logo" className="h-24 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">{t('header.searchDropdown.buy.explore')}</h1>
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
              <div className="relative">
                <SearchIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('hero.locationPlaceholder')}
                  className="w-full px-12 py-3 rounded-full text-brand-dark border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
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
                        <DrawControl onShapeDrawn={handleShapeDrawn} onShapeDeleted={handleShapeDeleted} />
                        {props.properties.map(property => (
                            <Marker key={property.id} position={[property.lat, property.lng]}>
                                <Popup>
                                    <div className="w-48">
                                        <h3 className="font-bold text-base mb-1 truncate">{property.title}</h3>
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