

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
}

const statusColorMap = {
  [PropertyStatus.New]: 'bg-brand-status-green',
  [PropertyStatus.Updated]: 'bg-brand-status-orange',
};

const currencyConfig = {
  pt: { locale: 'pt-BR', currency: 'BRL' },
  en: { locale: 'en-US', currency: 'USD' },
  es: { locale: 'es-ES', currency: 'EUR' },
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onViewDetails, isFavorite, onToggleFavorite }) => {
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl flex flex-col border border-gray-200">
      <div className="relative">
        <img src={imageSrc} alt={property.title} className="w-full h-56 object-cover aspect-video" />
        {property.status && (
          <span className={`absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full ${statusColorMap[property.status]}`}>
            {property.status}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Impede que o clique no botão acione o clique no card
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
      </div>
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-lg sm:text-xl font-bold text-brand-navy mb-2 leading-tight">{property.title}</h3>
          <div className="flex items-center text-brand-gray mb-4">
            <LocationIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            <p className="text-sm">{property.address}</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-brand-red mb-4">{formattedPrice}</p>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center border-t border-b border-gray-200 py-4 mb-4">
            <div className="flex flex-col items-center">
              <BedIcon className="w-5 h-5 mb-1 text-brand-gray" />
              <span className="text-sm text-brand-dark">{property.bedrooms} {t('propertyCard.bedrooms')}</span>
            </div>
            <div className="flex flex-col items-center">
              <BathIcon className="w-5 h-5 mb-1 text-brand-gray" />
              <span className="text-sm text-brand-dark">{property.bathrooms} {t('propertyCard.bathrooms')}</span>
            </div>
            <div className="flex flex-col items-center">
              <AreaIcon className="w-5 h-5 mb-1 text-brand-gray" />
              <span className="text-sm text-brand-dark">{property.area} m²</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button 
              onClick={() => onViewDetails(property.id)}
              className="w-full bg-brand-red hover:opacity-90 text-white font-medium py-2 px-4 rounded-md transition duration-300"
            >
                {t('propertyCard.details')}
            </button>
            <button className="w-full bg-gray-200 hover:bg-gray-300 text-brand-dark font-medium py-2 px-4 rounded-md transition duration-300">
                {t('propertyCard.contact')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;