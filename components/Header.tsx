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
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
             <a href="#" onClick={(e) => { e.preventDefault(); navigateHome(); }} className="block transition-transform duration-300 hover:scale-105">
               <img src="https://i.postimg.cc/QNJ63Www/logo.png" alt="Quallity Home Logo" className="h-16 sm:h-20" />
             </a>
          </div>

          {/* Desktop Navigation Links (Centered) */}
          <div className="hidden md:flex flex-grow items-center justify-center space-x-6 text-sm">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToBuy(); }} className="text-brand-dark hover:text-brand-red transition duration-300 py-4 border-b-2 border-transparent hover:border-brand-red">{t('header.nav.buy')}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToRent(); }} className="text-brand-dark hover:text-brand-red transition duration-300 py-4 border-b-2 border-transparent hover:border-brand-red">{t('header.nav.rent')}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToSeason(); }} className="text-brand-dark hover:text-brand-red transition duration-300 py-4 border-b-2 border-transparent hover:border-brand-red">{t('header.nav.season')}</a>
          </div>

          {/* Right side actions */}
          <div className="flex-shrink-0 flex items-center space-x-2 sm:space-x-4 text-sm">
            {/* Language Selector */}
            <div className="relative hidden md:block" ref={langDropdownRef}>
              <button onClick={() => setIsLangDropdownOpen(prev => !prev)} className="flex items-center space-x-1">
                <CurrentFlag className="w-6 h-auto" />
                <ChevronDownIcon className="w-4 h-4 text-brand-gray" />
              </button>
              <div className={`absolute top-full right-0 mt-2 w-40 bg-white rounded-md shadow-lg border z-20 transition-all duration-200 ease-out transform origin-top-right ${isLangDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                  {Object.entries(languageMap).map(([langCode, { name, Flag }]) => (
                    <button 
                      key={langCode}
                      onClick={() => {
                        changeLanguage(langCode as 'pt' | 'en' | 'es');
                        setIsLangDropdownOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-brand-dark hover:bg-gray-100"
                    >
                      <Flag className="w-5 h-auto mr-3" />
                      <span>{name}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Admin Links */}
            {isAdminLoggedIn && (
              <div className="hidden md:flex items-center space-x-4">
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToAdminDashboard && onNavigateToAdminDashboard(); }} className="font-semibold text-brand-dark hover:text-brand-red transition duration-300">Painel</a>
                <button onClick={onAdminLogout} className="text-brand-gray hover:text-brand-red transition duration-300">Sair</button>
              </div>
            )}


            {/* Hamburger Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(true)} aria-label={t('header.openMenu')}>
              <HamburgerIcon className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </header>
      
      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      ></div>

      <aside 
        className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 id="mobile-menu-title" className="text-lg font-bold text-brand-navy">{t('header.menuTitle')}</h2>
          <button onClick={() => setIsMenuOpen(false)} aria-label={t('header.closeMenu')}>
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex flex-col p-4 space-y-2">
           <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToBuy(); setIsMenuOpen(false); }} className="w-full text-left flex items-center text-brand-dark hover:text-brand-red transition duration-300 p-3 text-lg">{t('header.nav.buy')}</a>
           <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToRent(); setIsMenuOpen(false); }} className="w-full text-left flex items-center text-brand-dark hover:text-brand-red transition duration-300 p-3 text-lg">{t('header.nav.rent')}</a>
           <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToSeason(); setIsMenuOpen(false); }} className="w-full text-left flex items-center text-brand-dark hover:text-brand-red transition duration-300 p-3 text-lg">{t('header.nav.season')}</a>
          <hr className="my-2" />

          {/* Admin links for mobile */}
          {isAdminLoggedIn && (
            <>
               <button onClick={() => { onNavigateToAdminDashboard && onNavigateToAdminDashboard(); setIsMenuOpen(false); }} className="w-full text-left flex items-center text-brand-dark hover:text-brand-red transition duration-300 p-3 text-lg">
                  Painel de Anúncios
              </button>
              <hr className="my-2" />
              <button
                onClick={() => {
                  onAdminLogout && onAdminLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left flex items-center text-brand-dark hover:text-brand-red transition duration-300 p-3 text-lg"
              >
                <LogoutIcon className="w-6 h-6 mr-3 text-brand-gray" />
                <span>{t('header.logout')}</span>
              </button>
            </>
          )}
          
          {/* Mobile Language Selector */}
          <div>
            <button
                onClick={() => setIsMobileLangMenuOpen(prev => !prev)}
                className="w-full flex justify-between items-center text-brand-dark hover:text-brand-red transition duration-300 p-3"
            >
                <span className="flex items-center space-x-3 text-lg">
                    <CurrentFlag className="w-6 h-auto" />
                    <span>{languageMap[language as keyof typeof languageMap].name}</span>
                </span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isMobileLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMobileLangMenuOpen ? 'max-h-screen' : 'max-h-0'}`}>
                <div className="pl-4 mt-2 space-y-2 text-lg">
                    {Object.entries(languageMap).map(([langCode, { name, Flag }]) => (
                        <button
                            key={langCode}
                            onClick={() => {
                                changeLanguage(langCode as 'pt' | 'en' | 'es');
                                setIsMobileLangMenuOpen(false);
                            }}
                            className={`w-full flex items-center p-2 rounded-md transition-colors ${language === langCode ? 'text-brand-red bg-red-50' : 'text-brand-gray hover:text-brand-red hover:bg-gray-100'}`}
                        >
                            <Flag className="w-5 h-auto mr-3" />
                            <span>{name}</span>
                            {language === langCode && <CheckIcon className="w-5 h-5 ml-auto text-brand-red" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
        </nav>
      </aside>
    </>
  );
};

export default Header;