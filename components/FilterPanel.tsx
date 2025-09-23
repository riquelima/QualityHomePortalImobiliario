import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import CloseIcon from './icons/CloseIcon';

export interface Filters {
  operation: 'venda' | 'aluguel' | 'temporada' | '';
  propertyType: string;
  bedrooms: number | null;
  minPrice: string;
  maxPrice: string;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters: Filters;
  onApply: (filters: Filters) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, initialFilters, onApply }) => {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<Filters>(initialFilters);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFilters(initialFilters);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, initialFilters]);

  if (!isOpen) {
    return null;
  }
  
  const handleSelect = (key: keyof Omit<Filters, 'minPrice' | 'maxPrice'>, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? (key === 'bedrooms' ? null : '') : value
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/\D/g, '');
    setFilters(prev => ({ ...prev, [name]: numericValue }));
  };
  
  const handleClear = () => {
    const cleared = { operation: '' as const, propertyType: '', bedrooms: null, minPrice: '', maxPrice: '' };
    setFilters(cleared);
  };
  
  const handleApply = () => {
    onApply(filters);
  };

  const propertyTypes = ['Apartamento', 'Casa', 'Quarto', 'Escritório', 'Terreno'];
  const bedroomOptions = [1, 2, 3, 4]; // 4 represents 4+

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="relative bg-white rounded-t-2xl w-full max-w-lg h-[90vh] max-h-[700px] flex flex-col transform transition-transform animate-slide-up" 
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="text-xl font-bold text-brand-navy">Filtros</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon className="w-6 h-6" /></button>
        </header>

        <main className="flex-grow p-6 overflow-y-auto space-y-8">
          {/* Operation */}
          <section>
            <h3 className="text-lg font-semibold text-brand-dark mb-3">Tipo de Operação</h3>
            <div className="flex gap-2">
              <button onClick={() => handleSelect('operation', 'venda')} className={`px-4 py-2 border rounded-full text-sm font-medium transition-colors ${filters.operation === 'venda' ? 'bg-brand-red text-white border-brand-red' : 'bg-white hover:border-brand-dark'}`}>Venda</button>
              <button onClick={() => handleSelect('operation', 'aluguel')} className={`px-4 py-2 border rounded-full text-sm font-medium transition-colors ${filters.operation === 'aluguel' ? 'bg-brand-red text-white border-brand-red' : 'bg-white hover:border-brand-dark'}`}>Aluguel</button>
            </div>
          </section>

          {/* Property Type */}
          <section>
            <h3 className="text-lg font-semibold text-brand-dark mb-3">Tipo de Imóvel</h3>
            <div className="flex flex-wrap gap-2">
              {propertyTypes.map(type => (
                <button key={type} onClick={() => handleSelect('propertyType', type)} className={`px-4 py-2 border rounded-full text-sm font-medium transition-colors ${filters.propertyType === type ? 'bg-brand-red text-white border-brand-red' : 'bg-white hover:border-brand-dark'}`}>{type}</button>
              ))}
            </div>
          </section>
          
          {/* Bedrooms */}
          <section>
            <h3 className="text-lg font-semibold text-brand-dark mb-3">Número de Quartos</h3>
            <div className="flex gap-2">
              {bedroomOptions.map(num => (
                <button key={num} onClick={() => handleSelect('bedrooms', num)} className={`w-12 h-12 border rounded-full font-medium transition-colors ${filters.bedrooms === num ? 'bg-brand-red text-white border-brand-red' : 'bg-white hover:border-brand-dark'}`}>{num}{num === 4 ? '+' : ''}</button>
              ))}
            </div>
          </section>

          {/* Price Range */}
          <section>
            <h3 className="text-lg font-semibold text-brand-dark mb-3">Faixa de Preço</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="minPrice" className="text-sm text-brand-gray">Preço Mínimo</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-gray">R$</span>
                  <input id="minPrice" type="text" name="minPrice" inputMode="numeric" value={filters.minPrice} onChange={handlePriceChange} placeholder="0" className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red"/>
                </div>
              </div>
              <div>
                <label htmlFor="maxPrice" className="text-sm text-brand-gray">Preço Máximo</label>
                 <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-gray">R$</span>
                    <input id="maxPrice" type="text" name="maxPrice" inputMode="numeric" value={filters.maxPrice} onChange={handlePriceChange} placeholder="Ilimitado" className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red"/>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <footer className="flex items-center justify-between p-4 border-t flex-shrink-0">
          <button onClick={handleClear} className="font-semibold text-brand-dark hover:underline">Limpar filtros</button>
          <button onClick={handleApply} className="bg-brand-red text-white font-bold py-3 px-8 rounded-md hover:opacity-90 transition-opacity">Aplicar filtros</button>
        </footer>
      </div>
    </div>
  );
};

export default FilterPanel;
