import React, { useState, useRef, useEffect } from 'react';
import SearchIcon from './icons/SearchIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import DrawIcon from './icons/DrawIcon';
import GeoIcon from './icons/GeoIcon';

interface HeroProps {
  onDrawOnMapClick: () => void;
  onSearchNearMe: (location: { lat: number, lng: number }) => void;
}

const Hero: React.FC<HeroProps> = ({ onDrawOnMapClick, onSearchNearMe }) => {
  const [activeTab, setActiveTab] = useState('comprar');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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
      alert('A geolocalização não é suportada por este navegador.');
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
      () => {
        setIsLoadingGeo(false);
        alert('Não foi possível obter a sua localização. Por favor, verifique as permissões do seu navegador.');
      }
    );
  };

  return (
    <div 
      className="relative h-[550px] w-full flex items-center justify-center text-center bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}
    >
      <div className="relative z-20 p-6 md:p-8 bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl w-11/12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-brand-navy mb-6">
          Tudo começa hoje
        </h1>
        
        <div className="bg-white p-2 rounded-lg">
          <div className="flex border-b mb-4">
            <button 
              onClick={() => setActiveTab('comprar')}
              className={`px-6 py-2 text-lg font-medium transition-colors duration-300 ${activeTab === 'comprar' ? 'border-b-4 border-brand-red text-brand-dark' : 'text-brand-gray'}`}
            >
              Comprar
            </button>
            <button 
              onClick={() => setActiveTab('alugar')}
              className={`px-6 py-2 text-lg font-medium transition-colors duration-300 ${activeTab === 'alugar' ? 'border-b-4 border-brand-red text-brand-dark' : 'text-brand-gray'}`}
            >
              Alugar
            </button>
            <button 
              onClick={() => setActiveTab('temporada')}
              className={`px-6 py-2 text-lg font-medium transition-colors duration-300 ${activeTab === 'temporada' ? 'border-b-4 border-brand-red text-brand-dark' : 'text-brand-gray'}`}
            >
              Temporada
            </button>
          </div>

          <form className="flex flex-col md:flex-row items-center gap-2">
            <div className="relative w-full md:w-auto">
              <select className="w-full md:w-52 appearance-none bg-white border border-gray-300 rounded-md px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-red text-brand-dark">
                <option>Casas e apartamentos</option>
                <option>Escritórios</option>
                <option>Garagens</option>
              </select>
              <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative w-full md:flex-grow" ref={searchContainerRef}>
              <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10"/>
              <input 
                type="text" 
                placeholder="Digite a localização (bairro, cidade, região)"
                className="w-full px-10 py-3 rounded-md text-brand-dark border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red"
                onFocus={() => setIsDropdownOpen(true)}
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
                    <span>Desenha a tua zona</span>
                  </button>
                  <button 
                    type="button"
                    onClick={handleSearchNearMe}
                    disabled={isLoadingGeo}
                    className="w-full flex items-center px-4 py-3 text-brand-dark hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait"
                  >
                    <GeoIcon className="w-5 h-5 mr-3 text-brand-gray"/>
                    <span>{isLoadingGeo ? 'Obtendo localização...' : 'Pesquisar perto de ti'}</span>
                  </button>
                </div>
              )}
            </div>
            <button 
              type="submit"
              className="w-full md:w-auto bg-brand-red hover:opacity-90 text-white font-bold py-3 px-10 rounded-md transition duration-300"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Hero;