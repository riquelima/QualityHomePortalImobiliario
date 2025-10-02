import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LocationIcon from './icons/LocationIcon';

interface InitialGeolocationModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

const InitialGeolocationModal: React.FC<InitialGeolocationModalProps> = ({ isOpen, onAllow, onDeny }) => {
  const { t } = useLanguage();

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-[150] flex items-center justify-center bg-black transition-all duration-300 ease-in-out ${isOpen ? 'bg-opacity-50 backdrop-blur-sm' : 'bg-opacity-0 pointer-events-none'}`}
      aria-labelledby="initial-geo-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white rounded-lg shadow-xl w-11/12 max-w-md p-6 sm:p-8 m-4 transform transition-all duration-300 ease-out text-center ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <LocationIcon className="h-7 w-7 text-blue-600" />
        </div>
        
        <h2 id="initial-geo-modal-title" className="text-xl sm:text-2xl font-bold text-brand-navy mb-2">
          {t('initialGeolocationModal.title')}
        </h2>
        <p className="text-brand-gray mb-6">
          {t('initialGeolocationModal.message')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={onDeny} className="flex-1 order-2 sm:order-1 text-sm bg-gray-200 text-brand-dark font-semibold py-3 px-4 rounded-md hover:bg-gray-300 transition-colors">
                {t('initialGeolocationModal.denyButton')}
            </button>
            <button onClick={onAllow} className="flex-1 order-1 sm:order-2 text-sm bg-brand-red text-white font-semibold py-3 px-4 rounded-md hover:opacity-90 transition-colors">
                {t('initialGeolocationModal.allowButton')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default InitialGeolocationModal;
