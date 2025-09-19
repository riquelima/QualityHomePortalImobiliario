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
  // FIX: Add onNavigateToMyAds prop to resolve typing error.
  onNavigateToMyAds: () => void;
  hasUnreadMessages: boolean;
}

const currencyConfig = {
  pt: { locale: 'pt-BR', currency: 'BRL' },
  en: { locale: 'en-US', currency: 'USD' },
  es: { locale: 'es-ES', currency: 'EUR' },
};

const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  property,
  onBack,
  onPublishAdClick,
  onAccessClick,
  user,
  profile,
  onLogout,
  isFavorite,
  onToggleFavorite,
  onNavigateToFavorites,
  onStartChat,
  onNavigateToChatList,
  onNavigateToMyAds,
  hasUnreadMessages
}) => {
  const { t, language } = useLanguage();
  
  const placeholderImage = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  const displayImages = property.images && property.images.length > 0 ? property.images : [placeholderImage];

  const [selectedImage, setSelectedImage] = useState(displayImages[0]);
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
    <div className="bg-brand-light-gray min-h-screen">
      {/* FIX: Pass onNavigateToMyAds prop to Header. */}
      <Header
        onPublishAdClick={onPublishAdClick}
        onAccessClick={onAccessClick}
        user={user}
        profile={profile}
        onLogout={onLogout}
        onNavigateToFavorites={onNavigateToFavorites}
        onNavigateToChatList={onNavigateToChatList}
        onNavigateToMyAds={onNavigateToMyAds}
        hasUnreadMessages={hasUnreadMessages}
      />
      <main className="container mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumbs */}
        <div className="text-sm mb-6">
          <button onClick={onBack} className="text-brand-red hover:underline cursor-pointer">
            {t('map.breadcrumbs.home')}
          </button>
          <span className="text-brand-gray mx-2">&gt;</span>
          <span className="text-brand-dark font-medium">{t('propertyDetail.breadcrumb')}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              {/* Photo Gallery */}
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4">{t('propertyDetail.gallery')}</h2>
                <div className="mb-4">
                  <img src={selectedImage} alt="Main property view" className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-lg" />
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                  {displayImages.map((image, index) => (
                    <button key={index} onClick={() => setSelectedImage(image)}>
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className={`w-full h-16 sm:h-24 object-cover rounded-md cursor-pointer transition-all duration-200 ${selectedImage === image ? 'ring-2 sm:ring-4 ring-brand-red' : 'opacity-70 hover:opacity-100'}`}
                      />
                    </button>
                  ))}
                </div>
              </section>

              {/* Description */}
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4">{t('propertyDetail.description')}</h2>
                <p className="text-brand-gray leading-relaxed whitespace-pre-line">{property.description}</p>
              </section>
              
              {/* General Details */}
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4 border-t pt-6">{t('propertyDetail.generalDetails')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 p-4 bg-brand-light-gray rounded-lg">
                  {property.tipo_imovel && (
                    <div>
                      <p className="text-sm font-semibold text-brand-navy">{t('propertyDetail.propertyType')}</p>
                      <p className="text-brand-gray">{property.tipo_imovel}</p>
                    </div>
                  )}
                  {property.situacao_ocupacao && (
                    <div>
                      <p className="text-sm font-semibold text-brand-navy">{t('propertyDetail.occupationStatus')}</p>
                      <p className="text-brand-gray">{t(`publishJourney.detailsForm.${property.situacao_ocupacao === 'rented' ? 'rentedWithTenants' : 'withoutTenants'}`)}</p>
                    </div>
                  )}
                  {property.possui_elevador !== null && property.possui_elevador !== undefined && (
                    <div>
                      <p className="text-sm font-semibold text-brand-navy">{t('propertyDetail.hasElevator')}</p>
                      <p className="text-brand-gray">{property.possui_elevador ? t('publishJourney.detailsForm.yes') : t('publishJourney.detailsForm.no')}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Property Features */}
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
              
              {/* Condo Amenities */}
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


              {/* Video Gallery */}
              {property.videos && property.videos.length > 0 && (
                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4 border-t pt-6">{t('propertyDetail.videos')}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {property.videos.map((videoUrl, index) => (
                      <div key={index} className="aspect-w-16 aspect-h-9">
                         <iframe 
                            src={videoUrl} 
                            title={`Property Video ${index + 1}`} 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            className="w-full h-full rounded-lg shadow-md"
                        ></iframe>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-2 leading-tight">{property.title}</h1>
                <div className="flex items-center text-brand-gray mb-4">
                  <LocationIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  <p className="text-sm">{property.address}</p>
                </div>
                
                <p className="text-3xl sm:text-4xl font-bold text-brand-red mb-2">{formattedPrice}</p>
                 {formattedCondoFee && (
                  <p className="text-md text-brand-gray mb-6">
                    {t('propertyDetail.condoFee')}: {formattedCondoFee}
                  </p>
                )}

                
                <h2 className="text-lg sm:text-xl font-bold text-brand-navy mb-4 border-t pt-4">{t('propertyDetail.details')}</h2>
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div className="flex flex-col items-center p-2 bg-brand-light-gray rounded-lg">
                        <BedIcon className="w-6 h-6 mb-1 text-brand-gray" />
                        <span className="text-sm font-medium text-brand-dark">{property.bedrooms}</span>
                        <span className="text-xs text-brand-gray">{t('propertyCard.bedrooms')}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-brand-light-gray rounded-lg">
                        <BathIcon className="w-6 h-6 mb-1 text-brand-gray" />
                        <span className="text-sm font-medium text-brand-dark">{property.bathrooms}</span>
                        <span className="text-xs text-brand-gray">{t('propertyCard.bathrooms')}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-brand-light-gray rounded-lg">
                        <AreaIcon className="w-6 h-6 mb-1 text-brand-gray" />
                        <span className="text-sm font-medium text-brand-dark">{property.area} m²</span>
                    </div>
                </div>

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
            </div>
          </aside>
        </div>
      </main>
      <footer className="bg-brand-light-gray text-brand-gray py-8 text-center mt-12">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} {t('footer.text')}</p>
        </div>
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