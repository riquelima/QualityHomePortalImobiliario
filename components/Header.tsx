
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 bg-transparent text-white">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="#" className="text-2xl font-bold">
          Quality Home
        </a>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#" className="hover:text-brand-neutral-medium transition duration-300">Comprar</a>
          <a href="#" className="hover:text-brand-neutral-medium transition duration-300">Alugar</a>
          <a href="#" className="hover:text-brand-neutral-medium transition duration-300">Anunciar</a>
          <a href="#" className="hover:text-brand-neutral-medium transition duration-300">Para Corretores</a>
        </div>
        <button className="px-4 py-2 border border-white rounded-md hover:bg-white hover:text-brand-neutral-black transition duration-300">
          Entrar
        </button>
      </nav>
    </header>
  );
};

export default Header;
