import React from 'react';
import type { Property } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import LocationIcon from './icons/LocationIcon';
import EyeIcon from './icons/EyeIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import ShareIcon from './icons/ShareIcon';

interface MyAdCardProps {
  property: Property;
  onView: (id: number) => void;
  onEdit: (property: Property) => void;
  onDelete: (id: number) => void;
  onShare: (id: number) => void;
}

const MyAdCard: React.FC<MyAdCardProps> = ({ property, onView, onEdit, onDelete, onShare }) => {
  const { t, language } = useLanguage();
  const currencyConfig = {
    pt: { locale: 'pt-BR', currency: 'BRL' },
    en: { locale: 'en-US', currency: 'USD' },
    es: { locale: 'es-ES', currency: 'EUR' },
  };
  const { locale, currency } = currencyConfig[language as keyof typeof currencyConfig];

  const formattedPrice = typeof property.price === 'number'
    ? new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(property.price)
    : 'Preço a consultar';

  const imageSrc = property.images && property.images.length > 0 ? property.images[0] : 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

  const isInactive = property.status !== 'ativo';

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden flex flex-col sm:flex-row border border-gray-200 transition-all duration-300 hover:shadow-xl ${isInactive ? 'opacity-70' : ''}`}>
      <div className="relative w-full sm:w-48 md:w-64 h-48 sm:h-auto flex-shrink-0">
        <img src={imageSrc} alt={property.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-brand-navy mb-1 leading-tight pr-4">{property.title}</h3>
            <div className={`flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-semibold ${isInactive ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
              <span className={`w-2 h-2 rounded-full ${isInactive ? 'bg-gray-400' : 'bg-green-500'}`}></span>
              <span>{isInactive ? t('myAdsPage.inactiveStatus') : 'Ativo'}</span>
            </div>
          </div>
          <div className="flex items-center text-brand-gray mb-2">
            <LocationIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            <p className="text-sm">{property.address}</p>
          </div>
          <p className="text-xl font-bold text-brand-red mb-4">{formattedPrice}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center border-t border-gray-100 pt-4 mt-2">
          <button onClick={() => onView(property.id)} className="flex-1 min-w-[90px] flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-brand-dark font-medium py-2 px-3 rounded-md transition duration-300 text-sm">
            <EyeIcon className="w-4 h-4 mr-2" />
            {t('myAdsPage.viewButton')}
          </button>
          <button onClick={() => onEdit(property)} className="flex-1 min-w-[90px] flex items-center justify-center bg-brand-navy hover:bg-brand-dark text-white font-medium py-2 px-3 rounded-md transition duration-300 text-sm">
             <PencilIcon className="w-4 h-4 mr-2" />
             {t('myAdsPage.editButton')}
          </button>
          <button 
            onClick={() => onShare(property.id)}
            className="flex-1 min-w-[90px] flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-3 rounded-md transition duration-300 text-sm">
              <ShareIcon className="w-4 h-4 mr-2"/>
              {t('myAdsPage.shareButton')}
          </button>
          <button onClick={() => onDelete(property.id)} className="flex-shrink-0 flex items-center justify-center bg-red-50 hover:bg-red-100 text-brand-red font-medium py-2 px-3 rounded-md transition duration-300 text-sm">
             <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAdCard;
