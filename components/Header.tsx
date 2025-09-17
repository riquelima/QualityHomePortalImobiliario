
import React, { useState, useRef, useEffect } from 'react';
import UserIcon from './icons/UserIcon';
import FlagBRIcon from './icons/FlagBRIcon';
import FlagUSIcon from './icons/FlagUSIcon';
import FlagESIcon from './icons/FlagESIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import HamburgerIcon from './icons/HamburgerIcon';
import CloseIcon from './icons/CloseIcon';
import AdsIcon from './icons/AdsIcon';
import BellIcon from './icons/BellIcon';
import HeartIcon from './icons/HeartIcon';
import ChatIcon from './icons/ChatIcon';
import LogoutIcon from './icons/LogoutIcon';
import { useLanguage } from '../contexts/LanguageContext';
import type { User } from '../types';

const languageMap = {
  pt: { name: 'Português', Flag: FlagBRIcon },
  en: { name: 'English', Flag: FlagUSIcon },
  es: { name: 'Español', Flag: FlagESIcon },
};

interface HeaderProps {
  onPublishAdClick: () => void;
  onAccessClick: () => void;
  user: User | null;
  onLogout: () => void;
  onNavigateToFavorites: () => void;
  onNavigateToChatList: () => void;
}

// Helper function outside the component
const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

const Header: React.FC<HeaderProps> = ({ onPublishAdClick, onAccessClick, user, onLogout, onNavigateToFavorites, onNavigateToChatList }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const { language, changeLanguage, t } = useLanguage();

  const CurrentFlag = languageMap[language as keyof typeof languageMap].Flag;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
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
        <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center relative">
          {/* Logo */}
          <a href="#" onClick={(e) => { e.preventDefault(); window.location.reload(); }} className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 transform transition-transform duration-300 hover:scale-105 z-10">
            <img src="https://i.imgur.com/FuxDdyF.png" alt="Quality Home Logo" className="h-16 sm:h-20" />
          </a>

          {/* Desktop Navigation Links */}
          <div className="flex-1">
            <div className="hidden md:flex items-center space-x-6 text-sm pl-80 lg:pl-96">
              <a href="#" className="text-brand-dark hover:text-brand-red transition duration-300">{t('header.nav.owners')}</a>
              <a href="#" className="text-brand-dark hover:text-brand-red transition duration-300">{t('header.nav.search')}</a>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 sm:space-x-4 text-sm">
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
            {user ? (
              <div className="relative" ref={userDropdownRef}>
                <button onClick={() => setIsUserDropdownOpen(prev => !prev)} className="flex items-center space-x-2">
                  {user.picture ? (
                      <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-gray text-white font-bold text-sm">
                          {getInitials(user.name)}
                      </span>
                  )}
                  <span className="hidden md:inline font-medium">{user.name.split(' ')[0]}</span>
                  <ChevronDownIcon className="w-4 h-4 text-brand-gray" />
                </button>
                {isUserDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 sm:w-72 bg-white rounded-md shadow-lg border z-20">
                    <div className="px-4 py-4 border-b flex items-center space-x-3">
                      {user.picture ? (
                          <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                      ) : (
                          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-brand-gray text-white font-bold">
                              {getInitials(user.name)}
                          </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-brand-dark truncate">{user.name}</p>
                        <a href="#" className="text-xs text-brand-red hover:underline">{t('header.myAccount')}</a>
                      </div>
                    </div>
                    <nav className="py-2">
                      <a href="#" className="flex items-center px-4 py-2 text-sm text-brand-dark hover:bg-gray-100">
                          <AdsIcon className="w-5 h-5 mr-3 text-brand-gray" />
                          <span>{t('header.ads')}</span>
                      </a>
                      <a href="#" className="flex items-center px-4 py-2 text-sm text-brand-dark hover:bg-gray-100">
                          <BellIcon className="w-5 h-5 mr-3 text-brand-gray" />
                          <span>{t('header.savedSearches')}</span>
                      </a>
                      <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToFavorites(); setIsUserDropdownOpen(false); }} className="flex items-center px-4 py-2 text-sm text-brand-dark hover:bg-gray-100">
                          <HeartIcon className="w-5 h-5 mr-3 text-brand-gray" />
                          <span>{t('header.favorites')}</span>
                      </a>
                      <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToChatList(); setIsUserDropdownOpen(false); }} className="flex items-center px-4 py-2 text-sm text-brand-dark hover:bg-gray-100">
                          <ChatIcon className="w-5 h-5 mr-3 text-brand-gray" />
                          <span>{t('header.chat')}</span>
                      </a>
                    </nav>
                    <div className="border-t">
                      <button 
                        onClick={() => {
                          onLogout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-sm text-brand-dark hover:bg-gray-100"
                      >
                        <LogoutIcon className="w-5 h-5 mr-3 text-brand-gray" />
                        <span>{t('header.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={onAccessClick} className="flex items-center space-x-2 hover:text-brand-red transition duration-300">
                <UserIcon className="w-6 h-6" />
                <span className="hidden md:inline">{t('header.access')}</span>
              </button>
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
