import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Property } from '../types';
import LocationIcon from './icons/LocationIcon';
import BedIcon from './icons/BedIcon';
import BathIcon from './icons/BathIcon';
import AreaIcon from './icons/AreaIcon';
import { useLanguage } from '../contexts/LanguageContext';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import ShareIcon from './icons/ShareIcon';
import HeartIcon from './icons/HeartIcon';
import HeartFilledIcon from './icons/HeartFilledIcon';

interface PropertyCardProps {
  property: Property;
  onViewDetails: (id: number) => void;
  onShare: (id: number) => void;
}

const currencyConfig = {
  pt: { locale: 'pt-BR', currency: 'BRL' },
  en: { locale: 'en-US', currency: 'USD' },
  es: { locale: 'es-ES', currency: 'EUR' },
};

const AUTOPLAY_DELAY = 4000; // 4 seconds
const DRAG_THRESHOLD = 50; // pixels

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onViewDetails, onShare }) => {
  const { language, t } = useLanguage();
  const { locale, currency } = currencyConfig[language as keyof typeof currencyConfig];

  const formattedPrice = typeof property.price === 'number'
    ? new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(property.price)
    : 'Preço a consultar';

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'];
  
  const totalImages = images.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [drag, setDrag] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const timeoutRef = useRef<number | null>(null);
  
  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % totalImages);
  }, [totalImages]);

  useEffect(() => {
    resetTimeout();
    if (isHovered || totalImages <= 1) return;
    timeoutRef.current = window.setTimeout(nextSlide, AUTOPLAY_DELAY);
    return () => resetTimeout();
  }, [currentIndex, isHovered, totalImages, resetTimeout, nextSlide]);
  
  const prevSlide = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + totalImages) % totalImages);
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (totalImages <= 1) return;
    setIsDragging(true);
    setStartX('touches' in e ? e.touches[0].clientX : e.clientX);
    setDrag(0);
  };
  
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || totalImages <= 1) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDrag(currentX - startX);
  };
  
  const handleDragEnd = () => {
    if (!isDragging || totalImages <= 1) return;
    setIsDragging(false);
    if (drag < -DRAG_THRESHOLD) {
      nextSlide();
    } else if (drag > DRAG_THRESHOLD) {
      prevSlide();
    }
    setDrag(0);
  };
  
  const handleClickCapture = (e: React.MouseEvent) => {
    if (Math.abs(drag) > 5) { // If there was a small drag, prevent click
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <div 
      className="w-full bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col border border-gray-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative group/image cursor-pointer overflow-hidden"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onClickCapture={handleClickCapture}
      >
        {/* Container de imagens */}
        <div 
          className="flex transition-transform duration-300 ease-out" 
          style={{ 
            transform: isDragging ? `translateX(calc(-${currentIndex * 100}% + ${drag}px))` : `translateX(-${currentIndex * 100}%)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
          onClick={() => onViewDetails(property.id)}
        >
          {images.map((src, index) => (
            <div key={index} className="relative w-full h-56 flex-shrink-0">
              <img 
                src={src} 
                alt={`${property.title} - Foto ${index + 1}`} 
                className="w-full h-full object-cover bg-gray-200" 
                draggable="false" 
              />
            </div>
          ))}
        </div>
        
        {/* Botão de favorito */}
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 z-20"
        >
          {isFavorite ? (
            <HeartFilledIcon className="w-4 h-4 text-red-600" />
          ) : (
            <HeartIcon className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Badge de tipo */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full z-20">
          {property.operation_type || 'Venda'}
        </div>
        
        {totalImages > 1 && (
            <>
              {/* Setas de navegação */}
              <button
                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/90 p-2 rounded-full text-gray-700 hover:bg-white transition-all duration-300 z-20 opacity-0 group-hover/image:opacity-100 shadow-md"
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/90 p-2 rounded-full text-gray-700 hover:bg-white transition-all duration-300 z-20 opacity-0 group-hover/image:opacity-100 shadow-md"
                aria-label="Next image"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
              {/* Indicadores */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1 z-20">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentIndex === index 
                        ? 'bg-white' 
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          {/* Título */}
          <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
            {property.title}
          </h3>
          
          {/* Localização */}
          <div className="flex items-center text-gray-600 mb-4">
            <LocationIcon className="w-4 h-4 mr-2 text-gray-500" />
            <p className="text-sm">{property.address}</p>
          </div>
          
          {/* Preço */}
          <div className="mb-6">
            <p className="text-2xl font-bold text-red-600">
              {formattedPrice}
            </p>
            {property.operation_type === 'aluguel' && (
              <p className="text-sm text-gray-500">/mês</p>
            )}
          </div>
          
          {/* Características da propriedade */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
              <BedIcon className="w-5 h-5 text-red-600 mb-2" />
              <span className="text-sm font-semibold text-gray-700">{property.bedrooms}</span>
              <span className="text-xs text-gray-500">{t('propertyCard.bedrooms')}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
              <BathIcon className="w-5 h-5 text-blue-900 mb-2" />
              <span className="text-sm font-semibold text-gray-700">{property.bathrooms}</span>
              <span className="text-xs text-gray-500">{t('propertyCard.bathrooms')}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
              <AreaIcon className="w-5 h-5 text-red-600 mb-2" />
              <span className="text-sm font-semibold text-gray-700">{property.area}</span>
              <span className="text-xs text-gray-500">m²</span>
            </div>
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="flex gap-3">
            <button 
              onClick={() => onViewDetails(property.id)}
              className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
            >
                {t('propertyCard.details')}
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onShare(property.id); }}
                className="flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-red-600 font-semibold p-3 rounded-lg transition-all duration-300"
                aria-label="Compartilhar imóvel"
                title="Compartilhar imóvel"
            >
                <ShareIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
