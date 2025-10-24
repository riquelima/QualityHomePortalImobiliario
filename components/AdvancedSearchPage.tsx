import React, { useState, useEffect } from 'react';
import Header from './Header';
import PropertyCard from './PropertyCard';
import type { Property } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import SearchIcon from './icons/SearchIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import LoadingIndicator from './LoadingIndicator';

interface AdvancedFilters {
  // Filtros básicos
  searchQuery: string;
  operation: 'venda' | 'aluguel' | 'temporada';
  priceMin: string;
  priceMax: string;
  
  // Características do imóvel
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  areaMin: string;
  areaMax: string;
  
  // Localização
  city: string;
  neighborhood: string;
  
  // Filtros específicos para venda
  hasElevator: string;
  acceptsFinancing: string;
  condominiumFeeMax: string;
  
  // Filtros específicos para aluguel
  allowsPets: string;
  furnished: string;
  
  // Filtros específicos para temporada
  minDays: string;
  maxGuests: string;
  hasPool: string;
  hasWifi: string;
  
  // Filtros adicionais
  hasGarage: string;
  hasGarden: string;
  hasBalcony: string;
  isAccessible: string;
}

interface AdvancedSearchPageProps {
  onBack: () => void;
  properties: Property[];
  onViewDetails: (id: number) => void;
  onShare: (id: number) => void;
  onSearchSubmit: (query: string) => void;
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

const AdvancedSearchPage: React.FC<AdvancedSearchPageProps> = (props) => {
  const { t } = useLanguage();
  
  const [filters, setFilters] = useState<AdvancedFilters>({
    searchQuery: '',
    operation: 'venda',
    priceMin: '',
    priceMax: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    areaMin: '',
    areaMax: '',
    city: '',
    neighborhood: '',
    hasElevator: '',
    acceptsFinancing: '',
    condominiumFeeMax: '',
    allowsPets: '',
    furnished: '',
    minDays: '',
    maxGuests: '',
    hasPool: '',
    hasWifi: '',
    hasGarage: '',
    hasGarden: '',
    hasBalcony: '',
    isAccessible: ''
  });

  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    property: false,
    location: false,
    specific: false,
    additional: false
  });

  const handleFilterChange = (key: keyof AdvancedFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      operation: 'venda',
      priceMin: '',
      priceMax: '',
      propertyType: '',
      bedrooms: '',
      bathrooms: '',
      areaMin: '',
      areaMax: '',
      city: '',
      neighborhood: '',
      hasElevator: '',
      acceptsFinancing: '',
      condominiumFeeMax: '',
      allowsPets: '',
      furnished: '',
      minDays: '',
      maxGuests: '',
      hasPool: '',
      hasWifi: '',
      hasGarage: '',
      hasGarden: '',
      hasBalcony: '',
      isAccessible: ''
    });
  };

  const applyFilters = () => {
    setIsSearching(true);
    
    const filtered = props.properties.filter(property => {
      // Filtro por operação
      if (property.tipo_operacao !== filters.operation) return false;
      
      // Filtro por busca de texto
      if (filters.searchQuery) {
        const searchText = filters.searchQuery.toLowerCase();
        const propertyText = `${property.titulo || ''} ${property.endereco_completo || ''} ${property.cidade || ''} ${property.descricao || ''}`.toLowerCase();
        if (!propertyText.includes(searchText)) return false;
      }
      
      // Filtro por preço
      if (filters.priceMin && property.preco < parseFloat(filters.priceMin)) return false;
      if (filters.priceMax && property.preco > parseFloat(filters.priceMax)) return false;
      
      // Filtro por tipo de imóvel
      if (filters.propertyType && property.tipo_imovel !== filters.propertyType) return false;
      
      // Filtro por quartos
      if (filters.bedrooms && property.quartos && property.quartos < parseInt(filters.bedrooms)) return false;
      
      // Filtro por banheiros
      if (filters.bathrooms && property.banheiros && property.banheiros < parseInt(filters.bathrooms)) return false;
      
      // Filtro por área
      if (filters.areaMin && property.area_util && property.area_util < parseFloat(filters.areaMin)) return false;
      if (filters.areaMax && property.area_util && property.area_util > parseFloat(filters.areaMax)) return false;
      
      // Filtro por cidade
      if (filters.city && property.cidade && !property.cidade.toLowerCase().includes(filters.city.toLowerCase())) return false;
      
      // Filtros específicos para venda
      if (filters.operation === 'venda') {
        if (filters.hasElevator && property.possui_elevador !== (filters.hasElevator === 'true')) return false;
        if (filters.acceptsFinancing && property.aceita_financiamento !== (filters.acceptsFinancing === 'true')) return false;
        if (filters.condominiumFeeMax && property.taxa_condominio && property.taxa_condominio > parseFloat(filters.condominiumFeeMax)) return false;
      }
      
      // Filtros específicos para aluguel
      if (filters.operation === 'aluguel') {
        if (filters.allowsPets && property.permite_animais !== (filters.allowsPets === 'true')) return false;
      }
      
      // Filtros específicos para temporada
      if (filters.operation === 'temporada') {
        if (filters.minDays && property.minimo_diarias && property.minimo_diarias > parseInt(filters.minDays)) return false;
        if (filters.maxGuests && property.maximo_hospedes && property.maximo_hospedes < parseInt(filters.maxGuests)) return false;
      }
      
      return true;
    });
    
    setFilteredProperties(filtered);
    setIsSearching(false);
  };

  useEffect(() => {
    applyFilters();
  }, [props.properties, filters.operation]);

  const renderFilterSection = (title: string, sectionKey: keyof typeof expandedSections, children: React.ReactNode) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <ChevronDownIcon 
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            expandedSections[sectionKey] ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      {expandedSections[sectionKey] && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );

  const renderInput = (label: string, value: string, onChange: (value: string) => void, type = 'text', placeholder = '') => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-100 text-sm"
      />
    </div>
  );

  const renderSelect = (label: string, value: string, onChange: (value: string) => void, options: { value: string; label: string }[]) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-100 text-sm"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        navigateHome={props.navigateHome}
        onNavigateToBuy={props.onNavigateToBuy}
        onNavigateToRent={props.onNavigateToRent}
        onNavigateToSeason={props.onNavigateToSeason}
        navigateToGuideToSell={props.navigateToGuideToSell}
        navigateToDocumentsForSale={props.navigateToDocumentsForSale}
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* Título da página */}
        <div className="mb-6">
          <button
            onClick={props.onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Busca Avançada</h1>
          <p className="text-gray-600">Use os filtros abaixo para encontrar exatamente o que você procura</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filtros */}
          <div className="lg:col-span-2">
            {/* Filtros Básicos */}
            {renderFilterSection('Filtros Básicos', 'basic', (
              <>
                <div className="sm:col-span-2 lg:col-span-3">
                  {renderInput(
                    'Buscar por palavra-chave',
                    filters.searchQuery,
                    (value) => handleFilterChange('searchQuery', value),
                    'text',
                    'Ex: apartamento, casa, centro...'
                  )}
                </div>
                
                {renderSelect(
                  'Tipo de Operação',
                  filters.operation,
                  (value) => handleFilterChange('operation', value as 'venda' | 'aluguel' | 'temporada'),
                  [
                    { value: 'venda', label: 'Comprar' },
                    { value: 'aluguel', label: 'Alugar' },
                    { value: 'temporada', label: 'Temporada' }
                  ]
                )}
                
                {renderInput(
                  'Preço Mínimo (R$)',
                  filters.priceMin,
                  (value) => handleFilterChange('priceMin', value),
                  'number',
                  '0'
                )}
                
                {renderInput(
                  'Preço Máximo (R$)',
                  filters.priceMax,
                  (value) => handleFilterChange('priceMax', value),
                  'number',
                  '999999999'
                )}
              </>
            ))}

            {/* Características do Imóvel */}
            {renderFilterSection('Características do Imóvel', 'property', (
              <>
                {renderSelect(
                  'Tipo de Imóvel',
                  filters.propertyType,
                  (value) => handleFilterChange('propertyType', value),
                  [
                    { value: '', label: 'Todos' },
                    { value: 'Casa', label: 'Casa' },
                    { value: 'Apartamento', label: 'Apartamento' },
                    { value: 'Área', label: 'Área' },
                    { value: 'Sítio', label: 'Sítio' },
                    { value: 'Fazenda', label: 'Fazenda' },
                    { value: 'Escritório', label: 'Escritório' },
                    { value: 'Galpão', label: 'Galpão' }
                  ]
                )}
                
                {renderSelect(
                  'Quartos (mínimo)',
                  filters.bedrooms,
                  (value) => handleFilterChange('bedrooms', value),
                  [
                    { value: '', label: 'Qualquer' },
                    { value: '1', label: '1+' },
                    { value: '2', label: '2+' },
                    { value: '3', label: '3+' },
                    { value: '4', label: '4+' },
                    { value: '5', label: '5+' }
                  ]
                )}
                
                {renderSelect(
                  'Banheiros (mínimo)',
                  filters.bathrooms,
                  (value) => handleFilterChange('bathrooms', value),
                  [
                    { value: '', label: 'Qualquer' },
                    { value: '1', label: '1+' },
                    { value: '2', label: '2+' },
                    { value: '3', label: '3+' },
                    { value: '4', label: '4+' }
                  ]
                )}
                
                {renderInput(
                  'Área Mínima (m²)',
                  filters.areaMin,
                  (value) => handleFilterChange('areaMin', value),
                  'number',
                  '0'
                )}
                
                {renderInput(
                  'Área Máxima (m²)',
                  filters.areaMax,
                  (value) => handleFilterChange('areaMax', value),
                  'number',
                  '9999'
                )}
              </>
            ))}

            {/* Localização */}
            {renderFilterSection('Localização', 'location', (
              <>
                {renderInput(
                  'Cidade',
                  filters.city,
                  (value) => handleFilterChange('city', value),
                  'text',
                  'Ex: Salvador, Feira de Santana...'
                )}
                
                {renderInput(
                  'Bairro',
                  filters.neighborhood,
                  (value) => handleFilterChange('neighborhood', value),
                  'text',
                  'Ex: Barra, Pituba, Centro...'
                )}
              </>
            ))}

            {/* Filtros Específicos */}
            {renderFilterSection('Filtros Específicos', 'specific', (
              <>
                {filters.operation === 'venda' && (
                  <>
                    {renderSelect(
                      'Elevador',
                      filters.hasElevator,
                      (value) => handleFilterChange('hasElevator', value),
                      [
                        { value: '', label: 'Indiferente' },
                        { value: 'true', label: 'Com elevador' },
                        { value: 'false', label: 'Sem elevador' }
                      ]
                    )}
                    
                    {renderSelect(
                      'Aceita Financiamento',
                      filters.acceptsFinancing,
                      (value) => handleFilterChange('acceptsFinancing', value),
                      [
                        { value: '', label: 'Indiferente' },
                        { value: 'true', label: 'Aceita' },
                        { value: 'false', label: 'Não aceita' }
                      ]
                    )}
                    
                    {renderInput(
                      'Taxa de Condomínio Máxima (R$)',
                      filters.condominiumFeeMax,
                      (value) => handleFilterChange('condominiumFeeMax', value),
                      'number',
                      '0'
                    )}
                  </>
                )}
                
                {filters.operation === 'aluguel' && (
                  <>
                    {renderSelect(
                      'Permite Animais',
                      filters.allowsPets,
                      (value) => handleFilterChange('allowsPets', value),
                      [
                        { value: '', label: 'Indiferente' },
                        { value: 'true', label: 'Permite' },
                        { value: 'false', label: 'Não permite' }
                      ]
                    )}
                    
                    {renderSelect(
                      'Mobiliado',
                      filters.furnished,
                      (value) => handleFilterChange('furnished', value),
                      [
                        { value: '', label: 'Indiferente' },
                        { value: 'true', label: 'Mobiliado' },
                        { value: 'false', label: 'Não mobiliado' }
                      ]
                    )}
                  </>
                )}
                
                {filters.operation === 'temporada' && (
                  <>
                    {renderInput(
                      'Mínimo de Diárias',
                      filters.minDays,
                      (value) => handleFilterChange('minDays', value),
                      'number',
                      '1'
                    )}
                    
                    {renderInput(
                      'Máximo de Hóspedes',
                      filters.maxGuests,
                      (value) => handleFilterChange('maxGuests', value),
                      'number',
                      '1'
                    )}
                    
                    {renderSelect(
                      'Piscina',
                      filters.hasPool,
                      (value) => handleFilterChange('hasPool', value),
                      [
                        { value: '', label: 'Indiferente' },
                        { value: 'true', label: 'Com piscina' },
                        { value: 'false', label: 'Sem piscina' }
                      ]
                    )}
                    
                    {renderSelect(
                      'Wi-Fi',
                      filters.hasWifi,
                      (value) => handleFilterChange('hasWifi', value),
                      [
                        { value: '', label: 'Indiferente' },
                        { value: 'true', label: 'Com Wi-Fi' },
                        { value: 'false', label: 'Sem Wi-Fi' }
                      ]
                    )}
                  </>
                )}
              </>
            ))}

            {/* Filtros Adicionais */}
            {renderFilterSection('Comodidades Adicionais', 'additional', (
              <>
                {renderSelect(
                  'Garagem',
                  filters.hasGarage,
                  (value) => handleFilterChange('hasGarage', value),
                  [
                    { value: '', label: 'Indiferente' },
                    { value: 'true', label: 'Com garagem' },
                    { value: 'false', label: 'Sem garagem' }
                  ]
                )}
                
                {renderSelect(
                  'Jardim/Quintal',
                  filters.hasGarden,
                  (value) => handleFilterChange('hasGarden', value),
                  [
                    { value: '', label: 'Indiferente' },
                    { value: 'true', label: 'Com jardim' },
                    { value: 'false', label: 'Sem jardim' }
                  ]
                )}
                
                {renderSelect(
                  'Varanda/Sacada',
                  filters.hasBalcony,
                  (value) => handleFilterChange('hasBalcony', value),
                  [
                    { value: '', label: 'Indiferente' },
                    { value: 'true', label: 'Com varanda' },
                    { value: 'false', label: 'Sem varanda' }
                  ]
                )}
                
                {renderSelect(
                  'Acessibilidade',
                  filters.isAccessible,
                  (value) => handleFilterChange('isAccessible', value),
                  [
                    { value: '', label: 'Indiferente' },
                    { value: 'true', label: 'Acessível' },
                    { value: 'false', label: 'Não acessível' }
                  ]
                )}
              </>
            ))}

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={applyFilters}
                disabled={isSearching}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSearching ? (
                  <>
                    <LoadingIndicator size="sm" className="mr-2" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <SearchIcon className="w-5 h-5 mr-2" />
                    Buscar Imóveis
                  </>
                )}
              </button>
              
              <button
                onClick={clearFilters}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resultados da Busca
              </h3>
              
              <div className="text-sm text-gray-600 mb-4">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
              </div>
              
              {filteredProperties.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredProperties.slice(0, 5).map((property) => (
                    <div key={property.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                        {property.titulo}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                        {property.endereco_completo}
                      </p>
                      <p className="text-sm font-semibold text-red-600">
                        R$ {property.preco?.toLocaleString('pt-BR')}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-500">
                          {property.quartos}q • {property.banheiros}b
                        </div>
                        <button
                          onClick={() => props.onViewDetails(property.id!)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Ver detalhes
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredProperties.length > 5 && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => {
                          // Navegar para página de resultados completos
                          props.onSearchSubmit(filters.searchQuery);
                        }}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Ver todos os {filteredProperties.length} resultados
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <SearchIcon className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-600 text-sm">
                    Nenhum imóvel encontrado com os filtros selecionados.
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Tente ajustar os filtros para encontrar mais opções.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchPage;