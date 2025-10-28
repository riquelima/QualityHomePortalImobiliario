import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './Header';
import PropertyCard from './PropertyCard';
import type { Property } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useGestures } from '../hooks/useGestures';
import GestureIndicator from './GestureIndicator';
import SearchIcon from './icons/SearchIcon';
import { GoogleMap, Marker, InfoWindow, Autocomplete } from '@react-google-maps/api';
import { useGoogleMaps } from '../contexts/GoogleMapsContext';
import SpinnerIcon from './icons/SpinnerIcon';
import LoadingIndicator from './LoadingIndicator';
import MapIcon from './icons/MapIcon';
import ShareIcon from './icons/ShareIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ZoomInIcon from './icons/ZoomInIcon';
import ZoomOutIcon from './icons/ZoomOutIcon';

interface Filters {
  priceMin: string;
  priceMax: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  hasElevator: string;
  acceptsFinancing: string;
  allowsPets: string;
  availableDates: string[];
  minDays: string;
  maxGuests: string;
}

interface ExplorePageProps {
  onBack: () => void;
  properties: Property[];
  onViewDetails: (id: number) => void;
  onShare: (id: number) => void;
  onSearchSubmit: (query: string) => void;
  onGeolocationError: () => void;
  deviceLocation: { lat: number; lng: number } | null;
  initialOperation?: 'venda' | 'aluguel' | 'temporada';
  loadMoreProperties: () => Promise<void>;
  hasMoreProperties: boolean;
  isLoadingMore: boolean;
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
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    bathrooms: '',
    propertyType: '',
    hasElevator: '',
    acceptsFinancing: '',
    allowsPets: '',
    availableDates: [],
    minDays: '',
    maxGuests: ''
  });
  const [map, setMap] = useState<any | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [autocomplete, setAutocomplete] = useState<any | null>(null);
  
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>(
    props.deviceLocation || {lat: -12.9777, lng: -38.5016 }
  );
  const [zoom, setZoom] = useState(props.deviceLocation ? 14 : 13);
  
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('list');
  
  const listContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 6;

  // Configurar pull-to-refresh
  const { bindGestures, gestureState } = useGestures({
    enablePullToRefresh: true,
    pullToRefreshThreshold: 80,
    onPullToRefresh: () => {
      // Simular atualização da aplicação
      window.location.reload();
    },
    excludeSelectors: [
      '[data-testid="google-map"]', // Container do Google Maps
      '.gm-style', // Classe padrão do Google Maps
      '.gm-style *', // Todos os elementos filhos do Google Maps
      '.pac-container', // Container do autocomplete do Google Maps
      '.pac-container *', // Elementos filhos do autocomplete
    ],
  });

  const { isLoaded, loadError } = useGoogleMaps();
  
  const onLoad = useCallback(function callback(mapInstance: any) {
    // Otimizações para performance mobile
    mapInstance.setOptions({
      disableDefaultUI: window.innerWidth < 768, // Remove UI no mobile
      gestureHandling: 'cooperative', // Melhora gestos no mobile
      maxZoom: 18,
      minZoom: 10,
      restriction: {
        latLngBounds: {
          north: -8.0,
          south: -18.0,
          west: -48.0,
          east: -34.0,
        },
      },
    });
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  useEffect(() => {
    if (props.deviceLocation) {
      setMapCenter(props.deviceLocation);
      setZoom(14);
    }
  }, [props.deviceLocation]);

  // Configurar gestos no container principal
  useEffect(() => {
    if (containerRef.current) {
      bindGestures(containerRef.current);
    }
  }, [bindGestures]);

  // Função para filtrar propriedades por tipo de operação
  const filterProperties = useCallback((properties: Property[], operation: string, query: string) => {
    // console.log('=== FILTRANDO PROPRIEDADES ===');
    // console.log('Total de propriedades:', properties.length);
    // console.log('Operação desejada:', operation);
    // console.log('Query de busca:', query);

    const lowerQuery = query.toLowerCase();
    const keywords = lowerQuery.split(/[\s,]+/).filter(Boolean);

    const filtered = properties.filter(p => {
        // 1. Verificar se a propriedade tem coordenadas válidas para o mapa
        const hasValidCoords = (p.latitude && p.longitude) || (p.lat && p.lng);
        if (!hasValidCoords) {
          // console.warn('❌ Propriedade sem coordenadas válidas:', p.id, p.title || p.titulo);
          return false;
        }

        // 2. Verificar se a propriedade está ativa
        if (p.status && p.status !== 'ativo') {
          // console.warn('❌ Propriedade inativa:', p.id, p.status);
          return false;
        }

        // 3. FILTRO PRINCIPAL: Verificar tipo de operação
        let operationMatch = false;
        const propertyOperation = p.tipo_operacao;
        
        if (propertyOperation) {
          // Comparação exata do tipo de operação
          operationMatch = propertyOperation === operation;
        } else {
          // Se não tem campo de operação, só considera para venda
          operationMatch = operation === 'venda';
        }
        
        if (!operationMatch) {
          return false;
        }

        // 4. Filtrar por busca de texto se houver
        if (keywords.length > 0) {
            const propertyText = `${p.title || p.titulo || ''} ${p.address || p.endereco_completo || ''} ${p.cidade || ''} ${p.description || p.descricao || ''}`.toLowerCase();
            const matches = keywords.every(keyword => propertyText.includes(keyword));
            if (!matches) {
              return false;
            }
        }

        return true;
    });

    // console.log('=== RESULTADO DA FILTRAGEM ===');
    // console.log(`Propriedades filtradas: ${filtered.length} de ${properties.length}`);
    // console.log('Operação:', operation);
    // console.log('================================');

    return filtered;
  }, []);

  // Efeito principal para filtrar propriedades
  useEffect(() => {
    if (props.properties.length > 0) {
      const filtered = filterProperties(props.properties, activeTab, searchQuery);
      setFilteredProperties(filtered);
      
      // Reset do scroll infinito
      const initialItems = filtered.slice(0, ITEMS_PER_PAGE);
      setDisplayedProperties(initialItems);
      setHasMore(filtered.length > ITEMS_PER_PAGE);
    } else {
      setFilteredProperties([]);
      setDisplayedProperties([]);
      setHasMore(false);
    }
  }, [props.properties, activeTab, searchQuery, filterProperties]);

  // Efeito para garantir inicialização
  useEffect(() => {
    if (props.properties.length > 0 && filteredProperties.length === 0 && searchQuery === '') {
      // console.log('🚀 Forçando inicialização - tentando carregar propriedades para:', activeTab);
      const defaultFiltered = filterProperties(props.properties, activeTab, '');
      
      if (defaultFiltered.length > 0) {
        setFilteredProperties(defaultFiltered);
        const initialItems = defaultFiltered.slice(0, ITEMS_PER_PAGE);
        setDisplayedProperties(initialItems);
        setHasMore(defaultFiltered.length > ITEMS_PER_PAGE);
        // console.log('✅ Propriedades carregadas para', activeTab, ':', defaultFiltered.length);
      } else {
        // console.log('⚠️ Nenhuma propriedade encontrada para', activeTab);
      }
    }
  }, [props.properties, filteredProperties.length, searchQuery, activeTab, filterProperties]);

  // Função para carregar mais itens
  const loadMoreItems = useCallback(async () => {
    if (props.isLoadingMore || !hasMore) return;
    
    // Se ainda há itens locais para mostrar, mostra eles primeiro
    const currentLength = displayedProperties.length;
    const nextItems = filteredProperties.slice(currentLength, currentLength + ITEMS_PER_PAGE);
    
    if (nextItems.length > 0) {
      setDisplayedProperties(prev => [...prev, ...nextItems]);
      setHasMore(currentLength + nextItems.length < filteredProperties.length || props.hasMoreProperties);
    } else if (props.hasMoreProperties) {
      // Se não há mais itens locais, carrega mais do servidor
      try {
        await props.loadMoreProperties();
      } catch (error) {
        console.error('Erro ao carregar mais propriedades:', error);
      }
    }
  }, [displayedProperties.length, filteredProperties, hasMore, props]);

  // Scroll infinito com debounce para melhor performance
  useEffect(() => {
    const container = listContainerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;
    let lastScrollTime = 0;

    const handleScroll = () => {
      const now = Date.now();
      
      // Throttle: limita a frequência de execução
      if (now - lastScrollTime < 100) return;
      lastScrollTime = now;

      // Debounce: só executa após parar de fazer scroll
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 150;
        
        if (isNearBottom && hasMore && !props.isLoadingMore) {
          loadMoreItems();
        }
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [hasMore, props.isLoadingMore, loadMoreItems]);
  
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
  };

  const onMarkerClick = useCallback((property: Property) => {
    setSelectedProperty(property);
    if(map) {
      const lat = property.lat || property.latitude;
      const lng = property.lng || property.longitude;
      // Usar requestAnimationFrame para suavizar animações
      requestAnimationFrame(() => {
        map.panTo({ lat, lng });
        map.setZoom(16);
      });
    }
  }, [map]);

  const onInfoWindowClose = useCallback(() => {
    setSelectedProperty(null);
  }, []);

  // Funções de zoom customizadas
  const handleZoomIn = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom();
      map.setZoom(Math.min(currentZoom + 1, 18));
    }
  }, [map]);

  const handleZoomOut = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom();
      map.setZoom(Math.max(currentZoom - 1, 10));
    }
  }, [map]);
  
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
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceMin: '',
      priceMax: '',
      bedrooms: '',
      bathrooms: '',
      propertyType: '',
      hasElevator: '',
      acceptsFinancing: '',
      allowsPets: '',
      availableDates: [],
      minDays: '',
      maxGuests: ''
    });
  };

  // Textos atrativos para cada operação
  const getOperationText = () => {
    switch (activeTab) {
      case 'venda':
        return 'Encontre o imóvel dos seus sonhos para comprar';
      case 'aluguel':
        return 'Descubra o lar perfeito para alugar';
      case 'temporada':
        return 'Explore opções incríveis para suas férias';
      default:
        return 'Encontre o imóvel ideal';
    }
  };

  const renderFilters = () => (
    <div className={`bg-white border-t transition-all duration-300 ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          
          {/* Filtros Comuns */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Preço Mínimo</label>
            <input
              type="number"
              placeholder="R$ 0"
              value={filters.priceMin}
              onChange={(e) => handleFilterChange('priceMin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-100 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Preço Máximo</label>
            <input
              type="number"
              placeholder="R$ 999.999.999"
              value={filters.priceMax}
              onChange={(e) => handleFilterChange('priceMax', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-100 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Quartos (mín.)</label>
            <select
              value={filters.bedrooms}
              onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-100 text-sm"
            >
              <option value="">Qualquer</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Banheiros (mín.)</label>
            <select
              value={filters.bathrooms}
              onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-100 text-sm"
            >
              <option value="">Qualquer</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tipo de Imóvel</label>
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-100 text-sm"
            >
              <option value="">Todos</option>
              <option value="Casa">Casa</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Área">Área</option>
              <option value="Sítio">Sítio</option>
              <option value="Fazenda">Fazenda</option>
              <option value="Escritório">Escritório</option>
              <option value="Galpão">Galpão</option>
            </select>
          </div>

          {/* Filtros específicos para Venda */}
          {activeTab === 'venda' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Elevador</label>
                <select
                  value={filters.hasElevator}
                  onChange={(e) => handleFilterChange('hasElevator', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-100 text-sm"
                >
                  <option value="">Indiferente</option>
                  <option value="true">Com elevador</option>
                  <option value="false">Sem elevador</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Financiamento</label>
                <select
                  value={filters.acceptsFinancing}
                  onChange={(e) => handleFilterChange('acceptsFinancing', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-100 text-sm"
                >
                  <option value="">Indiferente</option>
                  <option value="true">Aceita financiamento</option>
                  <option value="false">Não aceita financiamento</option>
                </select>
              </div>
            </>
          )}

          {/* Filtros específicos para Aluguel */}
          {activeTab === 'aluguel' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Animais</label>
              <select
                value={filters.allowsPets}
                onChange={(e) => handleFilterChange('allowsPets', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-100 text-sm"
              >
                <option value="">Indiferente</option>
                <option value="true">Permite animais</option>
                <option value="false">Não permite animais</option>
              </select>
            </div>
          )}

          {/* Filtros específicos para Temporada */}
          {activeTab === 'temporada' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Mínimo de Diárias
                </label>
                <input
                  type="number"
                  placeholder="Ex: 3"
                  value={filters.minDays}
                  onChange={(e) => handleFilterChange('minDays', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-100 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Máximo de Hóspedes</label>
                <input
                  type="number"
                  placeholder="Ex: 6"
                  value={filters.maxGuests}
                  onChange={(e) => handleFilterChange('maxGuests', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-100 text-sm"
                />
              </div>
            </>
          )}
        </div>

        {/* Botão para limpar filtros */}
        <div className="flex justify-end mt-4">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Limpar filtros
          </button>
        </div>
      </div>
    </div>
  );

  const renderMapContent = () => (
    <>
      {isLoaded ? (
        <div data-testid="google-map" style={{ width: '100%', height: '100%' }}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              zoomControl: false,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
              scrollwheel: true,
              gestureHandling: 'greedy',
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }]
                }
              ]
            }}
        >
          {/* Limitar marcadores para melhor performance - máximo 50 no mobile, 100 no desktop */}
          {filteredProperties.slice(0, window.innerWidth < 768 ? 50 : 100).map(property => {
            const lat = property.lat || property.latitude;
            const lng = property.lng || property.longitude;
            
            if (!lat || !lng) {
              console.warn('Propriedade sem coordenadas válidas para o mapa:', property.id);
              return null;
            }

            return (
              <Marker
                key={property.id}
                position={{ lat: Number(lat), lng: Number(lng) }}
                onClick={() => onMarkerClick(property)}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="24" height="30" viewBox="0 0 24 30" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0C5.372 0 0 5.372 0 12c0 12 12 18 12 18s12-6 12-18C24 5.372 18.628 0 12 0z" fill="#EA4335"/>
                      <circle cx="12" cy="12" r="6" fill="#FFFFFF"/>
                      <circle cx="12" cy="12" r="3" fill="#EA4335"/>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(24, 30), // Marcadores menores para mobile
                  anchor: new window.google.maps.Point(12, 30)
                }}
              />
            );
          })}
          {selectedProperty && (
            <InfoWindow
              position={{ 
                lat: Number(selectedProperty.lat || selectedProperty.latitude), 
                lng: Number(selectedProperty.lng || selectedProperty.longitude)
              }}
              onCloseClick={onInfoWindowClose}
              options={{
                pixelOffset: new window.google.maps.Size(0, -40)
              }}
            >
              <div className="max-w-sm bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Imagem do imóvel */}
                <div className="relative h-32">
                  <img 
                    src={selectedProperty.images?.[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'} 
                    alt={selectedProperty.title || selectedProperty.titulo}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                    {selectedProperty.tipo_operacao || selectedProperty.operation_type || 'Venda'}
                  </div>
                </div>
                
                {/* Conteúdo */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {selectedProperty.title || selectedProperty.titulo}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {selectedProperty.address || selectedProperty.endereco_completo}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xl font-bold text-red-600">
                      {typeof (selectedProperty.price || selectedProperty.preco) === 'number'
                        ? new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(selectedProperty.price || selectedProperty.preco)
                        : 'Preço a consultar'}
                    </p>
                    {((selectedProperty.tipo_operacao === 'aluguel' || selectedProperty.operation_type === 'aluguel')) && (
                      <span className="text-sm text-gray-500">/mês</span>
                    )}
                  </div>
                  
                  {/* Características */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                      </svg>
                      {selectedProperty.bedrooms || selectedProperty.quartos} quartos
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      {selectedProperty.bathrooms || selectedProperty.banheiros} banheiros
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      {selectedProperty.area || selectedProperty.area_bruta}m²
                    </div>
                  </div>
                  
                  {/* Botões de ação */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        props.onViewDetails(selectedProperty.id);
                        setSelectedProperty(null);
                      }}
                      className="flex-1 bg-blue-900 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-800 transition-colors text-sm"
                    >
                      Ver detalhes
                    </button>
                    <button
                      onClick={() => {
                        props.onShare(selectedProperty.id);
                        setSelectedProperty(null);
                      }}
                      className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                      aria-label="Compartilhar"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
        
        {/* Botões de Zoom Customizados */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-lg shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl"
            aria-label="Zoom In"
            title="Aumentar zoom"
          >
            <ZoomInIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-lg shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl"
            aria-label="Zoom Out"
            title="Diminuir zoom"
          >
            <ZoomOutIcon className="w-5 h-5" />
          </button>
        </div>
        </div>
      ) : loadError ? (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <p className="text-gray-500">Erro ao carregar o mapa</p>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <SpinnerIcon className="w-8 h-8 text-blue-900 animate-spin" />
        </div>
      )}
    </>
  );

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-gray-50 relative">
      {/* Pull to Refresh Indicator */}
      {gestureState.isDragging && gestureState.pullDistance > 0 && (
        <div 
          className="absolute top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 transition-all duration-200"
          style={{ 
            transform: `translateY(${Math.min(gestureState.pullDistance - 80, 0)}px)`,
            opacity: gestureState.pullDistance / 80 
          }}
        >
          {gestureState.pullDistance >= 80 ? (
            <div className="flex items-center justify-center gap-2">
              <SpinnerIcon className="w-4 h-4 animate-spin" />
              <span>Solte para atualizar</span>
            </div>
          ) : (
            <span>Puxe para atualizar</span>
          )}
        </div>
      )}
      
      {/* Refresh Loading Indicator */}
      {gestureState.isRefreshing && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-3">
          <div className="flex items-center justify-center gap-2">
            <SpinnerIcon className="w-4 h-4 animate-spin" />
            <span>Atualizando...</span>
          </div>
        </div>
      )}
      
      <Header {...props} />
      
      {/* Search and Filters Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-6 text-center">
            Explorar bairros e preços
          </h1>
          
          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 rounded-xl p-1">
              {(['venda', 'aluguel', 'temporada'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    // console.log('🔄 Mudando aba para:', tab);
                    setActiveTab(tab);
                  }}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ${
                    activeTab === tab
                      ? tab === 'aluguel' 
                        ? 'bg-blue-900 text-white'
                        : 'bg-red-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'venda' ? 'Comprar' : tab === 'aluguel' ? 'Alugar' : 'Temporada'}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-4">
            <div className="relative">
              <SearchIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10"/>
              {isLoaded && (
                <Autocomplete
                  onLoad={onAutocompleteLoad}
                  onPlaceChanged={onPlaceChanged}
                  options={{ componentRestrictions: { country: 'br' } }}
                >
                  <input 
                    type="text" 
                    placeholder="Digite a cidade, bairro ou endereço"
                    className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl border-2 border-gray-200 focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all duration-300 text-gray-700 placeholder-gray-400"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                  />
                </Autocomplete>
              )}
            </div>
          </div>

          {/* Controls Row - View Mode Toggles and Filters */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-4">
              {/* View Mode Toggle - Mobile/Tablet */}
              <div className="flex lg:hidden">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    Lista
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    Mapa
                  </button>
                </div>
              </div>

              {/* View Mode Toggle - Desktop */}
              <div className="hidden lg:flex">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    Apenas Lista
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'split' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    Lista + Mapa
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    Apenas Mapa
                  </button>
                </div>
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {renderFilters()}

      {/* Texto atrativo para cada operação */}
      <div className="bg-white border-b px-4 py-3">
        <div className="container mx-auto">
          <h2 className="text-lg font-semibold text-gray-700 text-center">
            {getOperationText()}
          </h2>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* List View */}
        {(viewMode === 'list' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'lg:w-1/2' : 'w-full'} bg-white flex flex-col`}>
            <div 
              ref={listContainerRef}
              className="flex-1 overflow-y-auto pb-20"
              style={{ height: 'calc(100vh - 280px)' }}
            >
              {displayedProperties.length > 0 ? (
                <div className="p-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {displayedProperties.map(property => (
                    <div 
                      key={property.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow duration-300 rounded-2xl overflow-hidden"
                      onClick={() => onMarkerClick(property)}
                    >
                      <PropertyCard 
                        property={property} 
                        onViewDetails={props.onViewDetails} 
                        onShare={props.onShare} 
                      />
                    </div>
                  ))}
                  
                  {/* Loading indicator */}
                  {props.isLoadingMore && (
                    <LoadingIndicator type="loadMore" size="medium" />
                  )}
                  
                  {/* End message */}
                  {!hasMore && !props.hasMoreProperties && displayedProperties.length > 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Todos os imóveis foram carregados
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <SearchIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Nenhum imóvel encontrado para {activeTab}
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    Tente selecionar outro tipo de operação ou ajustar os filtros de busca.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map View */}
        {(viewMode === 'map' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'lg:w-1/2' : 'w-full'} ${viewMode === 'map' ? 'h-screen lg:h-auto' : 'h-96 lg:h-auto'} lg:flex-1`}>
            {renderMapContent()}
          </div>
        )}

        {/* Rodapé seguindo o layout da tela inicial */}
        <footer className="absolute bottom-0 left-0 right-0 bg-white text-gray-600 py-4 text-center z-10 border-t">
          <div className="container mx-auto px-4 sm:px-6">
            <p>&copy; {new Date().getFullYear()} Quallity Home Portal Imobiliário</p>
            <div className="mt-2 flex justify-center items-center space-x-4">
              <a 
                href="https://www.instagram.com/portalimobiliarioquallityhome/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Siga-nos no Instagram" 
                className="inline-block hover:opacity-75 transition-opacity"
              >
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/3621/3621435.png" 
                  alt="Instagram" 
                  className="h-6 w-6" 
                />
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Indicadores de Gestos */}
      <GestureIndicator
        type="pull-refresh"
        isActive={gestureState.activeGesture === 'pull-refresh'}
        progress={gestureState.swipeProgress}
      />
    </div>
  );
};

export default ExplorePage;