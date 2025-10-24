import React, { useState, useRef, useEffect } from 'react';
import FlagBRIcon from './icons/FlagBRIcon';
import FlagUSIcon from './icons/FlagUSIcon';
import FlagESIcon from './icons/FlagESIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import HamburgerIcon from './icons/HamburgerIcon';
import CloseIcon from './icons/CloseIcon';
import LogoutIcon from './icons/LogoutIcon';
import { useLanguage } from '../contexts/LanguageContext';
import CheckIcon from './icons/CheckIcon';

const languageMap = {
  pt: { name: 'Português', Flag: FlagBRIcon },
  en: { name: 'English', Flag: FlagUSIcon },
  es: { name: 'Español', Flag: FlagESIcon },
};

interface HeaderProps {
  onNavigateToBuy: () => void;
  onNavigateToRent: () => void;
  onNavigateToSeason: () => void;
  navigateToGuideToSell: () => void;
  navigateToDocumentsForSale: () => void;
  navigateHome: () => void;

  isAdminLoggedIn?: boolean;
  onAdminLogout?: () => void;
  onNavigateToAdminDashboard?: () => void;
}

const Header: React.FC<HeaderProps> = ({ navigateHome, onNavigateToBuy, onNavigateToRent, onNavigateToSeason, navigateToGuideToSell, navigateToDocumentsForSale, isAdminLoggedIn, onAdminLogout, onNavigateToAdminDashboard }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isMobileLangMenuOpen, setIsMobileLangMenuOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const { language, changeLanguage, t } = useLanguage();

  const CurrentFlag = languageMap[language as keyof typeof languageMap].Flag;
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* Logo minimalista */}
          <div className="flex-shrink-0">
             <a 
               href="#" 
               onClick={(e) => { e.preventDefault(); navigateHome(); }} 
               className="flex items-center space-x-3 transition-all duration-300"
             >
               <img 
                 src="https://i.postimg.cc/QNJ63Www/logo.png" 
                 alt="Quallity Home Logo" 
                 className="h-10 sm:h-12 w-auto" 
               />
               <div className="block">
                 <h1 className="text-lg sm:text-xl font-bold text-blue-900 leading-tight">
                   Quallity Home
                 </h1>
                 <p className="text-xs text-red-600 font-semibold -mt-1">Portal Imobiliário</p>
               </div>
             </a>
          </div>

          {/* Navegação desktop minimalista */}
          <div className="hidden lg:flex items-center space-x-8">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigateToBuy(); }} 
              className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-300"
            >
              {t('header.nav.buy')}
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigateToRent(); }} 
              className="text-gray-700 hover:text-blue-900 font-medium transition-colors duration-300"
            >
              {t('header.nav.rent')}
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigateToSeason(); }} 
              className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-300"
            >
              {t('header.nav.season')}
            </a>
          </div>

          {/* Ações do lado direito */}
          <div className="flex items-center space-x-4">
            {/* Seletor de idioma minimalista */}
            <div className="relative hidden md:block" ref={langDropdownRef}>
              <button 
                onClick={() => setIsLangDropdownOpen(prev => !prev)} 
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-300"
              >
                <CurrentFlag className="w-5 h-5" />
                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`absolute top-full right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden transition-all duration-200 ${isLangDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                  {Object.entries(languageMap).map(([langCode, { name, Flag }]) => (
                    <button 
                      key={langCode}
                      onClick={() => {
                        changeLanguage(langCode as 'pt' | 'en' | 'es');
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                        language === langCode 
                          ? 'bg-red-50 text-red-600 font-semibold' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Flag className="w-5 h-5 mr-3" />
                      <span className="flex-1 text-left">{name}</span>
                      {language === langCode && <CheckIcon className="w-4 h-4 text-red-600" />}
                    </button>
                  ))}
              </div>
            </div>

            {/* Links admin minimalistas */}
            {isAdminLoggedIn && (
              <div className="hidden lg:flex items-center space-x-3">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); onNavigateToAdminDashboard && onNavigateToAdminDashboard(); }} 
                  className="px-4 py-2 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-all duration-300"
                >
                  Painel Admin
                </a>
                <button 
                  onClick={onAdminLogout} 
                  className="p-2 text-gray-500 hover:text-red-600 rounded-lg transition-all duration-300"
                >
                  <LogoutIcon className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Botão menu mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-300"
            >
              {isMenuOpen ? (
                <CloseIcon className="w-6 h-6 text-gray-700" />
              ) : (
                <HamburgerIcon className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </nav>

        {/* Menu mobile minimalista */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="bg-white border-t border-gray-200">
            <div className="container mx-auto px-4 py-6 space-y-4">
              {/* Links de navegação mobile */}
              <div className="space-y-2">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); onNavigateToBuy(); setIsMenuOpen(false); }} 
                  className="block px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 font-medium"
                >
                  {t('header.nav.buy')}
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); onNavigateToRent(); setIsMenuOpen(false); }} 
                  className="block px-4 py-3 text-gray-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all duration-300 font-medium"
                >
                  {t('header.nav.rent')}
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); onNavigateToSeason(); setIsMenuOpen(false); }} 
                  className="block px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 font-medium"
                >
                  {t('header.nav.season')}
                </a>

              </div>

              {/* Seletor de idioma mobile */}
              <div className="border-t border-gray-200 pt-4">
                <button 
                  onClick={() => setIsMobileLangMenuOpen(!isMobileLangMenuOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <CurrentFlag className="w-5 h-5" />
                    <span className="font-medium">Idioma</span>
                  </div>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isMobileLangMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileLangMenuOpen && (
                  <div className="mt-2 space-y-1 pl-4">
                    {Object.entries(languageMap).map(([langCode, { name, Flag }]) => (
                      <button 
                        key={langCode}
                        onClick={() => {
                          changeLanguage(langCode as 'pt' | 'en' | 'es');
                          setIsMobileLangMenuOpen(false);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                          language === langCode 
                            ? 'bg-red-50 text-red-600 font-semibold' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Flag className="w-4 h-4 mr-3" />
                        <span>{name}</span>
                        {language === langCode && <CheckIcon className="w-4 h-4 ml-auto text-red-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Links admin mobile */}
              {isAdminLoggedIn && (
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); onNavigateToAdminDashboard && onNavigateToAdminDashboard(); setIsMenuOpen(false); }} 
                    className="block px-4 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-all duration-300"
                  >
                    Painel Admin
                  </a>
                  <button 
                    onClick={() => { onAdminLogout && onAdminLogout(); setIsMenuOpen(false); }} 
                    className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                  >
                    <LogoutIcon className="w-5 h-5 mr-3" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;