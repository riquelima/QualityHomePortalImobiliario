import React from 'react';
import type { Property } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import LocationIcon from './icons/LocationIcon';
import EyeIcon from './icons/EyeIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';

interface MyAdCardProps {
  property: Property;
  onView: (id: number) => void;
  onEdit: (property: Property) => void;
  onDelete: (id: number) => void;
}

const MyAdCard: React.FC<MyAdCardProps> = ({ property, onView, onEdit, onDelete }) => {
  const { t, language } = useLanguage();
  const currencyConfig = {
    pt: { locale: 'pt-BR', currency: 'BRL' },
    en: { locale: 'en-US', currency: 'USD' },
    es: { locale: 'es-ES', currency: 'EUR' },
  };
  const { locale, currency } = currencyConfig[language as keyof typeof currencyConfig];

  const formattedPrice = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(property.price);

  const imageSrc = property.images && property.images.length > 0 ? property.images[0] : 'https://picsum.photos/seed/' + property.id + '/800/600';

  const isInactive = property.status !== 'ativo';

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden flex flex-col sm:flex-row border border-gray-200 transition-all duration-300 ${isInactive ? 'grayscale' : ''}`}>
      <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
        <img src={imageSrc} alt={property.title} className="w-full h-full object-cover" />
        {isInactive && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white/90 text-brand-dark font-bold px-4 py-2 rounded-md">{t('myAdsPage.inactiveStatus')}</span>
            </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-lg font-bold text-brand-navy mb-1 leading-tight">{property.title}</h3>
          <div className="flex items-center text-brand-gray mb-2">
            <LocationIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            <p className="text-sm">{property.address}</p>
          </div>
          <p className="text-xl font-bold text-brand-red mb-4">{formattedPrice}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={() => onView(property.id)} className="flex-1 min-w-[100px] flex items-center justify-center bg-brand-navy hover:bg-brand-dark text-white font-medium py-2 px-3 rounded-md transition duration-300 text-sm">
            <EyeIcon className="w-4 h-4 mr-2" />
            {t('myAdsPage.viewButton')}
          </button>
          <button onClick={() => onEdit(property)} className="flex-1 min-w-[100px] flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-brand-dark font-medium py-2 px-3 rounded-md transition duration-300 text-sm">
             <PencilIcon className="w-4 h-4 mr-2" />
             {t('myAdsPage.editButton')}
          </button>
          <button onClick={() => onDelete(property.id)} className="flex-1 min-w-[100px] flex items-center justify-center bg-red-100 hover:bg-red-200 text-brand-red font-medium py-2 px-3 rounded-md transition duration-300 text-sm">
             <TrashIcon className="w-4 h-4 mr-2" />
             {t('myAdsPage.deleteButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAdCard;