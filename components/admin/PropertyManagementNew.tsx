import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import PlusIcon from '../icons/PlusIcon';
import EyeIcon from '../icons/EyeIcon';
import PencilIcon from '../icons/PencilIcon';
import TrashIcon from '../icons/TrashIcon';
import ShareIcon from '../icons/ShareIcon';
import SearchIcon from '../icons/SearchIcon';
import HeartIcon from '../icons/HeartIcon';
import LocationIcon from '../icons/LocationIcon';
import BedIcon from '../icons/BedIcon';
import BathIcon from '../icons/BathIcon';
import AreaIcon from '../icons/AreaIcon';

interface Imovel {
  id: number;
  anunciante_id: string;
  titulo: string;
  descricao: string | null;
  endereco_completo: string | null;
  cidade: string | null;
  preco: string;
  tipo_operacao: 'venda' | 'aluguel' | 'temporada';
  tipo_imovel: string;
  quartos: number;
  banheiros: number;
  area_bruta: number;
  status: 'ativo' | 'inativo' | 'vendido' | 'alugado' | 'pendente';
  data_publicacao: string;
  data_atualizacao: string;
  midias_imovel?: {
    id: number;
    url: string;
    tipo: 'imagem' | 'video' | 'planta';
    ordem: number;
  }[];
}

interface PropertyManagementNewProps {
  onViewDetails: (id: number) => void;
  onDeleteProperty: (id: number) => void;
  onEditProperty: (property: any) => void;
  onShareProperty: (id: number) => void;
  onSectionChange: (section: 'dashboard' | 'properties' | 'publish') => void;
}

