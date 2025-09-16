
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
