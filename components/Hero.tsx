import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="relative h-screen w-full flex items-center justify-center text-center text-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="https://videos.pexels.com/video-files/7646757/7646757-uhd_2560_1440_25fps.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black/60 to-black/40 z-10"></div>
      
      <div className="relative z-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Encontre o imóvel dos seus sonhos
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mb-8 opacity-90 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          A plataforma premium para corretores e clientes que buscam excelência.
        </p>
        <div className="flex space-x-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <button className="bg-brand-blue hover:bg-brand-blue-dark text-white font-medium py-3 px-8 rounded-lg transition duration-300 shadow-lg">
            Buscar Imóveis
          </button>
          <button className="bg-transparent border-2 border-white text-white font-medium py-3 px-8 rounded-lg hover:bg-white hover:text-brand-neutral-black transition duration-300">
            Anunciar
          </button>
        </div>

        <div className="w-full max-w-4xl bg-white/20 backdrop-blur-md p-4 rounded-lg shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <form className="flex flex-col md:flex-row items-center gap-4">
            <input 
              type="text" 
              placeholder="Digite cidade, bairro ou palavra-chave..."
              className="w-full md:flex-grow px-4 py-3 rounded-md text-brand-neutral-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            <button 
              type="submit"
              className="w-full md:w-auto bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-3 px-8 rounded-md transition duration-300"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>
       <style>{`
          @keyframes fade-in-up {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
            opacity: 0;
          }
        `}</style>
    </div>
  );
};

export default Hero;