

import React, { useState, useRef, useEffect } from 'react';
import SearchIcon from './icons/SearchIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import DrawIcon from './icons/DrawIcon';
import GeoIcon from './icons/GeoIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface HeroProps {
  onDrawOnMapClick: () => void;
  onSearchNearMe: (location: { lat: number, lng: number }) => void;
  onGeolocationError: () => void;
  onSearchSubmit: (query: string) => void;
}


const Hero: React.FC<HeroProps> = ({ onDrawOnMapClick, onSearchNearMe, onGeolocationError, onSearchSubmit }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchNearMe = () => {
    if (!navigator.geolocation) {
      onGeolocationError();
      return;
    }
    setIsLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setIsLoadingGeo(false);
        setIsDropdownOpen(false);
        onSearchNearMe({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLoadingGeo(false);
        onGeolocationError();
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  return (
    <div className="p-4 bg-white sticky top-[68px] md:top-auto md:relative z-30 shadow-sm md:shadow-none">
      <form onSubmit={handleSearchSubmit}>
        <div className="relative" ref={searchContainerRef}>
          <SearchIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10"/>
          <input 
            type="search" 
            placeholder={t('hero.locationPlaceholder')}
            className="w-full pl-11 pr-4 py-3 rounded-full text-brand-dark bg-brand-light-gray border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-red"
            onFocus={() => setIsDropdownOpen(true)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isDropdownOpen && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 text-left mt-2">
               <button 
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  onDrawOnMapClick();
                }}
                className="w-full flex items-center px-4 py-3 text-brand-dark hover:bg-gray-100 transition-colors duration-200"
              >
                <DrawIcon className="w-5 h-5 mr-3 text-brand-gray"/>
                <span>{t('hero.drawOnMap')}</span>
              </button>
              <button 
                type="button"
                onClick={handleSearchNearMe}
                disabled={isLoadingGeo}
                className="w-full flex items-center px-4 py-3 text-brand-dark hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait"
              >
                <GeoIcon className="w-5 h-5 mr-3 text-brand-gray"/>
                <span>{isLoadingGeo ? t('hero.loadingLocation') : t('hero.searchNearMe')}</span>
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default Hero;