import React, { useState } from 'react';
import SearchIcon from './icons/SearchIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';

const Hero: React.FC = () => {
  const [activeTab, setActiveTab] = useState('comprar');

  return (
    <div 
      className="relative h-[550px] w-full flex items-center justify-center text-center bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}
    >
      <div className="relative z-20 p-6 md:p-8 bg-brand-lime rounded-lg shadow-2xl w-11/12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6">
          Tudo começa hoje
        </h1>
        
        <div className="bg-white p-2 rounded-lg">
          <div className="flex border-b mb-4">
            <button 
              onClick={() => setActiveTab('comprar')}
              className={`px-6 py-2 text-lg font-medium transition-colors duration-300 ${activeTab === 'comprar' ? 'border-b-4 border-brand-purple text-brand-dark' : 'text-brand-gray'}`}
            >
              Comprar
            </button>
            <button 
              onClick={() => setActiveTab('alugar')}
              className={`px-6 py-2 text-lg font-medium transition-colors duration-300 ${activeTab === 'alugar' ? 'border-b-4 border-brand-purple text-brand-dark' : 'text-brand-gray'}`}
            >
              Alugar
            </button>
          </div>

          <form className="flex flex-col md:flex-row items-center gap-2">
            <div className="relative w-full md:w-auto">
              <select className="w-full md:w-52 appearance-none bg-white border border-gray-300 rounded-md px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-purple text-brand-dark">
                <option>Casas e apartamentos</option>
                <option>Escritórios</option>
                <option>Garagens</option>
              </select>
              <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative w-full md:flex-grow">
              <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
              <input 
                type="text" 
                placeholder="Digite a localização"
                className="w-full px-10 py-3 rounded-md text-brand-dark border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-purple"
              />
            </div>
            <button 
              type="submit"
              className="w-full md:w-auto bg-brand-purple hover:opacity-90 text-white font-bold py-3 px-10 rounded-md transition duration-300"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Hero;