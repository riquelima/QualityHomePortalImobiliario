import React from 'react';
import UserIcon from './icons/UserIcon';
import FlagBRIcon from './icons/FlagBRIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Adicionado 'relative' para ser o contexto de posicionamento do logo */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center relative">
        {/* Logo posicionado absolutamente para sobrepor o header sem afetar o fluxo do layout */}
        <a href="#" className="absolute left-6 top-1/2 -translate-y-1/2 transform transition-transform duration-300 hover:scale-105 z-10">
          <img src="https://i.imgur.com/FuxDdyF.png" alt="Quality Home Logo" className="h-20" />
        </a>

        {/* Container para os links de navegação, com flex-1 para empurrar os itens da direita */}
        <div className="flex-1">
          {/* Adicionado padding à esquerda para não sobrepor o logo */}
          <div className="hidden md:flex items-center space-x-6 text-sm pl-96">
            <a href="#" className="text-brand-dark hover:text-brand-red transition duration-300">Proprietários</a>
            <a href="#" className="text-brand-dark hover:text-brand-red transition duration-300">Buscar imóveis</a>
            <a href="#" className="text-brand-dark hover:text-brand-red transition duration-300">Crédito imobiliário</a>
          </div>
        </div>

        {/* Ações do lado direito */}
        <div className="flex items-center space-x-4 text-sm">
          <button className="hidden sm:block px-4 py-2 border border-brand-gray rounded-md hover:border-brand-dark transition duration-300">
            Publique seu anúncio
          </button>
          <button className="flex items-center space-x-1">
            <FlagBRIcon className="w-5 h-5 rounded-sm" />
            <ChevronDownIcon className="w-4 h-4 text-brand-gray" />
          </button>
          <a href="#" className="flex items-center space-x-2 hover:text-brand-red transition duration-300">
            <UserIcon className="w-5 h-5" />
            <span>Acessar</span>
          </a>
        </div>
      </nav>
    </header>
  );
};

export default Header;