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
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 animate-pulse">
        <div className="bg-gray-300 h-56 w-full"></div>
        <div className="p-4 sm:p-6">
            <div className="bg-gray-300 h-6 w-3/4 rounded mb-2"></div>
            <div className="bg-gray-300 h-4 w-full rounded mb-4"></div>
            <div className="bg-gray-300 h-8 w-1/2 rounded mb-4"></div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-b border-gray-200 py-4 mb-4">
                <div className="bg-gray-300 h-10 rounded"></div>
                <div className="bg-gray-300 h-10 rounded"></div>
                <div className="bg-gray-300 h-10 rounded"></div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="bg-gray-300 h-10 w-full rounded-md"></div>
            </div>
        </div>
    </div>
);


const PropertyListings: React.FC<PropertyListingsProps> = ({ properties, onViewDetails, onShare, isLoading, title, description, noResultsTitle, noResultsDescription, loadMore, hasMore }) => {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy text-center mb-4">{title || t('listings.title')}</h2>
        <p className="text-base sm:text-lg text-brand-gray text-center max-w-2xl mx-auto mb-12">
          {description || t('listings.description')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
          ) : properties.length > 0 ? (
            properties.map((property, index) => (
              <div 
                key={`${property.id}-${index}`}
                className="card-animate" 
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PropertyCard 
                  property={property} 
                  onViewDetails={onViewDetails}
                  onShare={onShare}
                />
              </div>
            ))
          ) : (
             <div className="md:col-span-2 lg:col-span-3 text-center py-16 bg-brand-light-gray rounded-lg">
                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-brand-navy mb-2">{noResultsTitle || t('listings.noResults.title')}</h3>
                <p className="text-brand-gray max-w-md mx-auto">{noResultsDescription || t('listings.noResults.description')}</p>
             </div>
          )}
        </div>
        
        {hasMore && !isLoading && (
          <div className="text-center mt-12">
            <button
              onClick={loadMore}
              className="bg-brand-red hover:opacity-90 text-white font-bold py-3 px-8 rounded-md transition duration-300"
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