import React from 'react';
import type { Property } from '../types';
import PropertyCard from './PropertyCard';
import { useLanguage } from '../contexts/LanguageContext';
import SearchIcon from './icons/SearchIcon';
import SpinnerIcon from './icons/SpinnerIcon';

interface PropertyListingsProps {
  properties: Property[];
  onViewDetails: (id: number) => void;
  onShare: (id: number) => void;
  isLoading: boolean;
  title?: string;
  description?: string;
  noResultsTitle?: string;
  noResultsDescription?: string;
  loadMore: () => void;
  hasMore: boolean;
}

const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 animate-pulse">
        <div className="bg-gray-200 h-56 w-full"></div>
        <div className="p-5">
            <div className="bg-gray-200 h-5 w-3/4 rounded mb-3"></div>
            <div className="bg-gray-200 h-4 w-full rounded mb-4"></div>
            <div className="bg-gray-200 h-6 w-1/2 rounded mb-6"></div>
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-200 h-16 rounded-lg"></div>
                <div className="bg-gray-200 h-16 rounded-lg"></div>
                <div className="bg-gray-200 h-16 rounded-lg"></div>
            </div>
            <div className="flex gap-3">
                <div className="bg-gray-200 h-12 flex-1 rounded-lg"></div>
                <div className="bg-gray-200 h-12 w-12 rounded-lg"></div>
            </div>
        </div>
    </div>
);

const PropertyListings: React.FC<PropertyListingsProps> = ({ properties, onViewDetails, onShare, isLoading, title, description, noResultsTitle, noResultsDescription, loadMore, hasMore }) => {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho minimalista */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 mb-4 sm:mb-6">
            {title || t('listings.title')}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            {description || t('listings.description')}
          </p>
        </div>

        {/* Grid de propriedades */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : properties.length > 0 ? (
            properties.map((property, index) => (
              <PropertyCard 
                key={`${property.id}-${index}`}
                property={property} 
                onViewDetails={onViewDetails}
                onShare={onShare}
              />
            ))
          ) : (
             <div className="sm:col-span-2 lg:col-span-3 text-center py-20 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <SearchIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {noResultsTitle || t('listings.noResults.title')}
                  </h3>
                  <p className="text-gray-600">
                    {noResultsDescription || t('listings.noResults.description')}
                  </p>
                </div>
             </div>
          )}
        </div>
        
        {/* Botão "Ver mais" minimalista */}
        {hasMore && !isLoading && (
          <div className="text-center mt-16">
            <button
              onClick={loadMore}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300"
            >
              {t('listings.viewAll')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertyListings;