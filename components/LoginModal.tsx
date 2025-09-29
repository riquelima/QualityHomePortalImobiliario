import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import CloseIcon from './icons/CloseIcon';
import AppleIcon from './icons/AppleIcon';
import GoogleIcon from './icons/GoogleIcon';
import { supabase } from '../supabaseClient';
import SpinnerIcon from './icons/SpinnerIcon';
import type { ModalConfig } from '../App';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  loginIntent: 'default' | 'publish';
  showModal: (config: Omit<ModalConfig, 'isOpen'>) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, loginIntent, showModal }) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
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
      showModal({
        type: 'error',
        title: t('systemModal.errorTitle'),
        message: t('loginModal.googleLoginError')
      });
      setIsGoogleLoading(false);
    }
    // On successful redirect initiation, loading state is not turned off here
    // as the page will reload. If the user closes the popup, the promise resolves,
    // and we need to stop the loading state.
    setTimeout(() => setIsGoogleLoading(false), 1000); // Failsafe to turn off spinner
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-all duration-300 ease-in-out ${isOpen ? 'bg-opacity-50 backdrop-blur-sm' : 'bg-opacity-0 pointer-events-none'}`}
      aria-labelledby="login-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white rounded-lg shadow-xl w-11/12 max-w-md p-6 sm:p-8 m-4 transform transition-all duration-300 ease-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label={t('header.closeMenu')}
        >
          <CloseIcon className="w-6 h-6" />
        </button>

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
             disabled={isGoogleLoading}
             className="w-full max-w-[300px] mx-auto flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-brand-dark hover:bg-gray-50 disabled:opacity-50 disabled:cursor-wait"
           >
             {isGoogleLoading ? (
                <SpinnerIcon className="w-5 h-5 mr-3 animate-spin" />
             ) : (
                <GoogleIcon className="w-5 h-5 mr-3" />
             )}
             <span>{t('loginModal.googleButton')}</span>
           </button>
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
