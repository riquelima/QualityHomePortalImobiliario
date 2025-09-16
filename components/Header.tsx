
import React, { useState, useRef, useEffect } from 'react';
import UserIcon from './icons/UserIcon';
import FlagBRIcon from './icons/FlagBRIcon';
import FlagUSIcon from './icons/FlagUSIcon';
import FlagESIcon from './icons/FlagESIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import HamburgerIcon from './icons/HamburgerIcon';
import CloseIcon from './icons/CloseIcon';
import { useLanguage } from '../contexts/LanguageContext';

const languageMap = {
  pt: { name: 'Português', Flag: FlagBRIcon },
  en: { name: 'English', Flag: FlagUSIcon },
  es: { name: 'Español', Flag: FlagESIcon },
};

interface HeaderProps {
  onPublishAdClick: () => void;
  onAccessClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onPublishAdClick, onAccessClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
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
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center relative">
          {/* Logo */}
          <a href="#" className="absolute left-6 top-1/2 -translate-y-1/2 transform transition-transform duration-300 hover:scale-105 z-10">
            <img src="https://i.imgur.com/FuxDdyF.png" alt="Quality Home Logo" className="h-20" />
          </a>

          {/* Desktop Navigation Links */}
          <div className="flex-1">
            <div className="hidden md:flex items-center space-x-6 text-sm pl-96">
              <a href="#" className="text-brand-dark hover:text-brand-red transition duration-300">{t('header.nav.owners')}</a>
              <a href="#" className="text-brand-dark hover:text-brand-red transition duration-300">{t('header.nav.search')}</a>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4 text-sm">
            {/* Desktop "Publique" button */}
            <button 
              onClick={onPublishAdClick}
              className="hidden md:block px-4 py-2 border border-brand-gray rounded-md hover:border-brand-dark transition duration-300"
            >
              {t('header.publishAd')}
            </button>
            
            {/* Language Selector */}
            <div className="relative" ref={langDropdownRef}>
              <button onClick={() => setIsLangDropdownOpen(prev => !prev)} className="flex items-center space-x-1">
                <CurrentFlag className="w-6 h-auto" />
                <ChevronDownIcon className="w-4 h-4 text-brand-gray" />
              </button>
              {isLangDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-md shadow-lg border z-20">
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
              )}
            </div>
            
            {/* User/Login Link */}
            <button onClick={onAccessClick} className="flex items-center space-x-2 hover:text-brand-red transition duration-300">
              <UserIcon className="w-6 h-6" />
              <span className="hidden md:inline">{t('header.access')}</span>
            </button>

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
        <nav className="flex flex-col p-4 space-y-4 text-lg">
          <a href="#" className="text-brand-dark hover:text-brand-red transition duration-300">{t('header.nav.owners')}</a>
          <a href="#" className="text-brand-dark hover:text-brand-red transition duration-300">{t('header.nav.search')}</a>
          <hr className="my-4" />
          <button 
            onClick={onPublishAdClick}
            className="w-full text-center px-4 py-2 bg-brand-red text-white rounded-md hover:opacity-90 transition duration-300"
          >
            {t('header.publishAd')}
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Header;
