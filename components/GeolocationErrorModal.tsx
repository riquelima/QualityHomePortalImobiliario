
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import CloseIcon from './icons/CloseIcon';
import LocationErrorIcon from './icons/LocationErrorIcon';

interface GeolocationErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GeolocationErrorModal: React.FC<GeolocationErrorModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      aria-labelledby="geo-error-modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true"></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl w-11/12 max-w-md p-6 sm:p-8 m-4 transform transition-all text-center">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label={t('header.closeMenu')}
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <LocationErrorIcon className="h-6 w-6 text-brand-red" />
        </div>

        <h2 id="geo-error-modal-title" className="text-xl sm:text-2xl font-bold text-brand-navy mb-2">
          {t('geolocationErrorModal.title')}
        </h2>
        <p className="text-brand-gray mb-6">
          {t('geolocationErrorModal.description')}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-brand-red text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity"
        >
          {t('geolocationErrorModal.closeButton')}
        </button>
      </div>
    </div>
  );
};

export default GeolocationErrorModal;
