import React from 'react';
import Header from './Header';
import { useLanguage } from '../contexts/LanguageContext';
import type { User, Profile } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface DocumentsForSalePageProps {
  onBack: () => void;
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
  // FIX: Added onSearchSubmit prop to pass to Header component.
  onSearchSubmit: (query: string) => void;
}

const DocumentSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <article className="mb-8">
    <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4">{title}</h2>
    <ul className="list-disc list-inside space-y-2 text-brand-dark">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </article>
);

const DocumentsForSalePage: React.FC<DocumentsForSalePageProps> = (props) => {
  const { t } = useLanguage();

  const sellerDocs = [
    t('documentsForSalePage.seller.doc1'),
    t('documentsForSalePage.seller.doc2'),
    t('documentsForSalePage.seller.doc3'),
    t('documentsForSalePage.seller.doc4'),
    t('documentsForSalePage.seller.doc5'),
  ];

  const buyerDocs = [
    t('documentsForSalePage.buyer.doc1'),
    t('documentsForSalePage.buyer.doc2'),
    t('documentsForSalePage.buyer.doc3'),
  ];

  const propertyDocs = [
    t('documentsForSalePage.property.doc1'),
    t('documentsForSalePage.property.doc2'),
    t('documentsForSalePage.property.doc3'),
    t('documentsForSalePage.property.doc4'),
    t('documentsForSalePage.property.doc5'),
  ];

  return (
    <div className="bg-brand-light-gray min-h-screen">
      <Header {...props} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-sm mb-6">
           <button onClick={props.onBack} className="text-brand-red hover:underline cursor-pointer flex items-center">
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            {t('publishAdPage.breadcrumbHome')}
          </button>
        </div>

        <div className="bg-white p-6 sm:p-8 md:p-12 rounded-lg shadow-lg">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-4">{t('documentsForSalePage.title')}</h1>
          <p className="text-brand-gray mb-8">{t('documentsForSalePage.intro')}</p>

          <DocumentSection title={t('documentsForSalePage.seller.title')} items={sellerDocs} />
          <DocumentSection title={t('documentsForSalePage.buyer.title')} items={buyerDocs} />
          <DocumentSection title={t('documentsForSalePage.property.title')} items={propertyDocs} />

          <div className="mt-12 bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md">
            <p className="font-bold">{t('documentsForSalePage.disclaimer.title')}</p>
            <p className="text-sm">{t('documentsForSalePage.disclaimer.text')}</p>
          </div>
        </div>
      </div>
      <footer className="bg-brand-light-gray text-brand-gray py-8 text-center mt-12">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} {t('footer.text')}</p>
        </div>
      </footer>
    </div>
  );
};

export default DocumentsForSalePage;
