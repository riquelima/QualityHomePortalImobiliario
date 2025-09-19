import React, { useState } from 'react';
import Header from './Header';
import PropertyListings from './PropertyListings';
import type { Property, User, Profile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import SearchIcon from './icons/SearchIcon';

interface AllListingsPageProps {
  onBack: () => void;
  properties: Property[];
  onPublishAdClick: () => void;
  onAccessClick: () => void;
  user: User | null;
  profile: Profile | null;
  onLogout: () => void;
  onViewDetails: (id: number) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  onNavigateToFavorites: () => void;
  onNavigateToChatList: () => void;
  onNavigateToMyAds: () => void;
  onSearchSubmit: (query: string) => void;
  onNavigateToAllListings: () => void; // self-reference for header
  hasUnreadMessages: boolean;
}

const AllListingsPage: React.FC<AllListingsPageProps> = (props) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    props.onSearchSubmit(searchQuery.trim());
  };

  const filteredProperties = searchQuery.trim()
    ? props.properties.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : props.properties;

  return (
    <div className="bg-brand-light-gray min-h-screen flex flex-col">
      <Header
        onPublishAdClick={props.onPublishAdClick}
        onAccessClick={props.onAccessClick}
        user={props.user}
        profile={props.profile}
        onLogout={props.onLogout}
        onNavigateToFavorites={props.onNavigateToFavorites}
        onNavigateToChatList={props.onNavigateToChatList}
        onNavigateToMyAds={props.onNavigateToMyAds}
        onNavigateToAllListings={props.onNavigateToAllListings}
        hasUnreadMessages={props.hasUnreadMessages}
      />
      <main className="flex-grow">
        <section className="bg-white py-12">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <img src="https://i.imgur.com/FuxDdyF.png" alt="Quality Home Logo" className="h-24 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">{t('header.searchDropdown.buy.explore')}</h1>
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
              <div className="relative">
                <SearchIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('hero.locationPlaceholder')}
                  className="w-full px-12 py-3 rounded-full text-brand-dark border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-red text-white font-bold py-2 px-6 rounded-full hover:opacity-90">
                  {t('hero.searchButton')}
                </button>
              </div>
            </form>
          </div>
        </section>
        
        <PropertyListings
          properties={filteredProperties}
          onViewDetails={props.onViewDetails}
          favorites={props.favorites}
          onToggleFavorite={props.onToggleFavorite}
          isLoading={false}
        />
      </main>
      <footer className="bg-brand-light-gray text-brand-gray py-8 text-center mt-12">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} {t('footer.text')}</p>
        </div>
      </footer>
    </div>
  );
};

export default AllListingsPage;
