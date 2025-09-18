
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SuccessIcon from './icons/SuccessIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, title, message }) => {
  const { t } = useLanguage();

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      aria-labelledby="confirmation-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true"></div>

      <div className="relative bg-white rounded-lg shadow-xl w-11/12 max-w-md p-6 sm:p-8 m-4 transform transition-all text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <SuccessIcon className="h-7 w-7 text-brand-status-green" />
        </div>

        <h2 id="confirmation-modal-title" className="text-xl sm:text-2xl font-bold text-brand-navy mb-2">
          {title}
        </h2>
        <p className="text-brand-gray mb-6">
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-brand-red text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity"
        >
          {t('confirmationModal.closeButton')}
        </button>
      </div>
    </div>
  );
};

export default ConfirmationModal;
