
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface InfoSectionProps {
  onDrawOnMapClick: () => void;
}

const InfoSection: React.FC<InfoSectionProps> = ({ onDrawOnMapClick }) => {
  const { t } = useLanguage();
  return (
    <section className="bg-brand-light-gray py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card 1: Desenhar zona */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center space-x-6">
            <img src="https://picsum.photos/seed/map/100/100" alt="Map illustration" className="w-24 h-24 rounded-full object-cover"/>
            <div>
              <h3 className="text-xl font-bold text-brand-navy mb-2">{t('infoSection.draw.title')}</h3>
              <p className="text-brand-gray mb-4">{t('infoSection.draw.description')}</p>
              <button 
                onClick={onDrawOnMapClick} 
                className="text-brand-red hover:underline font-medium text-left"
              >
                {t('infoSection.draw.link')}
              </button>
            </div>
          </div>

          {/* Card 2: Publicar imóvel */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center space-x-6">
            <img src="https://picsum.photos/seed/phone/100/100" alt="Phone illustration" className="w-24 h-24 rounded-full object-cover"/>
            <div>
              <h3 className="text-xl font-bold text-brand-navy mb-2">{t('infoSection.publish.title')}</h3>
              <p className="text-brand-gray mb-4">{t('infoSection.publish.description')}</p>
              <a href="#" className="text-brand-red hover:underline font-medium">{t('infoSection.publish.link')}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
