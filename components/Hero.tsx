
import React, { useState, useRef, useEffect } from 'react';
import SearchIcon from './icons/SearchIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import DrawIcon from './icons/DrawIcon';
import GeoIcon from './icons/GeoIcon';
import { GoogleGenAI } from '@google/genai';
import { useLanguage } from '../contexts/LanguageContext';

interface HeroProps {
  onDrawOnMapClick: () => void;
  onSearchNearMe: () => void;
  onSearchSubmit: (query: string) => void;
  deviceLocation: { lat: number; lng: number } | null;
  activeTab: 'venda' | 'aluguel' | 'temporada';
  onTabChange: (tab: 'venda' | 'aluguel' | 'temporada') => void;
  isSearchingNearMe: boolean;
}

const ai = new GoogleGenAI({ apiKey: 'AIzaSyCIo_bzvu_Uh0XbXiGYJ7zqni9dz6OTjlU' });

const generateContentWithRetry = async (prompt: string, maxRetries = 3) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const model = ai.getGenerativeModel({ model: 'gemini-pro' });
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return text;
    } catch (error) {
      attempt++;
      console.warn(`Gemini API call attempt ${attempt} failed:`, error);
      if (attempt >= maxRetries) {
        console.error("Gemini API call failed after all retries.");
        throw error;
      }
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Failed to generate content after multiple retries.");
};

const Hero: React.FC<HeroProps> = ({ onDrawOnMapClick, onSearchNearMe, onSearchSubmit, deviceLocation, activeTab, onTabChange, isSearchingNearMe }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Casa');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  
  // Estados para título e descrição gerados pela IA
  const [heroTitle, setHeroTitle] = useState('Encontre seu lar dos sonhos');
  const [heroDescription, setHeroDescription] = useState('Explore nossa seleção exclusiva de imóveis que combinam luxo, conforto e localização privilegiada.');
  const [isLoadingTitle, setIsLoadingTitle] = useState(false);
  const [isLoadingDescription, setIsLoadingDescription] = useState(false);

  const propertyOptions = {
    venda: ['Casa', 'Apartamento', 'Área', 'Sítio', 'Fazenda', 'Escritório', 'Galpão'],
    aluguel: ['Casa', 'Apartamento', 'Galpão'],
    temporada: ['Casa', 'Apartamento'],
  };

  // Função para gerar título dinâmico
  const generateTitle = async () => {
    setIsLoadingTitle(true);
    try {
      const prompt = `Gere um título atrativo e curto para um portal imobiliário. 
      O título deve:
      - Ter no máximo 6 palavras
      - Ser inspirador e relacionado a encontrar imóveis
      - Caber em uma única linha
      - Ser em português brasileiro
      - Não usar aspas ou caracteres especiais
      
      Exemplos de estilo: "Encontre seu lar dos sonhos", "Seu novo lar te espera", "Descubra o imóvel ideal"
      
      Responda apenas com o título, sem explicações.`;
      
      const generatedTitle = await generateContentWithRetry(prompt);
      if (generatedTitle && generatedTitle.trim()) {
        setHeroTitle(generatedTitle.trim().replace(/["']/g, ""));
      }
    } catch (error) {
      console.error("Erro ao gerar título:", error);
      // Mantém o título atual se houver erro
    } finally {
      setIsLoadingTitle(false);
    }
  };

  // Função para gerar descrição dinâmica
  const generateDescription = async () => {
    setIsLoadingDescription(true);
    try {
      const prompt = `Gere uma descrição curta e atrativa para um portal imobiliário.
      A descrição deve:
      - Ter no máximo 15 palavras
      - Caber em no máximo duas linhas
      - Ser inspiradora e relacionada a imóveis
      - Ser em português brasileiro
      - Não usar aspas ou caracteres especiais
      - Mencionar qualidade, conforto ou localização
      
      Exemplos de estilo: "Explore nossa seleção exclusiva de imóveis que combinam luxo, conforto e localização privilegiada", "Descubra propriedades únicas com a melhor localização e acabamento premium"
      
      Responda apenas com a descrição, sem explicações.`;
      
      const generatedDescription = await generateContentWithRetry(prompt);
      if (generatedDescription && generatedDescription.trim()) {
        setHeroDescription(generatedDescription.trim().replace(/["']/g, ""));
      }
    } catch (error) {
      console.error("Erro ao gerar descrição:", error);
      // Mantém a descrição atual se houver erro
    } finally {
      setIsLoadingDescription(false);
    }
  };

  // Efeito para gerar conteúdo quando a página carrega ou é atualizada
  useEffect(() => {
    generateTitle();
    generateDescription();
  }, []); // Executa apenas uma vez quando o componente monta

  // Reset property type selection when tab changes
  useEffect(() => {
    const availableTypes = propertyOptions[activeTab];
    if (!availableTypes.includes(selectedType)) {
      setSelectedType(availableTypes[0]);
    }
  }, [activeTab, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(`${selectedType} ${searchQuery.trim()}`);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white">
      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          {/* Hero title gerado pela IA */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-900 leading-tight mb-4">
              {isLoadingTitle ? (
                <span className="inline-flex items-center">
                  <span>Encontre seu</span>
                  <span className="ml-3 w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                </span>
              ) : (
                heroTitle
              )}
            </h1>
            {/* Descrição gerada pela IA */}
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {isLoadingDescription ? (
                <span className="inline-flex items-center">
                  <span>Carregando descrição</span>
                  <span className="ml-2 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                </span>
              ) : (
                heroDescription
              )}
            </p>
          </div>

          {/* Tabs minimalistas */}
          <div className="flex justify-center mb-8 sm:mb-12">
            <div className="flex bg-gray-100 rounded-xl p-1">
              {(['venda', 'aluguel', 'temporada'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  className={`px-6 sm:px-8 py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ${
                    activeTab === tab
                      ? tab === 'aluguel' 
                        ? 'bg-blue-900 text-white'
                        : 'bg-red-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t(`hero.tabs.${tab}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Formulário de busca minimalista */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Seletor de tipo */}
                <div className="relative flex-shrink-0" ref={searchContainerRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full lg:w-auto flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-300 hover:border-gray-300 min-w-[160px]"
                  >
                    <span className="font-medium text-gray-700">{selectedType}</span>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 lg:right-auto lg:w-48 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
                      {propertyOptions[activeTab].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setSelectedType(type);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200 text-gray-700"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Campo de busca */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('hero.searchPlaceholder')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all duration-300 text-gray-700 placeholder-gray-400"
                  />
                </div>

                {/* Botão de busca */}
                <button
                  type="submit"
                  className="flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-300"
                >
                  <SearchIcon className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">{t('hero.searchButton')}</span>
                  <span className="sm:hidden">Buscar</span>
                </button>
              </div>
            </form>

            {/* Botões de ação minimalistas */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
              <button
                onClick={onDrawOnMapClick}
                className="flex items-center justify-center px-6 py-3 border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white rounded-xl font-semibold transition-all duration-300"
              >
                <DrawIcon className="w-5 h-5 mr-3" />
                {t('hero.drawOnMap')}
              </button>

              <button
                onClick={onSearchNearMe}
                disabled={isSearchingNearMe}
                className="flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 hover:border-blue-900 hover:text-blue-900 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearchingNearMe ? (
                  <>
                    <div className="w-5 h-5 mr-3 border-2 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
                    {t('hero.searching')}
                  </>
                ) : (
                  <>
                    <GeoIcon className="w-5 h-5 mr-3" />
                    {t('hero.searchNearMe')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
