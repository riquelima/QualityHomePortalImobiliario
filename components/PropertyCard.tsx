

import React from 'react';
import type { Property } from '../types';
import { PropertyStatus } from '../types';
import LocationIcon from './icons/LocationIcon';
import BedIcon from './icons/BedIcon';
import BathIcon from './icons/BathIcon';
import AreaIcon from './icons/AreaIcon';
import HeartIcon from './icons/HeartIcon';
import HeartFilledIcon from './icons/HeartFilledIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface PropertyCardProps {
  property: Property;
  onViewDetails: (id: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onContactClick: (property: Property) => void;
}

const currencyConfig = {
  pt: { locale: 'pt-BR', currency: 'BRL' },
  en: { locale: 'en-US', currency: 'USD' },
  es: { locale: 'es-ES', currency: 'EUR' },
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onViewDetails, isFavorite, onToggleFavorite, onContactClick }) => {
  const { language, t } = useLanguage();
  const { locale, currency } = currencyConfig[language as keyof typeof currencyConfig];

  const formattedPrice = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(property.price);

  const imageSrc = property.images && property.images.length > 0
    ? property.images[0]
    : 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

  return (
    <div onClick={() => onViewDetails(property.id)} className="w-full bg-white rounded-xl overflow-hidden flex flex-col cursor-pointer group">
      <div className="relative">
        <div className="aspect-square w-full overflow-hidden">
             <img src={imageSrc} alt={property.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(property.id);
          }}
          className="absolute top-3 right-3 bg-white/70 backdrop-blur-sm p-2 rounded-full text-brand-red hover:bg-white transition-colors duration-200 z-10"
          aria-label={isFavorite ? t('propertyCard.removeFromFavorites') : t('propertyCard.addToFavorites')}
        >
          {isFavorite ? (
            <HeartFilledIcon className="w-6 h-6" />
          ) : (
            <HeartIcon className="w-6 h-6" />
          )}
        </button>
         <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
            {Array.from({ length: Math.min(property.images?.length || 1, 5) }).map((_, i) => (
                <div key={i} className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}`} />
            ))}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-md font-bold text-brand-navy mb-1 leading-tight truncate">{property.title}</h3>
        <p className="text-sm text-brand-gray mb-2 truncate">{property.address}</p>
        <p className="text-lg font-bold text-brand-dark mb-3">{formattedPrice}</p>
        <div className="flex justify-between items-center text-sm text-brand-gray border-t pt-3 mt-auto">
             <div className="flex items-center space-x-1">
              <BedIcon className="w-4 h-4" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center space-x-1">
              <BathIcon className="w-4 h-4" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center space-x-1">
              <AreaIcon className="w-4 h-4" />
              <span>{property.area} m²</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;