const PropertyManagementNew: React.FC<PropertyManagementNewProps> = ({
  onViewDetails,
  onDeleteProperty,
  onEditProperty,
  onShareProperty,
  onSectionChange
}) => {
  const [properties, setProperties] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'inativo' | 'vendido' | 'alugado' | 'pendente'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Casa' | 'Apartamento' | 'Terreno' | 'Comercial'>('all');
  const [operationFilter, setOperationFilter] = useState<'all' | 'venda' | 'aluguel' | 'temporada'>('all');
  const [sortBy, setSortBy] = useState<'data_publicacao' | 'preco' | 'titulo'>('data_publicacao');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);


  useEffect(() => {
    fetchProperties();
  }, []);

  // Efeito para fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showFilters && !target.closest('.filter-dropdown')) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('imoveis')
        .select(`
          *,
          midias_imovel (
            id,
            url,
            tipo,
            ordem
          )
        `)
        .order('data_publicacao', { ascending: false });

      if (error) {
        throw error;
      }

      setProperties(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar imóveis:', error);
      setError(error.message || 'Erro ao carregar imóveis');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase
          .from('imoveis')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        setProperties(prev => prev.filter(p => p.id !== id));
        
        // Mostrar feedback visual
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = 'Imóvel excluído com sucesso!';
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
      } catch (error: any) {
        console.error('Erro ao excluir imóvel:', error);
        alert('Erro ao excluir imóvel: ' + error.message);
      }
    }
  };

  const handleEditProperty = (property: Imovel) => {
    const propertyForEdit = {
      id: property.id,
      title: property.titulo,
      description: property.descricao,
      location: property.endereco_completo,
      city: property.cidade,
      price: parseFloat(property.preco),
      operation: property.tipo_operacao,
      type: property.tipo_imovel,
      bedrooms: property.quartos,
      bathrooms: property.banheiros,
      area: property.area_bruta,
      status: property.status,
      images: property.midias_imovel?.filter(m => m.tipo === 'imagem').map(m => m.url) || [],
      createdAt: property.data_publicacao,
      updatedAt: property.data_atualizacao
    };
    
    onEditProperty(propertyForEdit);
  };

  // Filtrar e ordenar propriedades
  const filteredProperties = useMemo(() => {
    let filtered = properties.filter(property => {
      const matchesSearch = property.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (property.endereco_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                           (property.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
      const matchesType = typeFilter === 'all' || property.tipo_imovel === typeFilter;
      const matchesOperation = operationFilter === 'all' || property.tipo_operacao === operationFilter;
      
      return matchesSearch && matchesStatus && matchesType && matchesOperation;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'data_publicacao':
          comparison = new Date(a.data_publicacao).getTime() - new Date(b.data_publicacao).getTime();
          break;
        case 'preco':
          comparison = parseFloat(a.preco) - parseFloat(b.preco);
          break;
        case 'titulo':
          comparison = a.titulo.localeCompare(b.titulo);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [properties, searchTerm, statusFilter, typeFilter, operationFilter, sortBy, sortOrder]);



  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'inativo': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'vendido': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'alugado': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'inativo': return 'Inativo';
      case 'vendido': return 'Vendido';
      case 'alugado': return 'Alugado';
      case 'pendente': return 'Pendente';
      default: return status;
    }
  };

  const getOperationLabel = (operation: string) => {
    switch (operation) {
      case 'venda': return 'Venda';
      case 'aluguel': return 'Aluguel';
      case 'temporada': return 'Temporada';
      default: return operation;
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'venda': return 'bg-red-500';
      case 'aluguel': return 'bg-blue-500';
      case 'temporada': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-red mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Carregando seus imóveis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar imóveis</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchProperties}
              className="w-full bg-brand-red text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gerenciar Anúncios</h1>
              <p className="text-gray-600 mt-1">
                {filteredProperties.length} de {properties.length} anúncios
              </p>
            </div>
            <button
              onClick={() => onSectionChange('publish')}
              className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Novo anúncio
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         {/* Compact Search and Filters */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
           <div className="flex flex-col sm:flex-row gap-4 items-center">
             {/* Search */}
             <div className="flex-1 w-full sm:w-auto">
               <div className="relative">
                 <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                 <input
                   type="text"
                   placeholder="Buscar anúncios..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                 />
               </div>
             </div>

             {/* Filter Button */}
             <div className="relative filter-dropdown">
               <button
                 onClick={() => setShowFilters(!showFilters)}
                 className={`inline-flex items-center px-4 py-3 border rounded-xl transition-all ${
                   showFilters 
                     ? 'bg-red-600 text-white border-red-600' 
                     : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                 }`}
               >
                 <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                 </svg>
                 Filtros
                 {(statusFilter !== 'all' || typeFilter !== 'all' || operationFilter !== 'all') && (
                   <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                     {[statusFilter, typeFilter, operationFilter].filter(f => f !== 'all').length}
                   </span>
                 )}
               </button>

               {/* Dropdown Filters */}
               {showFilters && (
                 <div className="absolute right-0 sm:right-0 left-0 sm:left-auto mt-2 w-full sm:w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4">
                   <div className="space-y-4">
                     {/* Status Filter */}
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                       <select
                         value={statusFilter}
                         onChange={(e) => setStatusFilter(e.target.value as any)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                       >
                         <option value="all">Todos os status</option>
                         <option value="ativo">Ativo</option>
                         <option value="inativo">Inativo</option>
                         <option value="vendido">Vendido</option>
                         <option value="alugado">Alugado</option>
                         <option value="pendente">Pendente</option>
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
                         <option value="all">Todos os tipos</option>
                         <option value="Casa">Casa</option>
                         <option value="Apartamento">Apartamento</option>
                         <option value="Terreno">Terreno</option>
                         <option value="Comercial">Comercial</option>
                       </select>
                     </div>

                     {/* Operation Filter */}
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Operação</label>
                       <select
                         value={operationFilter}
                         onChange={(e) => setOperationFilter(e.target.value as any)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                       >
                         <option value="all">Todas as operações</option>
                         <option value="venda">Venda</option>
                         <option value="aluguel">Aluguel</option>
                         <option value="temporada">Temporada</option>
                       </select>
                     </div>

                     {/* Sort */}
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                       <div className="flex space-x-2">
                         <select
                           value={sortBy}
                           onChange={(e) => setSortBy(e.target.value as any)}
                           className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                         >
                           <option value="data_publicacao">Data</option>
                           <option value="preco">Preço</option>
                           <option value="titulo">Título</option>
                         </select>
                         <button
                           onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                           className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                         >
                           <svg className={`w-4 h-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                           </svg>
                         </button>
                       </div>
                     </div>

                     {/* Clear Filters */}
                     <div className="pt-2 border-t border-gray-200">
                       <button
                         onClick={() => {
                           setStatusFilter('all');
                           setTypeFilter('all');
                           setOperationFilter('all');
                           setSortBy('data_publicacao');
                           setSortOrder('desc');
                         }}
                         className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                       >
                         Limpar filtros
                       </button>
                     </div>
                   </div>
                 </div>
               )}
             </div>

             {/* Results count */}
             <div className="text-sm text-gray-600 whitespace-nowrap">
               <span className="font-medium">{filteredProperties.length}</span> de {properties.length}
             </div>
           </div>
         </div>



        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum anúncio encontrado</h3>
             <p className="text-gray-600 mb-8">
               {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || operationFilter !== 'all'
                 ? 'Tente ajustar os filtros de busca.' 
                 : 'Comece criando seu primeiro anúncio.'}
             </p>
             {(!searchTerm && statusFilter === 'all' && typeFilter === 'all' && operationFilter === 'all') && (
               <button
                 onClick={() => onSectionChange('publish')}
                 className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
               >
                 <PlusIcon className="w-5 h-5 mr-2" />
                 Criar Primeiro Anúncio
               </button>
             )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {filteredProperties.map((property) => {
               const firstImage = property.midias_imovel?.find(m => m.tipo === 'imagem')?.url;
               
               return (
                 <div
                   key={property.id}
                   className="bg-white rounded-xl shadow-sm border-2 border-gray-200 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                 >
                  {/* Image */}
                  <div className="relative">
                    <img
                      src={firstImage || '/placeholder-image.jpg'}
                      alt={property.titulo}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(property.status)}`}>
                        {getStatusLabel(property.status)}
                      </span>
                    </div>

                    {/* Operation Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white ${getOperationColor(property.tipo_operacao)}`}>
                        {getOperationLabel(property.tipo_operacao)}
                      </span>
                    </div>


                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {property.titulo}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center text-gray-600 mb-3">
                      <LocationIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="text-sm truncate">
                        {property.endereco_completo || property.cidade}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="text-2xl font-bold text-brand-red mb-4">
                      {formatCurrency(property.preco)}
                    </div>

                    {/* Property Details */}
                    <div className="flex items-center justify-between text-gray-600 mb-4">
                      <div className="flex items-center space-x-4 text-sm">
                        {property.quartos > 0 && (
                          <div className="flex items-center">
                            <BedIcon className="w-4 h-4 mr-1" />
                            <span>{property.quartos}</span>
                          </div>
                        )}
                        {property.banheiros > 0 && (
                          <div className="flex items-center">
                            <BathIcon className="w-4 h-4 mr-1" />
                            <span>{property.banheiros}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <AreaIcon className="w-4 h-4 mr-1" />
                          <span>{property.area_bruta}m²</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {property.tipo_imovel}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onViewDetails(property.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Visualizar"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => handleEditProperty(property)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => onShareProperty(property.id)}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="Compartilhar"
                        >
                          <ShareIcon className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteProperty(property.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Excluir"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyManagementNew;