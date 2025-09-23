
import React, { useState, useRef, useEffect } from 'react';
import UserIcon from './icons/UserIcon';
import FlagBRIcon from './icons/FlagBRIcon';
import FlagUSIcon from './icons/FlagUSIcon';
import FlagESIcon from './icons/FlagESIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import HamburgerIcon from './icons/HamburgerIcon';
import CloseIcon from './icons/CloseIcon';
import AdsIcon from './icons/AdsIcon';
import HeartIcon from './icons/HeartIcon';
import ChatIcon from './icons/ChatIcon';
import LogoutIcon from './icons/LogoutIcon';
import { useLanguage } from '../contexts/LanguageContext';
import type { User, Profile } from '../types';
import CheckIcon from './icons/CheckIcon';
import SearchIcon from './icons/SearchIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

const languageMap = {
  pt: { name: 'Português', Flag: FlagBRIcon },
  en: { name: 'English', Flag: FlagUSIcon },
  es: { name: 'Español', Flag: FlagESIcon },
};

interface HeaderProps {
  onPublishAdClick: () => void;
  onAccessClick: () => void;
  user: User | null;
  profile: Profile | null;
  onLogout: () => void;
  onNavigateToFavorites: () => void;
  onNavigateToChatList: () => void;
  onNavigateToMyAds: () => void;
  onNavigateToAllListings: () => void;
  hasUnreadMessages: boolean;
  navigateToGuideToSell: () => void;
  navigateToDocumentsForSale: () => void;
  navigateHome: () => void;
  onSearchSubmit: (query: string) => void;
}

const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

