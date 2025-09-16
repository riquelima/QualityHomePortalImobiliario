import React from 'react';

const InfoSection: React.FC = () => {
  return (
    <section className="bg-brand-light-gray py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card 1: Desenhar zona */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center space-x-6">
            <img src="https://picsum.photos/seed/map/100/100" alt="Map illustration" className="w-24 h-24 rounded-full object-cover"/>
            <div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">Desenhe a sua área de busca</h3>
              <p className="text-brand-gray mb-4">Escolha exatamente a área que você procura no mapa.</p>
              <a href="#" className="text-blue-600 hover:underline font-medium">Desenhar sua área de busca</a>
            </div>
          </div>

          {/* Card 2: Publicar imóvel */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center space-x-6">
            <img src="https://picsum.photos/seed/phone/100/100" alt="Phone illustration" className="w-24 h-24 rounded-full object-cover"/>
            <div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">Publique seu imóvel grátis</h3>
              <p className="text-brand-gray mb-4">Os seus 2 primeiros anúncios são grátis. Casas, quartos, escritórios...</p>
              <a href="#" className="text-blue-600 hover:underline font-medium">Publicar um anúncio grátis</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;