import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface PublishPropertyPageProps {
  onNavigateToAdminLogin?: () => void;
}

const PublishPropertyPage: React.FC<PublishPropertyPageProps> = ({ onNavigateToAdminLogin }) => {
  const { t } = useLanguage();

  const handleAdminLogin = () => {
    // Usar a navegação correta do App.tsx
    if (onNavigateToAdminLogin) {
      onNavigateToAdminLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Logo */}
        <div className="mb-6">
          <img 
            src="https://i.postimg.cc/QNJ63Www/logo.png" 
            alt="Quallity Home Logo" 
            className="h-16 w-auto mx-auto"
          />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Publicação de Imóveis
        </h1>

        {/* Mensagem informativa */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-700 font-medium">Acesso Restrito</span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            A publicação de imóveis é restrita apenas aos administradores do sistema.
          </p>
          
          <p className="text-gray-600">
            Se você é um administrador, faça login para acessar o painel de publicação.
          </p>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          <button
            onClick={handleAdminLogin}
            className="w-full bg-brand-red text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Acessar Painel Administrativo
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300"
          >
            Voltar
          </button>
        </div>

        {/* Informações de contato */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Precisa de ajuda? Entre em contato conosco.
          </p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="mailto:admin@quallityhome.com" className="text-brand-red hover:text-red-700 text-sm">
              Email
            </a>
            <span className="text-gray-300">|</span>
            <a href="tel:+5511999999999" className="text-brand-red hover:text-red-700 text-sm">
              Telefone
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishPropertyPage;