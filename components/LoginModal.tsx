

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import CloseIcon from './icons/CloseIcon';
import AppleIcon from './icons/AppleIcon';
import GoogleIcon from './icons/GoogleIcon';
import { supabase } from '../supabaseClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  loginIntent: 'default' | 'publish';
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, loginIntent }) => {
  const { t } = useLanguage();

  const handleGoogleLogin = async () => {
    localStorage.setItem('loginIntent', loginIntent);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error('Error logging in with Google:', error.message);
      localStorage.removeItem('loginIntent');
    }
  };
  
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      aria-labelledby="login-modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true"></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-t-2xl w-full max-w-md p-6 m-0 transform transition-transform animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <div/>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
            aria-label={t('header.closeMenu')}
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <h2 id="login-modal-title" className="text-xl sm:text-2xl font-bold text-brand-navy mb-2">
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
           <button 
             onClick={handleGoogleLogin}
             className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-brand-dark hover:bg-gray-50"
           >
             <GoogleIcon className="w-5 h-5 mr-3" />
             <span>{t('loginModal.googleButton')}</span>
           </button>
          <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-brand-dark hover:bg-gray-50">
            <AppleIcon className="w-5 h-5 mr-3" />
            <span>{t('loginModal.appleButton')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;