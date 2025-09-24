

import React, { useState, useRef, useEffect } from 'react';
import SearchIcon from './icons/SearchIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import DrawIcon from './icons/DrawIcon';
import GeoIcon from './icons/GeoIcon';
import { GoogleGenAI } from '@google/genai';
import { useLanguage } from '../contexts/LanguageContext';

interface HeroProps {
  onDrawOnMapClick: () => void;
  onSearchNearMe: (location: { lat: number, lng: number }) => void;
  onGeolocationError: () => void;
  onSearchSubmit: (query: string) => void;
}

// Helper function for mock slogan generation
const mockHeroTitleGeneration = (): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const mockTitles = [
                "O lugar certo para o imóvel certo.",
                "Sua nova jornada começa aqui.",
                "Encontre o lar dos seus sonhos.",
                "Qualidade e confiança em cada anúncio.",
                "O seu futuro endereço está aqui."
            ];
            const randomIndex = Math.floor(Math.random() * mockTitles.length);
            resolve(mockTitles[randomIndex]);
        }, 800);
    });
};

const Hero: React.FC<HeroProps> = ({ onDrawOnMapClick, onSearchNearMe, onGeolocationError, onSearchSubmit }) => {
  const [activeTab, setActiveTab] = useState('comprar');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  
  const [heroTitle, setHeroTitle] = useState(t('hero.defaultTitle'));
  const [isLoadingTitle, setIsLoadingTitle] = useState(true);

  // Efeito para gerar título dinâmico com a IA do Gemini
  useEffect(() => {
    let isCancelled = false;

    setHeroTitle(t('hero.defaultTitle'));
    setIsLoadingTitle(true);

    const generateTitle = async () => {
      try {
        if (typeof process === 'undefined' || !process.env.API_KEY) {
            console.warn("Chave de API do Gemini não configurada. Usando slogan simulado para demonstração.");
            const text = await mockHeroTitleGeneration();
            if (!isCancelled) {
                setHeroTitle(text);
            }
            return;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = t('hero.geminiPrompt');
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (isCancelled) return;

        const text = response.text.trim();
        if (text) {
          setHeroTitle(text.replace(/["']/g, ""));
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Erro ao gerar título com a IA:", error);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingTitle(false);
        }
      }
    };

    generateTitle();

    return () => {
      isCancelled = true;
    };
  }, [t, language]);


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
    <div 
      className="relative h-[550px] w-full flex items-center justify-center text-center bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}
    >
      <div className="relative z-20 p-6 md:p-8 bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl w-11/12 max-w-4xl">
        <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-navy mb-6 transition-opacity duration-300 ${isLoadingTitle ? 'opacity-75 animate-pulse' : 'opacity-100'}`}>
          {heroTitle}
        </h1>
        
        <div className="bg-white p-2 rounded-lg">
          <div className="flex flex-wrap border-b mb-4">
            <button 
              onClick={() => setActiveTab('comprar')}
              className={`px-4 sm:px-6 py-2 text-base sm:text-lg font-medium transition-colors duration-300 ${activeTab === 'comprar' ? 'border-b-4 border-brand-red text-brand-dark' : 'text-brand-gray'}`}
            >
              {t('hero.tabs.buy')}
            </button>
            <button 
              onClick={() => setActiveTab('alugar')}
              className={`px-4 sm:px-6 py-2 text-base sm:text-lg font-medium transition-colors duration-300 ${activeTab === 'alugar' ? 'border-b-4 border-brand-red text-brand-dark' : 'text-brand-gray'}`}
            >
              {t('hero.tabs.rent')}
            </button>
            <button 
              onClick={() => setActiveTab('temporada')}
              className={`px-4 sm:px-6 py-2 text-base sm:text-lg font-medium transition-colors duration-300 ${activeTab === 'temporada' ? 'border-b-4 border-brand-red text-brand-dark' : 'text-brand-gray'}`}
            >
              {t('hero.tabs.season')}
            </button>
          </div>

          <form className="flex flex-col md:flex-row items-center gap-2" onSubmit={handleSearchSubmit}>
            <div className="relative w-full md:w-auto">
              <select className="w-full md:w-52 appearance-none bg-white border border-gray-300 rounded-md px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-red text-brand-dark">
                <option>{t('hero.propertyTypes.housesAndApts')}</option>
                <option>{t('hero.propertyTypes.offices')}</option>
                <option>{t('hero.propertyTypes.garages')}</option>
              </select>
              <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative w-full md:flex-grow" ref={searchContainerRef}>
              <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10"/>
              <input 
                type="text" 
                placeholder={t('hero.locationPlaceholder')}
                className="w-full px-10 py-3 rounded-md text-brand-dark border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red"
                onFocus={() => setIsDropdownOpen(true)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-md shadow-lg z-20 text-left">
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
            <button 
              type="submit"
              className="w-full md:w-auto bg-brand-red hover:opacity-90 text-white font-bold py-3 px-10 rounded-md transition duration-300"
            >
              {t('hero.searchButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Hero;