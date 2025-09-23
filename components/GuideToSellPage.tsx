import React from 'react';
import Header from './Header';
import { useLanguage } from '../contexts/LanguageContext';
import type { User, Profile } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface GuideToSellPageProps {
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

const GuideToSellPage: React.FC<GuideToSellPageProps> = (props) => {
  const { t } = useLanguage();

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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-4">{t('publishAdPage.steps.title')}</h1>
            <p className="text-brand-gray mb-8">{t('publishAdPage.steps.intro')}</p>
            <div className="space-y-8 text-brand-dark leading-relaxed">
                <article>
                    <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-3">{t('publishAdPage.steps.step1Title')}</h2>
                    <p className="whitespace-pre-line text-base">{t('publishAdPage.steps.step1Content')}</p>
                </article>
                 <article>
                    <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-3">{t('publishAdPage.steps.step2Title')}</h2>
                    <p className="text-base">{t('publishAdPage.steps.step2Content')}</p>
                </article>
                 <article>
                    <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-3">{t('publishAdPage.steps.step3Title')}</h2>
                    <p className="text-base">{t('publishAdPage.steps.step3Content')}</p>
                </article>
                 <article>
                    <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-3">{t('publishAdPage.steps.step4Title')}</h2>
                    <p className="text-base">{t('publishAdPage.steps.step4Content')}</p>
                </article>
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

export default GuideToSellPage;
