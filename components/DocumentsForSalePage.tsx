import React from 'react';
import Header from './Header';
import { useLanguage } from '../contexts/LanguageContext';

interface DocumentsForSalePageProps {
  onBack: () => void;
  onNavigateToAllListings: () => void;
  navigateToGuideToSell: () => void;
  navigateToDocumentsForSale: () => void;
  navigateHome: () => void;
  // FIX: Add missing props required by the Header component.
  onNavigateToBuy: () => void;
  onNavigateToRent: () => void;
  onNavigateToSeason: () => void;
  isAdminLoggedIn?: boolean;
  onAdminLogout?: () => void;
  onNavigateToAdminDashboard?: () => void;
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
          <span onClick={props.onBack} className="text-brand-red hover:underline cursor-pointer">
            {t('publishAdPage.breadcrumbHome')}
          </span>
          <span className="text-brand-gray mx-2">&gt;</span>
          <span className="text-brand-dark font-medium">{t('documentsForSalePage.title')}</span>
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
            <div className="mt-4">
              <a href="https://www.instagram.com/portalimobiliarioquallityhome/" target="_blank" rel="noopener noreferrer" aria-label="Siga-nos no Instagram" className="inline-block hover:opacity-75 transition-opacity">
                <img src="https://cdn-icons-png.flaticon.com/512/3621/3621435.png" alt="Instagram" className="h-8 w-8" />
              </a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default DocumentsForSalePage;