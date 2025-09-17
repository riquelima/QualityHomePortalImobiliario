
import React from 'react';
import { Property, PropertyStatus } from '../types';
import PropertyCard from './PropertyCard';
import { useLanguage } from '../contexts/LanguageContext';

// FIX: Added email to each owner to align with the updated Property type for chat functionality.
export const MOCK_PROPERTIES: Property[] = [
  {
    id: 1,
    title: 'Apartamento Luxo com Vista Mar no Farol da Barra',
    address: 'Av. Oceânica, Barra, Salvador, Bahia',
    price: 3500000,
    bedrooms: 3,
    bathrooms: 4,
    area: 220,
    images: ['https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/3288103/pexels-photo-3288103.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'],
    description: 'Este deslumbrante apartamento de luxo oferece uma vista panorâmica inigualável para o mar, localizado no coração do Farol da Barra. Com acabamentos de alto padrão, amplos espaços e design moderno, é o refúgio perfeito para quem busca conforto e sofisticação. A sala de estar se abre para uma varanda gourmet, ideal para entreter convidados enquanto aprecia o pôr do sol.',
    videos: ['https://www.youtube.com/embed/U32Z7gUXa-c'],
    status: PropertyStatus.New,
    lat: -13.010,
    lng: -38.533,
    // FIX: Updated owner object to match Profile type.
    owner: { id: 'mock-user-1', nome_completo: 'Carlos Andrade', url_foto_perfil: '', phone: '5571988776655', email: 'carlos.andrade@email.com' }
  },
  {
    id: 2,
    title: 'Casa de Praia em Condomínio em Porto Seguro',
    address: 'Estrada da Balsa, Arraial d\'Ajuda, Porto Seguro, Bahia',
    price: 4200000,
    bedrooms: 4,
    bathrooms: 5,
    area: 450,
    images: ['https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/2440471/pexels-photo-2440471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'],
    description: 'Uma casa de praia espetacular em um condomínio fechado, oferecendo segurança e privacidade. Com acesso direto à praia, esta propriedade possui uma piscina incrível, área de churrasco e um jardim tropical exuberante. Os interiores são espaçosos e arejados, com decoração que combina o rústico e o moderno.',
    status: PropertyStatus.Updated,
    lat: -16.495,
    lng: -39.060,
    // FIX: Updated owner object to match Profile type.
    owner: { id: 'mock-user-2', nome_completo: 'Mariana Costa', url_foto_perfil: '', phone: '5573999887766', email: 'mariana.costa@email.com' }
  },
  {
    id: 3,
    title: 'Cobertura Duplex no Corredor da Vitória',
    address: 'Av. Sete de Setembro, Vitória, Salvador, Bahia',
    price: 5800000,
    bedrooms: 3,
    bathrooms: 5,
    area: 310,
    images: ['https://images.pexels.com/photos/6585758/pexels-photo-6585758.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/5997993/pexels-photo-5997993.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/6492397/pexels-photo-6492397.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/3935320/pexels-photo-3935320.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'],
    description: 'Esta cobertura duplex exclusiva no Corredor da Vitória oferece um estilo de vida de alto padrão. No primeiro piso, encontram-se as áreas sociais integradas e uma cozinha gourmet. O segundo piso conta com um terraço privativo com piscina e uma vista deslumbrante da Baía de Todos os Santos.',
    lat: -12.991,
    lng: -38.528,
    // FIX: Updated owner object to match Profile type.
    owner: { id: 'mock-user-3', nome_completo: 'Fernanda Lima', url_foto_perfil: '', phone: '5571991234567', email: 'fernanda.lima@email.com' }
  },
    {
    id: 4,
    title: 'Pousada Charmosa na Chapada Diamantina',
    address: 'Rua das Pedras, Lençóis, Bahia',
    price: 2100000,
    bedrooms: 8,
    bathrooms: 9,
    area: 600,
    images: ['https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/70441/pexels-photo-70441.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/271643/pexels-photo-271643.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/261169/pexels-photo-261169.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'],
    description: 'Uma pousada cheia de charme e totalmente operacional no coração de Lençóis, a porta de entrada para a Chapada Diamantina. Com suítes confortáveis, uma área de café da manhã encantadora e um jardim relaxante, é um investimento pronto para gerar renda em um dos destinos turísticos mais procurados do Brasil.',
    videos: ['https://www.youtube.com/embed/y9peY2_Yy_I'],
    status: PropertyStatus.New,
    lat: -12.561,
    lng: -41.390,
    // FIX: Updated owner object to match Profile type.
    owner: { id: 'mock-user-4', nome_completo: 'Ricardo Alves', url_foto_perfil: '', phone: '5575988771122', email: 'ricardo.alves@email.com' }
  },
  {
    id: 5,
    title: 'Bangalô com Vista para o Mar em Itacaré',
    address: 'Praia da Concha, Itacaré, Bahia',
    price: 980000,
    bedrooms: 1,
    bathrooms: 1,
    area: 80,
    images: ['https://images.pexels.com/photos/259962/pexels-photo-259962.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/1660027/pexels-photo-1660027.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/2893177/pexels-photo-2893177.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'],
    description: 'Este bangalô romântico é perfeito para casais, oferecendo uma vista espetacular para o mar da Praia da Concha. Com um design rústico-chique, possui uma varanda privativa com rede, uma pequena cozinha e um ambiente totalmente integrado à natureza. Ideal para quem busca um refúgio tranquilo e inspirador.',
    lat: -14.280,
    lng: -38.996,
    // FIX: Updated owner object to match Profile type.
    owner: { id: 'mock-user-5', nome_completo: 'Ana Pereira', url_foto_perfil: '', phone: '5573999554433', email: 'ana.pereira@email.com' }
  },
  {
    id: 6,
    title: 'Mansão à Beira-Mar em Trancoso',
    address: 'Praia dos Nativos, Trancoso, Porto Seguro, Bahia',
    price: 12500000,
    bedrooms: 6,
    bathrooms: 8,
    area: 1200,
    images: ['https://images.pexels.com/photos/210617/pexels-photo-210617.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/1329711/pexels-photo-1329711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'],
    description: 'Uma mansão cinematográfica "pé na areia" na badalada Praia dos Nativos. A propriedade conta com um design assinado por arquiteto renomado, piscina de borda infinita de frente para o mar, e seis suítes luxuosas. É o epítome do luxo e exclusividade no destino mais cobiçado do litoral baiano.',
    status: PropertyStatus.Updated,
    lat: -16.581,
    lng: -39.073,
    // FIX: Updated owner object to match Profile type.
    owner: { id: 'mock-user-6', nome_completo: 'Beatriz Monteiro', url_foto_perfil: '', phone: '5573988771234', email: 'beatriz.monteiro@email.com' }
  },
  { id: 7, title: 'Apartamento na Pituba, 3 quartos', address: 'Rua Ceará, Pituba, Salvador, Bahia', price: 650000, bedrooms: 3, bathrooms: 2, area: 110, images: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'], description: 'Amplo apartamento na Pituba, próximo a escolas, supermercados e tudo que sua família precisa. Possui 3 quartos, sendo uma suíte, e varanda.', lat: -12.999, lng: -38.455, owner: { id: 'mock-user-7', nome_completo: 'João Santos', url_foto_perfil: '', phone: '5571999998888', email: 'joao.santos@email.com' } },
  { id: 8, title: 'Casa com piscina em Stella Maris', address: 'Alameda Praia de Guaratuba, Stella Maris, Salvador, Bahia', price: 1200000, bedrooms: 4, bathrooms: 4, area: 350, images: ['https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/221540/pexels-photo-221540.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'], description: 'Excelente casa em condomínio fechado em Stella Maris, com 4 suítes, piscina privativa e área gourmet. A poucos metros da praia.', videos: ['https://www.youtube.com/embed/z2w7-I0W_0g'], status: PropertyStatus.New, lat: -12.943, lng: -38.337, owner: { id: 'mock-user-8', nome_completo: 'Maria Oliveira', url_foto_perfil: '', phone: '5571988887777', email: 'maria.oliveira@email.com' } },
  { id: 9, title: 'Apartamento 2 quartos no Rio Vermelho', address: 'Rua da Paciência, Rio Vermelho, Salvador, Bahia', price: 520000, bedrooms: 2, bathrooms: 2, area: 80, images: ['https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'], description: 'Apartamento charmoso no coração do Rio Vermelho, o bairro mais boêmio de Salvador. Ideal para quem busca viver perto de bares, restaurantes e da vida cultural da cidade.', lat: -13.014, lng: -38.494, owner: { id: 'mock-user-9', nome_completo: 'Pedro Souza', url_foto_perfil: '', phone: '5571999887766', email: 'pedro.souza@email.com' } },
  { id: 10, title: 'Casa no Pelourinho para fins comerciais', address: 'Largo do Pelourinho, Pelourinho, Salvador, Bahia', price: 950000, bedrooms: 5, bathrooms: 3, area: 250, images: ['https://images.pexels.com/photos/161815/brazil-carnival-salvador-pelourinho-161815.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/1560065/pexels-photo-1560065.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'], description: 'Casarão histórico no Pelourinho, perfeito para instalação de pousada, restaurante ou galeria de arte. Uma oportunidade única de investimento no centro histórico de Salvador.', lat: -12.971, lng: -38.509, owner: { id: 'mock-user-10', nome_completo: 'Luiza Fernandes', url_foto_perfil: '', phone: '5571988776655', email: 'luiza.fernandes@email.com' } },
  { id: 54, title: 'Casa em condomínio em SAJ', address: 'Rua do Cajueiro, Santo Antônio de Jesus, Bahia', price: 550000, bedrooms: 3, bathrooms: 3, area: 180, images: ['https://images.pexels.com/photos/210602/pexels-photo-210602.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'], description: 'Casa moderna em condomínio fechado com infraestrutura de lazer em Santo Antônio de Jesus.', lat: -12.960, lng: -39.255, owner: { id: 'mock-user-54', nome_completo: 'José Almeida', url_foto_perfil: '', phone: '5575999881122', email: 'jose.almeida@email.com' } },
  { id: 55, title: 'Terreno para loteamento em SAJ', address: 'Zona de Expansão Urbana, SAJ, Bahia', price: 2200000, bedrooms: 0, bathrooms: 0, area: 30000, images: ['https://images.pexels.com/photos/158826/field-corn-air-frisch-158826.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/417054/pexels-photo-417054.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'], description: 'Grande área para desenvolvimento de loteamento residencial na zona de expansão de SAJ.', status: PropertyStatus.New, lat: -12.980, lng: -39.250, owner: { id: 'mock-user-55', nome_completo: 'Construtora Sol Nascente', url_foto_perfil: '', phone: '557536310000', email: 'contato@solnascente.com' } },
].map(p => ({
  ...p, 
  preco: p.price, 
  descricao: p.description, 
  titulo: p.title, 
  endereco_completo: p.address,
  quartos: p.bedrooms,
  banheiros: p.bathrooms,
  area_bruta: p.area,
  latitude: p.lat,
  longitude: p.lng,
}));


interface PropertyListingsProps {
  properties: Property[];
  onViewDetails: (id: number) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}

const PropertyListings: React.FC<PropertyListingsProps> = ({ properties, onViewDetails, favorites, onToggleFavorite }) => {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy text-center mb-4">{t('listings.title')}</h2>
        <p className="text-base sm:text-lg text-brand-gray text-center max-w-2xl mx-auto mb-12">
          {t('listings.description')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {properties.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              onViewDetails={onViewDetails}
              isFavorite={favorites.includes(property.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyListings;
