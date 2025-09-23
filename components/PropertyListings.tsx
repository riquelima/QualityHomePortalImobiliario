

import React from 'react';
// FIX: Removed unused import of PropertyStatus.
import type { Property } from '../types';
import PropertyCard from './PropertyCard';
import { useLanguage } from '../contexts/LanguageContext';

interface PropertyListingsProps {
  properties: Property[];
  onViewDetails: (id: number) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  isLoading: boolean;
  title?: string;
  onContactClick: (property: Property) => void;
}

const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 animate-pulse">
        <div className="bg-gray-300 h-64 w-full"></div>
        <div className="p-4">
            <div className="bg-gray-300 h-5 w-3/4 rounded mb-2"></div>
            <div className="bg-gray-300 h-4 w-full rounded mb-4"></div>
            <div className="bg-gray-300 h-8 w-1/2 rounded mb-4"></div>
            <div className="flex justify-between items-center text-sm text-brand-gray border-t pt-4">
                 <div className="bg-gray-300 h-4 w-1/4 rounded"></div>
                 <div className="bg-gray-300 h-4 w-1/4 rounded"></div>
                 <div className="bg-gray-300 h-4 w-1/4 rounded"></div>
            </div>
        </div>
    </div>
);


const PropertyListings: React.FC<PropertyListingsProps> = ({ properties, onViewDetails, favorites, onToggleFavorite, isLoading, title, onContactClick }) => {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)
          ) : properties.length > 0 ? (
            properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onViewDetails={onViewDetails}
                isFavorite={favorites.includes(property.id)}
                onToggleFavorite={onToggleFavorite}
                onContactClick={onContactClick}
              />
            ))
          ) : (
             <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 text-center py-16">
                <p className="text-brand-gray text-lg">{t('listings.noResults')}</p>
             </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PropertyListings;