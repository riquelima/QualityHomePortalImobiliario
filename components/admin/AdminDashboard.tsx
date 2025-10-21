import React from 'react';
import StatCard from './StatCard';
import PlusIcon from '../icons/PlusIcon';
import type { Property } from '../../types';

interface AdminDashboardProps {
  properties: Property[];
  onSectionChange: (section: 'dashboard' | 'properties' | 'publish') => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ properties, onSectionChange }) => {
  // Calcular estatísticas
  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.status === 'active').length;
  const pendingProperties = properties.filter(p => p.status === 'pending').length;
  const soldProperties = properties.filter(p => p.status === 'sold').length;

  // Calcular valor total do portfólio
  const totalValue = properties.reduce((sum, property) => sum + property.price, 0);
  const averagePrice = totalProperties > 0 ? totalValue / totalProperties : 0;

  // Propriedades por tipo
  const propertyTypes = properties.reduce((acc, property) => {
    acc[property.type] = (acc[property.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Propriedades recentes (últimos 7 dias)
  const recentProperties = properties.filter(property => {
    const createdDate = new Date(property.createdAt || Date.now());
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdDate >= weekAgo;
  }).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bem-vindo ao painel administrativo
          </p>
        </div>
        <div className="lg:mt-0">
          <span className="text-xs lg:text-sm text-gray-500">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCard
          title="Total de Imóveis"
          value={totalProperties.toString()}
          icon={
            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
          }
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        
        <StatCard
          title="Imóveis Ativos"
          value={activeProperties.toString()}
          icon={
            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
          trend={{ value: 8, isPositive: true }}
        />
        
        <StatCard
          title="Pendentes"
          value={pendingProperties.toString()}
          icon={
            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
          color="yellow"
        />
        
        <StatCard
          title="Vendidos"
          value={soldProperties.toString()}
          icon={
            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
          color="purple"
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Charts and Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Types Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Imóveis</h3>
          <div className="space-y-3">
            {Object.entries(propertyTypes).map(([type, count]) => {
              const percentage = (count / totalProperties) * 100;
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-brand-red h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Imóveis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium text-green-800">Ativos</span>
              </div>
              <span className="text-green-800 font-bold">{activeProperties}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="font-medium text-yellow-800">Pendentes</span>
              </div>
              <span className="text-yellow-800 font-bold">{pendingProperties}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="font-medium text-blue-800">Vendidos</span>
              </div>
              <span className="text-blue-800 font-bold">{soldProperties}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
          <button
            onClick={() => onSectionChange('publish')}
            className="flex items-center justify-center space-x-2 bg-red-600 text-white px-3 lg:px-4 py-3 rounded-lg hover:bg-red-700 transition-colors text-sm lg:text-base"
          >
            <PlusIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>Novo Anúncio</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 lg:px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base">
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Relatórios</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-3 lg:px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-sm lg:text-base">
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Configurações</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;