import React from 'react';
import type { Property } from '../types';
import { PropertyStatus } from '../types';
import LocationIcon from './icons/LocationIcon';
import BedIcon from './icons/BedIcon';
import BathIcon from './icons/BathIcon';
import AreaIcon from './icons/AreaIcon';

interface PropertyCardProps {
  property: Property;
}

const statusColorMap = {
  [PropertyStatus.New]: 'bg-brand-status-green',
  [PropertyStatus.Updated]: 'bg-brand-status-orange',
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(property.price);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl flex flex-col border border-gray-200">
      <div className="relative">
        <img src={property.image} alt={property.title} className="w-full h-56 object-cover aspect-video" />
        {property.status && (
          <span className={`absolute top-3 right-3 text-white text-xs font-bold px-3 py-1 rounded-full ${statusColorMap[property.status]}`}>
            {property.status}
          </span>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-brand-dark mb-2">{property.title}</h3>
          <div className="flex items-center text-brand-gray mb-4">
            <LocationIcon className="w-4 h-4 mr-2" />
            <p className="text-sm">{property.address}</p>
          </div>
          <p className="text-2xl font-bold text-brand-purple mb-4">{formattedPrice}</p>
          <div className="grid grid-cols-3 gap-4 text-center border-t border-b border-gray-200 py-4 mb-4">
            <div className="flex flex-col items-center">
              <BedIcon className="w-5 h-5 mb-1 text-brand-gray" />
              <span className="text-sm text-brand-dark">{property.bedrooms} Quartos</span>
            </div>
            <div className="flex flex-col items-center">
              <BathIcon className="w-5 h-5 mb-1 text-brand-gray" />
              <span className="text-sm text-brand-dark">{property.bathrooms} Ban.</span>
            </div>
            <div className="flex flex-col items-center">
              <AreaIcon className="w-5 h-5 mb-1 text-brand-gray" />
              <span className="text-sm text-brand-dark">{property.area} m²</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
            <button className="w-full bg-brand-purple hover:opacity-90 text-white font-medium py-2 px-4 rounded-md transition duration-300">
                Detalhes
            </button>
            <button className="w-full bg-gray-200 hover:bg-gray-300 text-brand-dark font-medium py-2 px-4 rounded-md transition duration-300">
                Contato
            </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;