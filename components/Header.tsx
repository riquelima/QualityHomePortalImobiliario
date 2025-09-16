import React, { useState } from 'react';
import UserIcon from './icons/UserIcon';
import FlagPTIcon from './icons/FlagPTIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import HamburgerIcon from './icons/HamburgerIcon';
import CloseIcon from './icons/CloseIcon';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center relative">
          {/* Logo */}
          <a href="#" className="absolute left-6 top-1/2 -translate-y-1/2 transform transition-transform duration-300 hover:scale-105 z-10">
            <img src="https://i.imgur.com/FuxDdyF.png" alt="Quality Home Logo" className="h-20" />
          </a>

          {/* Desktop Navigation Links */}
          <div className="flex-1">
            <div className="hidden md:flex items-center space-x-6 text-sm pl-96">
              <a href="#" className="text-brand-dark hover:text-brand-red transition duration-300">Proprietários</a>
              <a href="#" className="text-brand-dark hover:text-brand-red transition duration-300">Buscar imóveis</a>
              <a href="#" className="text-brand-dark hover:text-brand-red transition duration-300">Crédito imobiliário</a>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4 text-sm">
            {/* Desktop "Publique" button */}
            <button className="hidden md:block px-4 py-2 border border-brand-gray rounded-md hover:border-brand-dark transition duration-300">
              Publique seu anúncio
            </button>
            
            {/* Language Selector */}
            <button className="flex items-center space-x-1">
              <FlagPTIcon className="w-6 h-auto" />
              <ChevronDownIcon className="w-4 h-4 text-brand-gray" />
            </button>
            
            {/* User/Login Link */}
            <a href="#" className="flex items-center space-x-2 hover:text-brand-red transition duration-300">
              <UserIcon className="w-6 h-6" />
              <span className="hidden md:inline">Acessar</span>
            </a>

            {/* Hamburger Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menu">
              <HamburgerIcon className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </header>
      
      {/* Mobile Menu */}
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      ></div>

      {/* Panel */}
      <aside 
        className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 id="mobile-menu-title" className="text-lg font-bold text-brand-navy">Menu</h2>
          <button onClick={() => setIsMenuOpen(false)} aria-label="Fechar menu">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex flex-col p-4 space-y-4 text-lg">
          <a href="#" className="text-brand-dark hover:text-brand-red transition duration-300">Proprietários</a>
          <a href="#" className="text-brand-dark hover:text-brand-red transition duration-300">Buscar imóveis</a>
          <a href="#" className="text-brand-dark hover:text-brand-red transition duration-300">Crédito imobiliário</a>
          <hr className="my-4" />
          <button className="w-full text-center px-4 py-2 bg-brand-red text-white rounded-md hover:opacity-90 transition duration-300">
            Publique seu anúncio
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Header;
