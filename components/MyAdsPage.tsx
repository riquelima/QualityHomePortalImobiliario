import React from 'react';
import Header from './Header';
import type { Property, User, Profile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import MyAdCard from './MyAdCard';
import AdsIcon from './icons/AdsIcon';

interface MyAdsPageProps {
  onBack: () => void;
  user: User | null;
  profile: Profile | null;
  onLogout: () => void;
  onPublishAdClick: () => void;
  onAccessClick: () => void;
  onNavigateToFavorites: () => void;
  onNavigateToChatList: () => void;
  onNavigateToMyAds: () => void;
  userProperties: Property[];
  onViewDetails: (id: number) => void;
  onDeleteProperty: (id: number) => void;
}

const MyAdsPage: React.FC<MyAdsPageProps> = ({
  onBack, user, profile, onLogout, onPublishAdClick, onAccessClick, onNavigateToFavorites, onNavigateToChatList, onNavigateToMyAds, userProperties, onViewDetails, onDeleteProperty
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-brand-light-gray min-h-screen flex flex-col">
      <Header
        onPublishAdClick={onPublishAdClick}
        onAccessClick={onAccessClick}
        user={user}
        profile={profile}
        onLogout={onLogout}
        onNavigateToFavorites={onNavigateToFavorites}
        onNavigateToChatList={onNavigateToChatList}
        onNavigateToMyAds={onNavigateToMyAds}
      />
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="text-sm mb-6">
            <span onClick={onBack} className="text-brand-red hover:underline cursor-pointer">{t('map.breadcrumbs.home')}</span>
            <span className="text-brand-gray mx-2">&gt;</span>
            <span className="text-brand-dark font-medium">{t('myAdsPage.breadcrumb')}</span>
          </div>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy">{t('myAdsPage.title')}</h1>
            <button onClick={onPublishAdClick} className="bg-brand-red hover:opacity-90 text-white font-bold py-2 px-4 rounded-md transition duration-300">
              {t('myAdsPage.newAdButton')}
            </button>
          </div>

          {userProperties.length > 0 ? (
            <div className="space-y-6">
              {userProperties.map((property) => (
                <MyAdCard
                  key={property.id}
                  property={property}
                  onView={onViewDetails}
                  onEdit={() => { alert('A funcionalidade de edição será implementada em breve.'); }}
                  onDelete={onDeleteProperty}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 sm:py-20 bg-white rounded-lg shadow-md">
              <AdsIcon className="w-12 h-12 sm:w-16 sm:h-16 text-brand-gray mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-2">{t('myAdsPage.noAds.title')}</h2>
              <p className="text-brand-gray max-w-md mx-auto">{t('myAdsPage.noAds.description')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyAdsPage;
