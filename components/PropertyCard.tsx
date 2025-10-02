
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Property } from '../types';
import LocationIcon from './icons/LocationIcon';
import BedIcon from './icons/BedIcon';
import BathIcon from './icons/BathIcon';
import AreaIcon from './icons/AreaIcon';
import HeartIcon from './icons/HeartIcon';
import HeartFilledIcon from './icons/HeartFilledIcon';
import { useLanguage } from '../contexts/LanguageContext';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

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

const AUTOPLAY_DELAY = 4000; // 4 seconds
const DRAG_THRESHOLD = 50; // pixels

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onViewDetails, isFavorite, onToggleFavorite, onContactClick }) => {
  const { language, t } = useLanguage();
  const { locale, currency } = currencyConfig[language as keyof typeof currencyConfig];

  const formattedPrice = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(property.price);

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'];
  
  const totalImages = images.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [drag, setDrag] = useState(0);

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

  return (
    <div 
      className="w-full bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl flex flex-col border border-gray-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative group cursor-pointer overflow-hidden"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onClickCapture={handleClickCapture}
      >
        <div 
          className="flex transition-transform duration-300 ease-in-out" 
          style={{ 
            transform: isDragging ? `translateX(calc(-${currentIndex * 100}% + ${drag}px))` : `translateX(-${currentIndex * 100}%)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-in-out'
          }}
          onClick={() => onViewDetails(property.id)}
        >
          {images.map((src, index) => (
            <img key={index} src={src} alt={`${property.title} - Foto ${index + 1}`} className="w-full h-56 object-cover aspect-video flex-shrink-0 bg-gray-200" draggable="false" />
          ))}
        </div>
        
        {totalImages > 1 && (
            <>
              {/* Navigation Arrows */}
              <button
                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/70 backdrop-blur-sm p-1 rounded-full text-brand-dark hover:bg-white transition-all duration-200 z-10 opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/70 backdrop-blur-sm p-1 rounded-full text-brand-dark hover:bg-white transition-all duration-200 z-10 opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
              {/* Dots Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-white scale-125' : 'bg-white/50'}`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(property.id);
          }}
          className="absolute top-3 right-3 bg-white/70 backdrop-blur-sm p-2 rounded-full text-brand-red hover:bg-white transition-colors duration-200 z-10"
          aria-label={isFavorite ? t('propertyCard.removeFromFavorites') : t('propertyCard.addToFavorites')}
        >
          {isFavorite ? <HeartFilledIcon className="w-6 h-6" /> : <HeartIcon className="w-6 h-6" />}
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
            {property.owner && (
              <button 
                onClick={() => onContactClick(property)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-brand-dark font-medium py-2 px-4 rounded-md transition duration-300">
                  {t('propertyCard.contact')}
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;