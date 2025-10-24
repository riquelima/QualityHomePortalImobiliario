import React from 'react';
import StatCard from './StatCard';
import PlusIcon from '../icons/PlusIcon';
import type { Property } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
  properties: Property[];
  onSectionChange: (section: 'dashboard' | 'properties' | 'publish') => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ properties, onSectionChange }) => {
  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.status === 'active').length;
  const pendingProperties = properties.filter(p => p.status === 'pending').length;
  const soldProperties = properties.filter(p => p.status === 'sold').length;

  const propertyTypesData = Object.entries(
    properties.reduce((acc, property) => {
      const type = property.tipo_imovel || 'Não especificado';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Dashboard</h1>
        <p className="text-gray-500">Visão geral do seu portal imobiliário.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de Imóveis"
          value={totalProperties}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1m-1-4h1m-1 4h1" /></svg>}
          color="blue"
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatCard
          title="Imóveis Ativos"
          value={activeProperties}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="green"
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatCard
          title="Pendentes"
          value={pendingProperties}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          color="orange"
          trend={{ value: 1.3, isPositive: false }}
        />
        <StatCard
          title="Vendidos"
          value={soldProperties}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          color="purple"
          trend={{ value: 10, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Ações Rápidas</h3>
          <button
            onClick={() => onSectionChange('publish')}
            className="w-full flex items-center justify-center py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-sm"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Publicar Novo Imóvel
          </button>
          <button
            onClick={() => onSectionChange('properties')}
            className="w-full flex items-center justify-center py-3 px-4 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-300 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Gerenciar Imóveis
          </button>
          <div className="border-t border-gray-200 pt-4 mt-auto">
            <h4 className="font-semibold text-gray-600 mb-2">Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-medium">Ativos</span>
                <span className="font-bold text-gray-800">{activeProperties}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-600 font-medium">Pendentes</span>
                <span className="font-bold text-gray-800">{pendingProperties}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-600 font-medium">Vendidos</span>
                <span className="font-bold text-gray-800">{soldProperties}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;