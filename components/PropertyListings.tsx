
import React from 'react';
import { Property, PropertyStatus } from '../types';
import PropertyCard from './PropertyCard';
import { useLanguage } from '../contexts/LanguageContext';

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 1,
    title: 'Apartamento Luxo com Vista Mar no Farol da Barra',
    address: 'Av. Oceânica, Barra, Salvador, Bahia',
    price: 3500000,
    bedrooms: 3,
    bathrooms: 4,
    area: 220,
    image: 'https://picsum.photos/seed/prop1/600/400',
    status: PropertyStatus.New,
    lat: -13.010,
    lng: -38.533,
  },
  {
    id: 2,
    title: 'Casa de Praia em Condomínio em Porto Seguro',
    address: 'Estrada da Balsa, Arraial d\'Ajuda, Porto Seguro, Bahia',
    price: 4200000,
    bedrooms: 4,
    bathrooms: 5,
    area: 450,
    image: 'https://picsum.photos/seed/prop2/600/400',
    status: PropertyStatus.Updated,
    lat: -16.495,
    lng: -39.060,
  },
  {
    id: 3,
    title: 'Cobertura Duplex no Corredor da Vitória',
    address: 'Av. Sete de Setembro, Vitória, Salvador, Bahia',
    price: 5800000,
    bedrooms: 3,
    bathrooms: 5,
    area: 310,
    image: 'https://picsum.photos/seed/prop3/600/400',
    lat: -12.991,
    lng: -38.528,
  },
    {
    id: 4,
    title: 'Pousada Charmosa na Chapada Diamantina',
    address: 'Rua das Pedras, Lençóis, Bahia',
    price: 2100000,
    bedrooms: 8,
    bathrooms: 9,
    area: 600,
    image: 'https://picsum.photos/seed/prop4/600/400',
    status: PropertyStatus.New,
    lat: -12.561,
    lng: -41.390,
  },
  {
    id: 5,
    title: 'Bangalô com Vista para o Mar em Itacaré',
    address: 'Praia da Concha, Itacaré, Bahia',
    price: 980000,
    bedrooms: 1,
    bathrooms: 1,
    area: 80,
    image: 'https://picsum.photos/seed/prop5/600/400',
    lat: -14.280,
    lng: -38.996,
  },
  {
    id: 6,
    title: 'Mansão à Beira-Mar em Trancoso',
    address: 'Praia dos Nativos, Trancoso, Porto Seguro, Bahia',
    price: 12500000,
    bedrooms: 6,
    bathrooms: 8,
    area: 1200,
    image: 'https://picsum.photos/seed/prop6/600/400',
    status: PropertyStatus.Updated,
    lat: -16.581,
    lng: -39.073,
  },
  // --- Novos 50 Imóveis ---
  // Salvador (20)
  { id: 7, title: 'Apartamento na Pituba, 3 quartos', address: 'Rua Ceará, Pituba, Salvador, Bahia', price: 650000, bedrooms: 3, bathrooms: 2, area: 110, image: 'https://picsum.photos/seed/prop7/600/400', lat: -12.999, lng: -38.455 },
  { id: 8, title: 'Casa com piscina em Stella Maris', address: 'Alameda Praia de Guaratuba, Stella Maris, Salvador, Bahia', price: 1200000, bedrooms: 4, bathrooms: 4, area: 350, image: 'https://picsum.photos/seed/prop8/600/400', status: PropertyStatus.New, lat: -12.943, lng: -38.337 },
  { id: 9, title: 'Apartamento 2 quartos no Rio Vermelho', address: 'Rua da Paciência, Rio Vermelho, Salvador, Bahia', price: 520000, bedrooms: 2, bathrooms: 2, area: 80, image: 'https://picsum.photos/seed/prop9/600/400', lat: -13.014, lng: -38.494 },
  { id: 10, title: 'Casa no Pelourinho para fins comerciais', address: 'Largo do Pelourinho, Pelourinho, Salvador, Bahia', price: 950000, bedrooms: 5, bathrooms: 3, area: 250, image: 'https://picsum.photos/seed/prop10/600/400', lat: -12.971, lng: -38.509 },
  { id: 11, title: 'Apartamento de 1 quarto na Graça', address: 'Rua da Graça, Graça, Salvador, Bahia', price: 380000, bedrooms: 1, bathrooms: 1, area: 55, image: 'https://picsum.photos/seed/prop11/600/400', status: PropertyStatus.Updated, lat: -12.998, lng: -38.523 },
  { id: 12, title: 'Cobertura com vista para a Baía de Todos os Santos', address: 'Ladeira da Barra, Barra, Salvador, Bahia', price: 2800000, bedrooms: 3, bathrooms: 4, area: 280, image: 'https://picsum.photos/seed/prop12/600/400', lat: -12.995, lng: -38.531 },
  { id: 13, title: 'Apartamento no Imbuí, perto do metrô', address: 'Rua das Gaivotas, Imbuí, Salvador, Bahia', price: 410000, bedrooms: 2, bathrooms: 2, area: 70, image: 'https://picsum.photos/seed/prop13/600/400', status: PropertyStatus.New, lat: -12.973, lng: -38.443 },
  { id: 14, title: 'Casa em condomínio fechado em Piatã', address: 'Rua da Gratidão, Piatã, Salvador, Bahia', price: 1500000, bedrooms: 4, bathrooms: 5, area: 400, image: 'https://picsum.photos/seed/prop14/600/400', lat: -12.951, lng: -38.361 },
  { id: 15, title: 'Studio Mobiliado em Ondina', address: 'Av. Oceânica, Ondina, Salvador, Bahia', price: 320000, bedrooms: 1, bathrooms: 1, area: 40, image: 'https://picsum.photos/seed/prop15/600/400', lat: -13.013, lng: -38.506 },
  { id: 16, title: 'Apartamento Amplo em Brotas', address: 'Av. Dom João VI, Brotas, Salvador, Bahia', price: 480000, bedrooms: 3, bathrooms: 3, area: 120, image: 'https://picsum.photos/seed/prop16/600/400', status: PropertyStatus.Updated, lat: -12.983, lng: -38.490 },
  { id: 17, title: 'Terreno em Itapuã, frente mar', address: 'Rua da Sereia, Itapuã, Salvador, Bahia', price: 700000, bedrooms: 0, bathrooms: 0, area: 1000, image: 'https://picsum.photos/seed/prop17/600/400', lat: -12.949, lng: -38.351 },
  { id: 18, title: 'Apartamento no Horto Florestal, alto padrão', address: 'Av. Santa Luzia, Horto Florestal, Salvador, Bahia', price: 2200000, bedrooms: 4, bathrooms: 5, area: 250, image: 'https://picsum.photos/seed/prop18/600/400', lat: -12.991, lng: -38.483 },
  { id: 19, title: 'Casa simples na Liberdade', address: 'Rua do Curuzu, Liberdade, Salvador, Bahia', price: 150000, bedrooms: 2, bathrooms: 1, area: 80, image: 'https://picsum.photos/seed/prop19/600/400', status: PropertyStatus.New, lat: -12.946, lng: -38.494 },
  { id: 20, title: 'Apartamento no Caminho das Árvores', address: 'Alameda das Espatódeas, Caminho das Árvores, Salvador, Bahia', price: 890000, bedrooms: 3, bathrooms: 3, area: 140, image: 'https://picsum.photos/seed/prop20/600/400', lat: -12.980, lng: -38.459 },
  { id: 21, title: 'Loja comercial na Avenida Sete', address: 'Av. Sete de Setembro, Centro, Salvador, Bahia', price: 600000, bedrooms: 0, bathrooms: 1, area: 100, image: 'https://picsum.photos/seed/prop21/600/400', lat: -12.978, lng: -38.513 },
  { id: 22, title: 'Apartamento na Federação', address: 'Rua Caetano Moura, Federação, Salvador, Bahia', price: 280000, bedrooms: 2, bathrooms: 1, area: 65, image: 'https://picsum.photos/seed/prop22/600/400', lat: -13.001, lng: -38.502 },
  { id: 23, title: 'Casa em Vilas do Atlântico', address: 'Praia de Ipitanga, Vilas do Atlântico, Lauro de Freitas, Bahia', price: 1300000, bedrooms: 4, bathrooms: 4, area: 380, image: 'https://picsum.photos/seed/prop23/600/400', status: PropertyStatus.Updated, lat: -12.899, lng: -38.315 },
  { id: 24, title: 'Apartamento com 2 quartos no Cabula', address: 'Rua Silveira Martins, Cabula, Salvador, Bahia', price: 250000, bedrooms: 2, bathrooms: 2, area: 60, image: 'https://picsum.photos/seed/prop24/600/400', lat: -12.956, lng: -38.461 },
  { id: 25, title: 'Sítio em Abrantes', address: 'Estrada do Coco, Abrantes, Camaçari, Bahia', price: 850000, bedrooms: 3, bathrooms: 3, area: 5000, image: 'https://picsum.photos/seed/prop25/600/400', status: PropertyStatus.New, lat: -12.783, lng: -38.286 },
  { id: 26, title: 'Apartamento na Ribeira com vista mar', address: 'Av. Beira Mar, Ribeira, Salvador, Bahia', price: 350000, bedrooms: 2, bathrooms: 1, area: 75, image: 'https://picsum.photos/seed/prop26/600/400', lat: -12.919, lng: -38.507 },
  // Recôncavo Baiano (30)
  // Cachoeira (5)
  { id: 27, title: 'Casa Colonial no Centro Histórico de Cachoeira', address: 'Rua 25 de Junho, Centro, Cachoeira, Bahia', price: 750000, bedrooms: 4, bathrooms: 3, area: 300, image: 'https://picsum.photos/seed/prop27/600/400', status: PropertyStatus.New, lat: -12.603, lng: -38.964 },
  { id: 28, title: 'Sítio às margens do Rio Paraguaçu', address: 'Zona Rural, Cachoeira, Bahia', price: 980000, bedrooms: 3, bathrooms: 2, area: 10000, image: 'https://picsum.photos/seed/prop28/600/400', lat: -12.615, lng: -38.971 },
  { id: 29, title: 'Pousada charmosa em Cachoeira', address: 'Ladeira da Ajuda, Cachoeira, Bahia', price: 1300000, bedrooms: 8, bathrooms: 9, area: 700, image: 'https://picsum.photos/seed/prop29/600/400', lat: -12.601, lng: -38.960 },
  { id: 30, title: 'Casa com 2 quartos em Cachoeira', address: 'Rua da Feira, Cachoeira, Bahia', price: 220000, bedrooms: 2, bathrooms: 1, area: 90, image: 'https://picsum.photos/seed/prop30/600/400', status: PropertyStatus.Updated, lat: -12.598, lng: -38.968 },
  { id: 31, title: 'Terreno com vista para o rio em Cachoeira', address: 'Alto da Levada, Cachoeira, Bahia', price: 180000, bedrooms: 0, bathrooms: 0, area: 800, image: 'https://picsum.photos/seed/prop31/600/400', lat: -12.608, lng: -38.955 },
  // Santo Amaro (5)
  { id: 32, title: 'Casa Grande em Santo Amaro da Purificação', address: 'Praça da Purificação, Centro, Santo Amaro, Bahia', price: 880000, bedrooms: 5, bathrooms: 4, area: 450, image: 'https://picsum.photos/seed/prop32/600/400', lat: -12.546, lng: -38.715 },
  { id: 33, title: 'Fazenda de gado perto de Santo Amaro', address: 'Zona Rural, Santo Amaro, Bahia', price: 2500000, bedrooms: 4, bathrooms: 3, area: 500000, image: 'https://picsum.photos/seed/prop33/600/400', status: PropertyStatus.New, lat: -12.560, lng: -38.750 },
  { id: 34, title: 'Casa de veraneio em Itapema, Santo Amaro', address: 'Praia de Itapema, Santo Amaro, Bahia', price: 450000, bedrooms: 3, bathrooms: 2, area: 200, image: 'https://picsum.photos/seed/prop34/600/400', lat: -12.723, lng: -38.657 },
  { id: 35, title: 'Apartamento de 2 quartos em Santo Amaro', address: 'Rua do Imperador, Santo Amaro, Bahia', price: 190000, bedrooms: 2, bathrooms: 1, area: 70, image: 'https://picsum.photos/seed/prop35/600/400', lat: -12.549, lng: -38.718 },
  { id: 36, title: 'Ponto Comercial no centro de Santo Amaro', address: 'Rua do Comércio, Santo Amaro, Bahia', price: 320000, bedrooms: 0, bathrooms: 1, area: 120, image: 'https://picsum.photos/seed/prop36/600/400', status: PropertyStatus.Updated, lat: -12.547, lng: -38.713 },
  // São Félix (5)
  { id: 37, title: 'Casa com vista para a ponte em São Félix', address: 'Av. Beira Rio, São Félix, Bahia', price: 380000, bedrooms: 3, bathrooms: 2, area: 150, image: 'https://picsum.photos/seed/prop37/600/400', lat: -12.610, lng: -38.972 },
  { id: 38, title: 'Fábrica de charutos desativada em São Félix', address: 'Centro, São Félix, Bahia', price: 1100000, bedrooms: 10, bathrooms: 5, area: 2000, image: 'https://picsum.photos/seed/prop38/600/400', status: PropertyStatus.New, lat: -12.613, lng: -38.974 },
  { id: 39, title: 'Terreno em São Félix', address: 'Zona de Expansão, São Félix, Bahia', price: 120000, bedrooms: 0, bathrooms: 0, area: 1000, image: 'https://picsum.photos/seed/prop39/600/400', lat: -12.618, lng: -38.980 },
  { id: 40, title: 'Casa simples em São Félix', address: 'Rua da Ladeira, São Félix, Bahia', price: 95000, bedrooms: 2, bathrooms: 1, area: 80, image: 'https://picsum.photos/seed/prop40/600/400', lat: -12.611, lng: -38.978 },
  { id: 41, title: 'Chácara perto de São Félix', address: 'Estrada Velha, São Félix, Bahia', price: 600000, bedrooms: 3, bathrooms: 3, area: 8000, image: 'https://picsum.photos/seed/prop41/600/400', status: PropertyStatus.Updated, lat: -12.625, lng: -38.985 },
  // Maragogipe (5)
  { id: 42, title: 'Casa de pescador em Maragogipe', address: 'Porto do Caijá, Maragogipe, Bahia', price: 150000, bedrooms: 2, bathrooms: 1, area: 90, image: 'https://picsum.photos/seed/prop42/600/400', lat: -12.775, lng: -38.921 },
  { id: 43, title: 'Estaleiro em Maragogipe', address: 'Av. Marítima, Maragogipe, Bahia', price: 1800000, bedrooms: 2, bathrooms: 2, area: 3000, image: 'https://picsum.photos/seed/prop43/600/400', lat: -12.778, lng: -38.918 },
  { id: 44, title: 'Casa com 3 quartos em Maragogipe', address: 'Centro, Maragogipe, Bahia', price: 280000, bedrooms: 3, bathrooms: 2, area: 130, image: 'https://picsum.photos/seed/prop44/600/400', status: PropertyStatus.New, lat: -12.772, lng: -38.925 },
  { id: 45, title: 'Sítio produtivo em Maragogipe', address: 'Zona Rural, Maragogipe, Bahia', price: 750000, bedrooms: 3, bathrooms: 2, area: 40000, image: 'https://picsum.photos/seed/prop45/600/400', lat: -12.790, lng: -38.940 },
  { id: 46, title: 'Casa de veraneio em São Roque do Paraguaçu', address: 'São Roque do Paraguaçu, Maragogipe, Bahia', price: 350000, bedrooms: 2, bathrooms: 2, area: 180, image: 'https://picsum.photos/seed/prop46/600/400', status: PropertyStatus.Updated, lat: -12.871, lng: -38.868 },
  // Nazaré (5)
  { id: 47, title: 'Casa no centro de Nazaré das Farinhas', address: 'Praça da Matriz, Nazaré, Bahia', price: 420000, bedrooms: 3, bathrooms: 2, area: 200, image: 'https://picsum.photos/seed/prop47/600/400', lat: -13.034, lng: -39.014 },
  { id: 48, title: 'Apartamento em Nazaré', address: 'Rua do Fogo, Nazaré, Bahia', price: 180000, bedrooms: 2, bathrooms: 1, area: 65, image: 'https://picsum.photos/seed/prop48/600/400', lat: -13.030, lng: -39.018 },
  { id: 49, title: 'Sítio com pomar em Nazaré', address: 'Estrada de Jaguaripe, Nazaré, Bahia', price: 680000, bedrooms: 2, bathrooms: 2, area: 15000, image: 'https://picsum.photos/seed/prop49/600/400', status: PropertyStatus.New, lat: -13.050, lng: -39.030 },
  { id: 50, title: 'Ponto comercial na feira de Nazaré', address: 'Largo da Feira, Nazaré, Bahia', price: 250000, bedrooms: 0, bathrooms: 1, area: 80, image: 'https://picsum.photos/seed/prop50/600/400', lat: -13.036, lng: -39.011 },
  { id: 51, title: 'Casa para reformar em Nazaré', address: 'Rua da Lapa, Nazaré, Bahia', price: 80000, bedrooms: 2, bathrooms: 1, area: 100, image: 'https://picsum.photos/seed/prop51/600/400', lat: -13.032, lng: -39.016 },
  // Santo Antônio de Jesus (5)
  { id: 52, title: 'Apartamento no centro de Santo Antônio de Jesus', address: 'Praça Padre Mateus, SAJ, Bahia', price: 350000, bedrooms: 3, bathrooms: 2, area: 100, image: 'https://picsum.photos/seed/prop52/600/400', status: PropertyStatus.Updated, lat: -12.968, lng: -39.261 },
  { id: 53, title: 'Galpão comercial na BR-101', address: 'Rod. BR-101, Santo Antônio de Jesus, Bahia', price: 1500000, bedrooms: 0, bathrooms: 2, area: 2000, image: 'https://picsum.photos/seed/prop53/600/400', lat: -12.975, lng: -39.270 },
  { id: 54, title: 'Casa em condomínio em SAJ', address: 'Rua do Cajueiro, Santo Antônio de Jesus, Bahia', price: 550000, bedrooms: 3, bathrooms: 3, area: 180, image: 'https://picsum.photos/seed/prop54/600/400', lat: -12.960, lng: -39.255 },
  { id: 55, title: 'Terreno para loteamento em SAJ', address: 'Zona de Expansão Urbana, SAJ, Bahia', price: 2200000, bedrooms: 0, bathrooms: 0, area: 30000, image: 'https://picsum.photos/seed/prop55/600/400', status: PropertyStatus.New, lat: -12.980, lng: -39.250 },
  { id: 56, title: 'Apartamento de 2 quartos em SAJ', address: 'Rua Sete de Setembro, Santo Antônio de Jesus, Bahia', price: 210000, bedrooms: 2, bathrooms: 1, area: 60, image: 'https://picsum.photos/seed/prop56/600/400', lat: -12.965, lng: -39.263 },
];

const PropertyListings: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-brand-navy text-center mb-4">{t('listings.title')}</h2>
        <p className="text-lg text-brand-gray text-center max-w-2xl mx-auto mb-12">
          {t('listings.description')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_PROPERTIES.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyListings;
