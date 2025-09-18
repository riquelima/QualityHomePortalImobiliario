import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SuccessIcon from './icons/SuccessIcon';
import ErrorIcon from './icons/ErrorIcon';
import WarningIcon from './icons/WarningIcon';

interface SystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'confirm';
}

const modalConfig = {
  success: {
    Icon: SuccessIcon,
    iconBgClass: 'bg-green-100',
    iconTextClass: 'text-green-600',
    confirmButtonClass: 'bg-brand-red hover:opacity-90',
  },
  error: {
    Icon: ErrorIcon,
    iconBgClass: 'bg-red-100',
    iconTextClass: 'text-brand-red',
    confirmButtonClass: 'bg-brand-red hover:opacity-90',
  },
  confirm: {
    Icon: WarningIcon,
    iconBgClass: 'bg-yellow-100',
    iconTextClass: 'text-yellow-500',
    confirmButtonClass: 'bg-brand-red hover:opacity-90',
  },
};


const SystemModal: React.FC<SystemModalProps> = ({ isOpen, onClose, onConfirm, title, message, type }) => {
  const { t } = useLanguage();
  const { Icon, iconBgClass, iconTextClass, confirmButtonClass } = modalConfig[type];

  if (!isOpen) {
    return null;
  }

  const handleConfirmClick = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      aria-labelledby="system-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0" onClick={type !== 'confirm' ? onClose : undefined} aria-hidden="true"></div>

      <div className="relative bg-white rounded-lg shadow-xl w-11/12 max-w-md p-6 sm:p-8 m-4 transform transition-all text-center">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${iconBgClass} mb-4`}>
          <Icon className={`h-7 w-7 ${iconTextClass}`} />
        </div>

        <h2 id="system-modal-title" className="text-xl sm:text-2xl font-bold text-brand-navy mb-2">
          {title}
        </h2>
        <p className="text-brand-gray mb-6">
          {message}
        </p>
        
        {type === 'confirm' ? (
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto flex-1 bg-gray-200 text-brand-dark font-bold py-3 px-4 rounded-md hover:bg-gray-300 transition-opacity"
              >
                {t('systemModal.cancelButton')}
              </button>
              <button
                type="button"
                onClick={handleConfirmClick}
                className={`w-full sm:w-auto flex-1 text-white font-bold py-3 px-4 rounded-md transition-opacity ${confirmButtonClass}`}
              >
                {t('systemModal.confirmButton')}
              </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className={`w-full text-white font-bold py-3 px-4 rounded-md transition-opacity ${confirmButtonClass}`}
          >
            {t('systemModal.okButton')}
          </button>
        )}
      </div>
    </div>
  );
};

export default SystemModal;
