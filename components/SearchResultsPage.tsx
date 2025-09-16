
import React from 'react';
import Header from './Header';
import PropertyCard from './PropertyCard';
import type { Property, User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import SearchIcon from './icons/SearchIcon';

interface SearchResultsPageProps {
  onBack: () => void;
  searchQuery: string;
  properties: Property[];
  onPublishAdClick: () => void;
  onAccessClick: () => void;
  user: User | null;
  onLogout: () => void;
  onViewDetails: (id: number) => void;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ 
  onBack, 
  searchQuery, 
  properties, 
  onPublishAdClick, 
  onAccessClick, 
  user, 
  onLogout,
  onViewDetails
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-brand-light-gray min-h-screen flex flex-col">
      <Header 
        onPublishAdClick={onPublishAdClick} 
        onAccessClick={onAccessClick} 
        user={user} 
        onLogout={onLogout} 
      />
      <main className="flex-grow">
        <div className="container mx-auto px-6 py-8">
          {/* Breadcrumbs */}
          <div className="text-sm mb-6">
            <span onClick={onBack} className="text-brand-red hover:underline cursor-pointer">
              {t('map.breadcrumbs.home')}
            </span>
            <span className="text-brand-gray mx-2">&gt;</span>
            <span className="text-brand-dark font-medium">{t('searchResults.breadcrumb')}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mb-2">
            {t('searchResults.title', { query: searchQuery })}
          </h1>
          <p className="text-brand-gray mb-8">
            {t('searchResults.subtitle', { count: properties.length })}
          </p>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} onViewDetails={onViewDetails} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-lg shadow-md">
              <SearchIcon className="w-16 h-16 text-brand-gray mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-brand-navy mb-2">{t('searchResults.noResults.title')}</h2>
              <p className="text-brand-gray max-w-md mx-auto">{t('searchResults.noResults.description')}</p>
            </div>
          )}
        </div>
      </main>
      <footer className="bg-brand-light-gray text-brand-gray py-8 text-center">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} {t('footer.text')}</p>
        </div>
      </footer>
    </div>
  );
};

export default SearchResultsPage;
