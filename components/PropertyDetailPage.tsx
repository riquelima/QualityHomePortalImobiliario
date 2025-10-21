import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import type { Property } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useGestures } from '../hooks/useGestures';
import GestureIndicator from './GestureIndicator';
import LocationIcon from './icons/LocationIcon';
import BedIcon from './icons/BedIcon';
import BathIcon from './icons/BathIcon';
import AreaIcon from './icons/AreaIcon';
import FeatureIcon from './FeatureIcon';
import ShareIcon from './icons/ShareIcon';

interface PropertyDetailPageProps {
  property: Property;
  onBack: () => void;
  onShare: (id: number) => void;
  navigateHome: () => void;
  onNavigateToAllListings: () => void;
  navigateToGuideToSell: () => void;
  navigateToDocumentsForSale: () => void;
  isAdminLoggedIn?: boolean;
  // FIX: Add missing props required by the Header component.
  onNavigateToBuy: () => void;
  onNavigateToRent: () => void;
  onNavigateToSeason: () => void;
  onAdminLogout?: () => void;
  onNavigateToAdminDashboard?: () => void;
}

const currencyConfig = {
  pt: { locale: 'pt-BR', currency: 'BRL' },
  en: { locale: 'en-US', currency: 'USD' },
  es: { locale: 'es-ES', currency: 'EUR' },
};