const Header: React.FC<HeaderProps> = ({ navigateHome, onPublishAdClick, onAccessClick, user, profile, onLogout, onNavigateToFavorites, onNavigateToChatList, onNavigateToMyAds, onNavigateToAllListings, hasUnreadMessages, navigateToGuideToSell, navigateToDocumentsForSale, onSearchSubmit }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const userName = profile?.nome_completo || user?.email || 'Usuário';
  const userPicture = profile?.url_foto_perfil || user?.user_metadata?.picture;
  const userInitials = getInitials(userName);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 150);
    }
  }, [isSearchExpanded]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
      setSearchQuery('');
      setIsSearchExpanded(false);
    }
  };


  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Desktop Header */}
        <nav className="hidden md:flex justify-between items-center py-2">
          <a href="#" onClick={(e) => { e.preventDefault(); navigateHome(); }} className="transition-transform duration-300 hover:scale-105">
            <img src="https://i.imgur.com/FuxDdyF.png" alt="Quality Home Logo" className="h-20" />
          </a>
          <div className="flex items-center space-x-6 text-sm">
             <a href="#" onClick={(e) => {e.preventDefault(); onNavigateToAllListings()}} className="text-brand-dark hover:text-brand-red transition duration-300 font-medium">{t('header.nav.search')}</a>
             <a href="#" onClick={(e) => {e.preventDefault(); navigateToGuideToSell()}} className="text-brand-dark hover:text-brand-red transition duration-300 font-medium">{t('header.ownersDropdown.sell.guide')}</a>
             <a href="#" onClick={(e) => {e.preventDefault(); navigateToDocumentsForSale()}} className="text-brand-dark hover:text-brand-red transition duration-300 font-medium">{t('header.ownersDropdown.sell.documents')}</a>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <button 
              onClick={onPublishAdClick}
              className="px-4 py-2 border border-brand-gray rounded-full hover:border-brand-dark transition duration-300 font-medium"
            >
              {t('header.publishAd')}
            </button>
            {user ? (
               <div className="relative" ref={userDropdownRef}>
                <button onClick={() => setIsUserDropdownOpen(prev => !prev)} className="flex items-center space-x-2 border rounded-full p-1 pr-2 hover:shadow-md transition-shadow">
                  {userPicture ? (
                      <img src={userPicture} alt={userName} className="w-8 h-8 rounded-full" />
                  ) : (
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-gray text-white font-bold text-sm">
                          {userInitials}
                      </span>
                  )}
                  <span className="font-medium">{userName.split(' ')[0]}</span>
                </button>
                {isUserDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-20">
                    <nav className="py-2">
                      <button onClick={(e) => { e.preventDefault(); onNavigateToMyAds(); setIsUserDropdownOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-brand-dark hover:bg-gray-100">
                          <AdsIcon className="w-5 h-5 mr-3 text-brand-gray" />
                          <span>{t('header.ads')}</span>
                      </button>
                      <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToFavorites(); setIsUserDropdownOpen(false); }} className="flex items-center px-4 py-2 text-sm text-brand-dark hover:bg-gray-100">
                          <HeartIcon className="w-5 h-5 mr-3 text-brand-gray" />
                          <span>{t('header.favorites')}</span>
                      </a>
                      <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToChatList(); setIsUserDropdownOpen(false); }} className="relative flex items-center px-4 py-2 text-sm text-brand-dark hover:bg-gray-100 w-full">
                          <ChatIcon className="w-5 h-5 mr-3 text-brand-gray" />
                          <span>{t('header.chat')}</span>
                          {hasUnreadMessages && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-brand-red rounded-full"></span>
                          )}
                      </a>
                    </nav>
                    <div className="border-t">
                      <button onClick={onLogout} className="w-full flex items-center px-4 py-3 text-sm text-brand-dark hover:bg-gray-100">
                        <LogoutIcon className="w-5 h-5 mr-3 text-brand-gray" />
                        <span>{t('header.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
               <button onClick={onAccessClick} className="flex items-center space-x-2 hover:text-brand-red transition duration-300 font-medium">
                <UserIcon className="w-6 h-6" />
                <span>{t('header.access')}</span>
              </button>
            )}
          </div>
        </nav>
        
        {/* Mobile Header */}
         <div className="md:hidden flex items-center justify-between py-3 relative overflow-hidden h-[60px]">
             {/* Default View Content */}
             <a href="#" onClick={(e) => { e.preventDefault(); navigateHome(); }} className={`transition-opacity duration-200 ${isSearchExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <img src="https://i.postimg.cc/4dqSTCqs/logo-Browser.png" alt="Quality Home Logo" className="h-10" />
            </a>
            <div className={`flex items-center space-x-2 transition-opacity duration-200 ${isSearchExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button onClick={() => setIsSearchExpanded(true)} className="p-2 rounded-full hover:bg-gray-100">
                    <SearchIcon className="w-6 h-6 text-brand-dark"/>
                </button>
                {user ? (
                    <div className="relative" ref={userDropdownRef}>
                        <button onClick={() => setIsUserDropdownOpen(prev => !prev)} className="flex items-center">
                          {userPicture ? (
                              <img src={userPicture} alt={userName} className="w-9 h-9 rounded-full" />
                          ) : (
                              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-gray text-white font-bold text-sm">
                                  {userInitials}
                              </span>
                          )}
                        </button>
                        {isUserDropdownOpen && (
                          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-20">
                             <div className="px-4 py-4 border-b flex items-center space-x-3">
                                {userPicture ? (
                                    <img src={userPicture} alt={userName} className="w-10 h-10 rounded-full" />
                                ) : (
                                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-brand-gray text-white font-bold">
                                        {userInitials}
                                    </div>
                                )}
                                <div>
                                  <p className="text-sm font-bold text-brand-dark truncate">{userName}</p>
                                  <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToMyAds(); setIsUserDropdownOpen(false); }} className="text-xs text-brand-red hover:underline">{t('header.myAccount')}</a>
                                </div>
                              </div>
                            <div className="border-t">
                              <button onClick={onLogout} className="w-full flex items-center px-4 py-3 text-sm text-brand-dark hover:bg-gray-100">
                                <LogoutIcon className="w-5 h-5 mr-3 text-brand-gray" />
                                <span>{t('header.logout')}</span>
                              </button>
                            </div>
                          </div>
                        )}
                    </div>
                ) : (
                    <button onClick={onAccessClick} className="p-2 rounded-full hover:bg-gray-100">
                        <UserIcon className="w-6 h-6 text-brand-dark" />
                    </button>
                )}
            </div>

            {/* Expanded Search Bar Overlay */}
            <div className={`absolute top-0 left-0 w-full h-full bg-white flex items-center px-2 transition-transform duration-300 ease-in-out ${isSearchExpanded ? 'translate-x-0' : 'translate-x-full'}`}>
                <button onClick={() => setIsSearchExpanded(false)} className="p-2 rounded-full hover:bg-gray-100 text-brand-dark">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <form onSubmit={handleSearch} className="flex-grow mx-2 relative">
                    <input
                        ref={searchInputRef}
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('hero.locationPlaceholder')}
                        className="w-full pl-5 pr-12 py-2.5 rounded-full text-brand-dark bg-brand-light-gray border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                    <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full text-brand-dark hover:bg-gray-200 transition-colors">
                        <SearchIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>

         </div>
      </div>
    </header>
  );
};

export default Header;
