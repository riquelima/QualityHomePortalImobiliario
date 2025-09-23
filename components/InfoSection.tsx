import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface InfoSectionProps {
  onDrawOnMapClick: () => void;
  onPublishAdClick: () => void;
}

const InfoSection: React.FC<InfoSectionProps> = ({ onDrawOnMapClick, onPublishAdClick }) => {
  const { t } = useLanguage();
  return (
    <section className="bg-brand-light-gray py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card 1: Desenhar zona */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center space-x-4 sm:space-x-6">
            <img src="https://cdn-icons-png.flaticon.com/512/0/581.png" alt="Map illustration" className="w-20 h-20 sm:w-24 sm:h-24 object-contain flex-shrink-0"/>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-brand-navy mb-2">{t('infoSection.draw.title')}</h3>
              <p className="text-brand-gray mb-4 text-sm sm:text-base">{t('infoSection.draw.description')}</p>
              <button 
                onClick={onDrawOnMapClick} 
                className="text-brand-red hover:underline font-medium text-left text-sm sm:text-base"
              >
                {t('infoSection.draw.link')}
              </button>
            </div>
          </div>

          {/* Card 2: Publicar imóvel */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center space-x-4 sm:space-x-6">
            <img src="https://cdn-icons-png.flaticon.com/512/5455/5455731.png" alt="Phone illustration" className="w-20 h-20 sm:w-24 sm:h-24 object-contain flex-shrink-0"/>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-brand-navy mb-2">{t('infoSection.publish.title')}</h3>
              <p className="text-brand-gray mb-4 text-sm sm:text-base">{t('infoSection.publish.description')}</p>
              <button onClick={onPublishAdClick} className="text-brand-red hover:underline font-medium text-left text-sm sm:text-base">{t('infoSection.publish.link')}</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;