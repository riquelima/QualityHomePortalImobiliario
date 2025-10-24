import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import PlusIcon from '../icons/PlusIcon';
import type { Property } from '../../types';

interface PropertyManagementProps {
  onViewDetails: (id: number) => void;
  onDeleteProperty: (id: number) => void;
  onEditProperty: (property: Property) => void;
  onShareProperty: (id: number) => void;
  onSectionChange: (section: 'dashboard' | 'properties' | 'publish') => void;
}

const PropertyManagement: React.FC<PropertyManagementProps> = ({
  onViewDetails,
  onDeleteProperty,
  onEditProperty,
  onShareProperty,
  onSectionChange
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'sold'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'casa' | 'apartamento' | 'terreno' | 'comercial'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('imoveis')
          .select('*');

        if (error) {
          throw error;
        }

        setProperties(data || []);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Filtrar e ordenar propriedades
  const filteredProperties = useMemo(() => {
    let filtered = properties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
      const matchesType = typeFilter === 'all' || property.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [properties, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

  const handleSelectProperty = (id: number) => {
    setSelectedProperties(prev => 
      prev.includes(id) 
        ? prev.filter(propId => propId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === filteredProperties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(filteredProperties.map(p => p.id));
    }
  };

  const handleBulkAction = (action: 'delete' | 'activate' | 'deactivate') => {
    // Implementar ações em massa
    console.log(`Bulk action: ${action} for properties:`, selectedProperties);
    setSelectedProperties([]);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'pending': return 'Pendente';
      case 'sold': return 'Vendido';
      default: return status;
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Gerenciar Anúncios</h1>
          <p className="text-gray-600 mt-1">{filteredProperties.length} de {properties.length} imóveis</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por título ou localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent text-sm"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="active">Ativo</option>
              <option value="pending">Pendente</option>
              <option value="sold">Vendido</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
            </select>
          </div>
        </div>

        {/* Sort and View Options */}
        <div className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Ordenar por:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-red focus:border-transparent min-w-0 flex-1 sm:flex-initial"
              >
                <option value="date">Data</option>
                <option value="price">Preço</option>
                <option value="title">Título</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <svg className={`w-4 h-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start lg:justify-end space-x-2">
            <span className="text-sm text-gray-500 hidden sm:inline">Visualização:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-brand-red text-white' : 'text-gray-500 hover:text-gray-700'}`}
              title="Grade"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-brand-red text-white' : 'text-gray-500 hover:text-gray-700'}`}
              title="Lista"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProperties.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium text-blue-800">
              {selectedProperties.length} imóveis selecionados
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex-1 sm:flex-initial"
              >
                Ativar
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors flex-1 sm:flex-initial"
              >
                Desativar
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex-1 sm:flex-initial"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Properties Grid/List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Table Header */}
        <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedProperties.length === filteredProperties.length && filteredProperties.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 text-brand-red focus:ring-brand-red border-gray-300 rounded"
            />
            <span className="ml-3 text-sm font-medium text-gray-700">
              Selecionar todos
            </span>
          </div>
        </div>

        {/* Properties List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 p-4 lg:p-6' : 'divide-y divide-gray-200'}>
          {filteredProperties.map((property) => (
            <div key={property.id} className={viewMode === 'grid' ? 'bg-gray-50 rounded-lg p-3 lg:p-4' : 'p-4 lg:p-6'}>
              <div className="flex items-start space-x-3 lg:space-x-4">
                <input
                  type="checkbox"
                  checked={selectedProperties.includes(property.id)}
                  onChange={() => handleSelectProperty(property.id)}
                  className="h-4 w-4 text-brand-red focus:ring-brand-red border-gray-300 rounded mt-1 flex-shrink-0"
                />
                
                <div className="flex-shrink-0">
                  <img
                    src={property.images && property.images.length > 0 ? property.images[0] : '/placeholder-image.jpg'}
                    alt={property.title}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {property.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{property.location}</p>
                      <p className="text-base sm:text-lg font-bold text-brand-red mt-1">
                        {formatCurrency(property.price)}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-start sm:justify-end">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                        {getStatusLabel(property.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mt-3 lg:mt-4">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                      <span>{property.bedrooms} quartos</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{property.bathrooms} banheiros</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{property.area}m²</span>
                    </div>
                    
                    <div className="flex items-center justify-center sm:justify-end space-x-1">
                      <button
                        onClick={() => onViewDetails(property.id)}
                        className="p-1.5 sm:p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Visualizar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => onEditProperty(property)}
                        className="p-1.5 sm:p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => onShareProperty(property.id)}
                        className="p-1.5 sm:p-1 text-gray-400 hover:text-purple-600 transition-colors"
                        title="Compartilhar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => onDeleteProperty(property.id)}
                        className="p-1.5 sm:p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum imóvel encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">Tente ajustar os filtros de busca.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyManagement;