
import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import CloseIcon from './icons/CloseIcon';
import AppleIcon from './icons/AppleIcon';

// Declara a variável global 'google' para o TypeScript
declare const google: any;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (credentialResponse: any) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { t } = useLanguage();
  const googleButtonDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '56933567945-a09i6ua38m4dvr5era3oq3vq1uknnb04.apps.googleusercontent.com',
        callback: onLoginSuccess,
      });

      if (googleButtonDiv.current) {
        googleButtonDiv.current.innerHTML = ''; // Limpa o botão antigo para evitar duplicatas
        google.accounts.id.renderButton(
          googleButtonDiv.current,
          { theme: "outline", size: "large", type: "standard", text: "continue_with", width: "300" } 
        );
      }
      
      // Opcional: Ativar o prompt "One Tap" para usuários que retornam
      // google.accounts.id.prompt();
    }
  }, [isOpen, onLoginSuccess]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      aria-labelledby="login-modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true"></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl w-11/12 max-w-md p-8 m-4 transform transition-all">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label={t('header.closeMenu')}
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <h2 id="login-modal-title" className="text-2xl font-bold text-brand-navy mb-2">
          {t('loginModal.title')}
        </h2>
        <p className="text-brand-gray mb-6">
          {t('loginModal.description')}
        </p>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-1">
              {t('loginModal.emailLabel')}
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red"
              placeholder="seuemail@exemplo.com"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-brand-red text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity"
          >
            {t('loginModal.continueButton')}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-brand-gray">{t('loginModal.socialLoginPrompt')}</span>
          </div>
        </div>
        
        <div className="space-y-3">
           <div ref={googleButtonDiv} className="flex justify-center"></div>
          <button className="w-full max-w-[300px] mx-auto flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-brand-dark hover:bg-gray-50">
            <AppleIcon className="w-5 h-5 mr-3" />
            <span>{t('loginModal.appleButton')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;