const PropertyDetailPage: React.FC<PropertyDetailPageProps> = (props) => {
  const { property, onBack, onShare } = props;
  const { t, language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const galleryImageRef = useRef<HTMLDivElement>(null);
  
  const placeholderImage = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  const displayImages = property.images && property.images.length > 0 ? property.images : [placeholderImage];

  const [selectedImage, setSelectedImage] = useState(displayImages[0]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Configurar gestos para swipe para voltar
  const { bindGestures, gestureState } = useGestures({
    onSwipeRight: () => {
      // Só permite voltar se não estiver na galeria
      if (!isGalleryOpen) {
        onBack();
      }
    },
    minSwipeDistance: 80, // Distância mínima para ativar o gesto
  });

  // Configurar gestos específicos para a galeria
  const { bindGestures: bindGalleryGestures } = useGestures({
    onSwipeLeft: () => {
      if (isGalleryOpen && displayImages.length > 1) {
        nextImage();
      }
    },
    onSwipeRight: () => {
      if (isGalleryOpen && displayImages.length > 1) {
        prevImage();
      }
    },
    minSwipeDistance: 50, // Menor distância para navegação na galeria
  });

  const { locale, currency } = currencyConfig[language as keyof typeof currencyConfig];
  
  const formattedPrice = typeof property.price === 'number'
    ? new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
      }).format(property.price)
    : 'Preço a consultar';
  
  const formattedCondoFee = typeof property.taxa_condominio === 'number'
    ? new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
      }).format(property.taxa_condominio)
    : null;

  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  // Configurar gestos no container principal
  useEffect(() => {
    if (containerRef.current) {
      bindGestures(containerRef.current);
    }
  }, [bindGestures]);

  // Configurar gestos na galeria quando ela estiver aberta
  useEffect(() => {
    if (isGalleryOpen && galleryImageRef.current) {
      bindGalleryGestures(galleryImageRef.current);
    }
  }, [isGalleryOpen, bindGalleryGestures]);

  // Controle de teclado para o modal
  useEffect(() => {
    if (!isGalleryOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          closeGallery();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          prevImage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextImage();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Previne scroll do body quando modal está aberto
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isGalleryOpen, currentImageIndex]);


  return (
    <>
    <div ref={containerRef} className="bg-gray-50 min-h-screen">
      <Header {...props} />
      
      {/* Hero Section with Image and Key Info */}
      <div className="relative">
        <div className="h-[60vh] md:h-[70vh] overflow-hidden">
          <img 
            src={selectedImage} 
            alt="Main property view" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          
          {/* Floating Info Card */}
          <div className="absolute bottom-6 left-6 right-6 md:left-8 md:right-auto md:max-w-md">
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-blue-900 leading-tight flex-1 pr-4">
                  {property.title}
                </h1>
                <button 
                  onClick={() => onShare(property.id)}
                  className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition duration-300 shadow-lg"
                  aria-label="Compartilhar"
                >
                  <ShareIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center text-gray-600 mb-4">
                <LocationIcon className="w-5 h-5 mr-2 text-red-600" />
                <p className="text-sm font-medium">{property.address}</p>
              </div>
              
              <div className="flex items-baseline gap-2 mb-4">
                <p className="text-3xl md:text-4xl font-bold text-red-600">{formattedPrice}</p>
                {formattedCondoFee && (
                  <p className="text-sm text-gray-500">+ {formattedCondoFee} cond.</p>
                )}
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-red-50 rounded-lg p-3 mb-2">
                    <BedIcon className="w-6 h-6 mx-auto text-red-600" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">{property.bedrooms}</span>
                  <p className="text-xs text-gray-500">Quartos</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-50 rounded-lg p-3 mb-2">
                    <BathIcon className="w-6 h-6 mx-auto text-blue-900" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">{property.bathrooms}</span>
                  <p className="text-xs text-gray-500">Banheiros</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-50 rounded-lg p-3 mb-2">
                    <AreaIcon className="w-6 h-6 mx-auto text-gray-600" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">{property.area}</span>
                  <p className="text-xs text-gray-500">m²</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb */}
        <div className="absolute top-6 left-6">
          <button 
            onClick={onBack} 
            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-blue-900 px-4 py-2 rounded-full text-sm font-medium transition duration-300 shadow-lg"
          >
            ← Voltar
          </button>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Image Gallery */}
             <section className="bg-white rounded-2xl p-6 shadow-lg">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-blue-900">Galeria de Fotos</h2>
                 <span className="text-sm text-gray-500">{displayImages.length} fotos</span>
               </div>
               
               {/* Main Image Display */}
               <div className="mb-6">
                 <button 
                   onClick={() => openGallery(displayImages.indexOf(selectedImage))}
                   className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden group"
                 >
                   <img
                     src={selectedImage}
                     alt="Imagem principal"
                     className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                   />
                   <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-3">
                       <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                       </svg>
                     </div>
                   </div>
                 </button>
               </div>
               
               {/* Thumbnail Grid */}
               <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                 {displayImages.map((image, index) => (
                   <button 
                     key={index} 
                     onClick={() => setSelectedImage(image)}
                     className={`relative overflow-hidden rounded-lg aspect-square transition-all duration-200 ${
                       selectedImage === image ? 'ring-2 ring-red-600 ring-offset-2' : 'hover:opacity-80'
                     }`}
                   >
                     <img
                       src={image}
                       alt={`Miniatura ${index + 1}`}
                       className="w-full h-full object-cover"
                     />
                   </button>
                 ))}
               </div>
             </section>

            {/* Description */}
            <section className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Descrição</h2>
              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                {property.description}
              </p>
            </section>

            {/* Property Details */}
            <section className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">Detalhes do Imóvel</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {property.tipo_imovel && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tipo de Imóvel</p>
                      <p className="text-lg font-semibold text-gray-900">{property.tipo_imovel}</p>
                    </div>
                  </div>
                )}
                
                {property.situacao_ocupacao && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Situação</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {property.situacao_ocupacao === 'alugado' ? 'Ocupado' : 'Desocupado'}
                      </p>
                    </div>
                  </div>
                )}
                
                {property.possui_elevador !== null && property.possui_elevador !== undefined && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2v8h10V6H5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Elevador</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {property.possui_elevador ? 'Sim' : 'Não'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Property Features */}
            {property.caracteristicas_imovel && property.caracteristicas_imovel.length > 0 && (
              <section className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-blue-900 mb-6">Características do Imóvel</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {property.caracteristicas_imovel.map(feature => (
                    <div key={feature} className="flex items-center p-3 bg-red-50 rounded-xl">
                      <FeatureIcon feature={feature} className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">
                        {t(`publishJourney.detailsForm.${feature}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* Condo Amenities */}
            {property.caracteristicas_condominio && property.caracteristicas_condominio.length > 0 && (
              <section className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-blue-900 mb-6">Comodidades do Condomínio</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {property.caracteristicas_condominio.map(feature => (
                    <div key={feature} className="flex items-center p-3 bg-blue-50 rounded-xl">
                      <FeatureIcon feature={feature} className="w-5 h-5 text-blue-900 mr-3 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">
                        {t(`publishJourney.detailsForm.${feature}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Video Gallery */}
            {property.videos && property.videos.length > 0 && (
              <section className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-blue-900 mb-6">Vídeos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {property.videos.map((videoUrl, index) => (
                    <div key={index} className="aspect-video rounded-xl overflow-hidden shadow-lg">
                       <iframe 
                          src={videoUrl} 
                          title={`Vídeo ${index + 1}`} 
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                          className="w-full h-full"
                      ></iframe>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Contact Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              {/* Contact Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-blue-900 mb-4">Interessado?</h3>
                <p className="text-gray-600 mb-6">Entre em contato conosco para mais informações ou para agendar uma visita.</p>
                
                <div className="space-y-4">
                   <button 
                     onClick={() => window.open('tel:71997348409', '_self')}
                     className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition duration-300 shadow-lg flex items-center justify-center gap-3"
                   >
                     <img 
                       src="https://static.thenounproject.com/png/call-icon-451546-512.png" 
                       alt="Telefone" 
                       className="w-6 h-6 filter brightness-0 invert"
                     />
                     Ligar Agora
                   </button>
                   
                   <button 
                     onClick={() => window.open('https://wa.me/5571997348409?text=Olá! Tenho interesse no imóvel: ' + encodeURIComponent(property.title), '_blank')}
                     className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition duration-300 shadow-lg flex items-center justify-center gap-3"
                   >
                     <img 
                       src="https://static.thenounproject.com/png/whatsapp-icon-6592278-512.png" 
                       alt="WhatsApp" 
                       className="w-6 h-6 filter brightness-0 invert"
                     />
                     WhatsApp
                   </button>
                   
                   <button 
                     onClick={() => window.open(`mailto:quallityhomeempreendimento@gmail.com?subject=Interesse no imóvel: ${encodeURIComponent(property.title)}&body=Olá! Tenho interesse no imóvel "${property.title}" localizado em ${property.address}. Gostaria de mais informações.`, '_blank')}
                     className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition duration-300 shadow-lg flex items-center justify-center gap-3"
                   >
                     <img 
                       src="https://static.thenounproject.com/png/email-icon-8033364-512.png" 
                       alt="Email" 
                       className="w-6 h-6 filter brightness-0 invert"
                     />
                     Enviar Email
                   </button>
                 </div>
              </div>

              {/* Quick Info */}
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="text-xl font-bold mb-4">Informações Rápidas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Código:</span>
                    <span className="font-semibold">#{property.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Tipo:</span>
                    <span className="font-semibold">{property.tipo_imovel || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Área:</span>
                    <span className="font-semibold">{property.area} m²</span>
                  </div>
                  {formattedCondoFee && (
                    <div className="flex justify-between">
                      <span className="text-blue-200">Condomínio:</span>
                      <span className="font-semibold">{formattedCondoFee}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white text-gray-600 py-4 text-center border-t">
        <div className="container mx-auto px-4 sm:px-6">
          <p>&copy; {new Date().getFullYear()} Quallity Home Portal Imobiliário</p>
          <div className="mt-2 flex justify-center items-center space-x-4">
            <a 
              href="https://www.instagram.com/portalimobiliarioquallityhome/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Siga-nos no Instagram" 
              className="inline-block hover:opacity-75 transition-opacity"
            >
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3621/3621435.png" 
                alt="Instagram" 
                className="h-6 w-6" 
              />
            </a>
          </div>
        </div>
      </footer>
    </div>
    
    {/* Modal Lightbox da Galeria */}
    {isGalleryOpen && (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
        {/* Overlay para fechar */}
        <div 
          className="absolute inset-0 cursor-pointer" 
          onClick={closeGallery}
        ></div>
        
        {/* Container do Modal */}
        <div className="relative w-full h-full flex items-center justify-center p-4">
          
          {/* Botão Fechar */}
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-200"
            aria-label="Fechar galeria"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Contador de Imagens */}
          <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm font-medium">
            {currentImageIndex + 1} / {displayImages.length}
          </div>
          
          {/* Botão Anterior */}
          {displayImages.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-200"
              aria-label="Imagem anterior"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {/* Botão Próximo */}
          {displayImages.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-200"
              aria-label="Próxima imagem"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          
          {/* Imagem Principal */}
          <div ref={galleryImageRef} className="relative max-w-full max-h-full">
            <img
              src={displayImages[currentImageIndex]}
              alt={`Imagem ${currentImageIndex + 1} da galeria`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              style={{ maxHeight: 'calc(100vh - 120px)' }}
            />
          </div>
          
          {/* Navegação por Miniaturas (apenas se houver mais de 1 imagem) */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="flex space-x-2 bg-black bg-opacity-50 p-3 rounded-full max-w-xs overflow-x-auto">
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'border-white scale-110' 
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Indicadores de Gestos */}
    <GestureIndicator
      type={gestureState.activeGesture === 'swipe-back' ? 'swipe-back' : 
            gestureState.activeGesture === 'swipe-next' ? 'swipe-next' : 
            gestureState.activeGesture === 'swipe-prev' ? 'swipe-prev' : 'pull-refresh'}
      isActive={gestureState.activeGesture !== 'none'}
      progress={gestureState.swipeProgress}
    />
    </>
  );
};

export default PropertyDetailPage;