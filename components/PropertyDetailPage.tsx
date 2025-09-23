import React, { useState } from 'react';
import Header from './Header';
import type { Property, User, Profile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import LocationIcon from './icons/LocationIcon';
import BedIcon from './icons/BedIcon';
import BathIcon from './icons/BathIcon';
import AreaIcon from './icons/AreaIcon';
import HeartIcon from './icons/HeartIcon';
import HeartFilledIcon from './icons/HeartFilledIcon';
import ContactModal from './ContactModal';
import FeatureIcon from './FeatureIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';


interface PropertyDetailPageProps {
  property: Property;
  onBack: () => void;
  onPublishAdClick: () => void;
  onAccessClick: () => void;
  user: User | null;
  profile: Profile | null;
  onLogout: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onNavigateToFavorites: () => void;
  onStartChat: (property: Property) => void;
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

const currencyConfig = {
  pt: { locale: 'pt-BR', currency: 'BRL' },
  en: { locale: 'en-US', currency: 'USD' },
  es: { locale: 'es-ES', currency: 'EUR' },
};

const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  property,
  onBack,
  isFavorite,
  onToggleFavorite,
  onStartChat,
  ...headerProps
}) => {
  const { t, language } = useLanguage();
  
  const placeholderImage = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  const displayImages = property.images && property.images.length > 0 ? property.images : [placeholderImage];

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const { locale, currency } = currencyConfig[language as keyof typeof currencyConfig];
  const formattedPrice = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(property.price);
  
  const formattedCondoFee = property.taxa_condominio ? new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(property.taxa_condominio) : null;


  return (
    <>
    <div className="bg-white min-h-screen">
      <Header {...headerProps} />
      <main className="pb-24">
        {/* Gallery for Mobile */}
        <div className="relative md:hidden">
            <div className="aspect-square w-full overflow-hidden">
                <img src={displayImages[0]} alt="Main property view" className="w-full h-full object-cover" />
            </div>
             <button onClick={onBack} className="absolute top-4 left-4 bg-white/70 backdrop-blur-sm p-2 rounded-full text-brand-dark hover:bg-white transition-colors duration-200 z-10">
                <ArrowLeftIcon className="w-6 h-6"/>
            </button>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="hidden md:block mb-4">
                <button onClick={onBack} className="flex items-center text-sm text-brand-red hover:underline mb-4">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Voltar para resultados
                </button>
            </div>

            {/* Desktop Header and Gallery */}
            <div className="hidden md:block mb-8">
                 <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-2 leading-tight">{property.title}</h1>
                 <div className="flex items-center text-brand-gray mb-4">
                  <LocationIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  <p>{property.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 h-[400px] rounded-2xl overflow-hidden">
                    <div className="h-full">
                         <img src={displayImages[0]} alt="Main property view" className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                    </div>
                    <div className="h-full grid grid-cols-2 gap-2">
                         {displayImages.slice(1,5).map((img, i) => (
                             <div key={i} className="h-full">
                                <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                             </div>
                         ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content */}
              <div className="lg:col-span-2">
                <div className="md:hidden">
                    <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-2 leading-tight">{property.title}</h1>
                    <div className="flex items-center text-brand-gray mb-4">
                      <LocationIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                      <p className="text-sm">{property.address}</p>
                    </div>
                </div>

                 <div className="flex items-baseline space-x-2 mb-6 border-b pb-6">
                    <p className="text-3xl sm:text-4xl font-bold text-brand-dark">{formattedPrice}</p>
                    {formattedCondoFee && (
                      <p className="text-md text-brand-gray">
                        + {formattedCondoFee} ({t('propertyDetail.condoFee')})
                      </p>
                    )}
                 </div>

                 <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div className="flex flex-col items-center p-2 bg-brand-light-gray rounded-lg">
                        <BedIcon className="w-6 h-6 mb-1 text-brand-gray" />
                        <span className="text-sm font-medium text-brand-dark">{property.bedrooms} {t('propertyCard.bedrooms')}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-brand-light-gray rounded-lg">
                        <BathIcon className="w-6 h-6 mb-1 text-brand-gray" />
                        <span className="text-sm font-medium text-brand-dark">{property.bathrooms} {t('propertyCard.bathrooms')}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-brand-light-gray rounded-lg">
                        <AreaIcon className="w-6 h-6 mb-1 text-brand-gray" />
                        <span className="text-sm font-medium text-brand-dark">{property.area} m²</span>
                    </div>
                </div>

                <section className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4 border-t pt-6">{t('propertyDetail.description')}</h2>
                  <p className="text-brand-gray leading-relaxed whitespace-pre-line">{property.description}</p>
                </section>
                
                {property.caracteristicas_imovel && property.caracteristicas_imovel.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4 border-t pt-6">{t('propertyDetail.propertyFeatures')}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                    {property.caracteristicas_imovel.map(feature => (
                      <div key={feature} className="flex items-center space-x-3">
                        <FeatureIcon feature={feature} className="w-6 h-6 text-brand-navy flex-shrink-0" />
                        <span className="text-brand-gray">{t(`publishJourney.detailsForm.${feature}`)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              
              {property.caracteristicas_condominio && property.caracteristicas_condominio.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4 border-t pt-6">{t('propertyDetail.condoAmenities')}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                    {property.caracteristicas_condominio.map(feature => (
                      <div key={feature} className="flex items-center space-x-3">
                        <FeatureIcon feature={feature} className="w-6 h-6 text-brand-navy flex-shrink-0" />
                        <span className="text-brand-gray">{t(`publishJourney.detailsForm.${feature}`)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              </div>
              <aside className="lg:col-span-1">
                <div className="sticky top-24 hidden lg:block border rounded-xl p-6 shadow-lg">
                    <p className="text-2xl font-bold text-brand-dark mb-6">{formattedPrice}</p>
                    <div className="flex flex-col space-y-3">
                        {property.owner && (
                          <button 
                            onClick={() => setIsContactModalOpen(true)}
                            className="w-full bg-brand-red hover:opacity-90 text-white font-bold py-3 px-4 rounded-md transition duration-300">
                              {t('propertyCard.contact')}
                          </button>
                        )}
                        <button 
                          onClick={() => onToggleFavorite(property.id)}
                          className="w-full bg-gray-200 hover:bg-gray-300 text-brand-dark font-medium py-3 px-4 rounded-md transition duration-300 flex items-center justify-center space-x-2"
                        >
                            {isFavorite ? <HeartFilledIcon className="w-5 h-5 text-brand-red" /> : <HeartIcon className="w-5 h-f" />}
                            <span>{isFavorite ? t('propertyDetail.removeFromFavorites') : t('propertyDetail.addToFavorites')}</span>
                        </button>
                    </div>
                </div>
              </aside>
            </div>
        </div>
      </main>
      
      {/* Sticky Footer for Mobile */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex items-center justify-between gap-4 z-40 md:hidden">
          <button 
            onClick={() => onToggleFavorite(property.id)}
            className="p-3 border rounded-lg hover:bg-gray-100"
            aria-label={isFavorite ? t('propertyDetail.removeFromFavorites') : t('propertyDetail.addToFavorites')}
           >
              {isFavorite ? <HeartFilledIcon className="w-6 h-6 text-brand-red" /> : <HeartIcon className="w-6 h-6 text-brand-dark" />}
          </button>
          {property.owner && (
            <button 
                onClick={() => setIsContactModalOpen(true)}
                className="flex-grow bg-brand-red hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                  {t('propertyCard.contact')}
            </button>
          )}
      </footer>

    </div>
    <ContactModal 
      isOpen={isContactModalOpen} 
      onClose={() => setIsContactModalOpen(false)}
      owner={property.owner}
      propertyTitle={property.title}
      onStartChat={() => {
        onStartChat(property);
        setIsContactModalOpen(false);
      }}
    />
    </>
  );
};

export default PropertyDetailPage;
