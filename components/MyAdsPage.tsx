import React, { useEffect } from 'react';
import type { Property } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import MyAdCard from './MyAdCard';
import AdsIcon from './icons/AdsIcon';
import LogoutIcon from './icons/LogoutIcon';
import PlusIcon from './icons/PlusIcon';
import CloseIcon from './icons/CloseIcon';
import SuccessIcon from './icons/SuccessIcon';

interface MyAdsPageProps {
  onBack: () => void;
  properties: Property[];
  onViewDetails: (id: number) => void;
  onDeleteProperty: (id: number) => void;
  onEditProperty: (property: Property) => void;
  onPublishClick: () => void;
  onAdminLogout: () => void;
  onShareProperty: (id: number) => void;
  showSuccessBanner?: 'published' | 'updated';
  onDismissSuccessBanner: () => void;
}

const MyAdsPage: React.FC<MyAdsPageProps> = ({
  onBack, properties, onViewDetails, onDeleteProperty, onEditProperty, onPublishClick, onAdminLogout, onShareProperty, showSuccessBanner, onDismissSuccessBanner
}) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (showSuccessBanner) {
      const timer = setTimeout(() => {
        onDismissSuccessBanner();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessBanner, onDismissSuccessBanner]);

  return (
    <div className="bg-brand-light-gray min-h-screen">
      {/* Dashboard Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src="https://i.postimg.cc/QNJ63Www/logo.png" alt="Logo" className="h-12 mr-4" />
              <h1 className="text-xl font-bold text-brand-navy hidden sm:block">{t('myAdsPage.title')}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="text-sm text-brand-gray hover:text-brand-dark transition-colors">
                Voltar ao site
              </button>
              <button onClick={onAdminLogout} className="text-brand-gray hover:text-brand-red transition-colors flex items-center text-sm p-2 rounded-md bg-gray-100 hover:bg-gray-200">
                <LogoutIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {showSuccessBanner && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded-md shadow-sm flex items-start justify-between page-fade-in" role="alert">
              <div className="flex">
                <SuccessIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-bold">{t('myAdsPage.publishSuccessTitle')}</p>
                  <p className="text-sm">
                    {showSuccessBanner === 'published'
                      ? t('myAdsPage.publishSuccessMessage')
                      : t('myAdsPage.updateSuccessMessage')}
                  </p>
                </div>
              </div>
              <button onClick={onDismissSuccessBanner} aria-label="Dismiss" className="p-1 -m-1">
                <CloseIcon className="h-5 w-5 text-green-800 hover:text-green-900" />
              </button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy">Seus Anúncios</h1>
              <p className="text-brand-gray mt-1">Você tem {properties.length} anúncio(s) publicados.</p>
            </div>
            <button
              onClick={onPublishClick}
              className="bg-brand-red hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="w-5 h-5" />
              <span>{t('myAdsPage.newAdButton')}</span>
            </button>
          </div>

          {properties.length > 0 ? (
            <div className="space-y-6">
              {properties.map((property) => (
                <MyAdCard
                  key={property.id}
                  property={property}
                  onView={onViewDetails}
                  onEdit={onEditProperty}
                  onDelete={onDeleteProperty}
                  onShare={onShareProperty}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 sm:py-20 bg-white rounded-lg shadow-md border border-gray-200">
              <AdsIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
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
