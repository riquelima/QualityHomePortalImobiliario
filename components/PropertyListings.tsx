
import React from 'react';
import { Property, PropertyStatus } from '../types';
import PropertyCard from './PropertyCard';

const MOCK_PROPERTIES: Property[] = [
  {
    id: 1,
    title: 'Apartamento Luxo com Vista Mar',
    address: 'Av. Atlântica, Copacabana, Rio de Janeiro',
    price: 3500000,
    bedrooms: 3,
    bathrooms: 4,
    area: 220,
    image: 'https://picsum.photos/seed/prop1/600/400',
    status: PropertyStatus.New,
  },
  {
    id: 2,
    title: 'Casa Moderna em Condomínio',
    address: 'Alphaville, Barueri, São Paulo',
    price: 4200000,
    bedrooms: 4,
    bathrooms: 5,
    area: 450,
    image: 'https://picsum.photos/seed/prop2/600/400',
    status: PropertyStatus.Updated,
  },
  {
    id: 3,
    title: 'Cobertura Duplex no Itaim Bibi',
    address: 'Rua Clodomiro Amazonas, Itaim Bibi, São Paulo',
    price: 5800000,
    bedrooms: 3,
    bathrooms: 5,
    area: 310,
    image: 'https://picsum.photos/seed/prop3/600/400',
  },
    {
    id: 4,
    title: 'Casa de Campo Charmosa',
    address: 'Serra da Cantareira, Mairiporã, São Paulo',
    price: 2100000,
    bedrooms: 5,
    bathrooms: 4,
    area: 600,
    image: 'https://picsum.photos/seed/prop4/600/400',
    status: PropertyStatus.New,
  },
  {
    id: 5,
    title: 'Studio Inteligente na Vila Madalena',
    address: 'Rua Harmonia, Vila Madalena, São Paulo',
    price: 980000,
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    image: 'https://picsum.photos/seed/prop5/600/400',
  },
  {
    id: 6,
    title: 'Mansão à Beira-Mar em Jurerê',
    address: 'Jurerê Internacional, Florianópolis, Santa Catarina',
    price: 12500000,
    bedrooms: 6,
    bathrooms: 8,
    area: 1200,
    image: 'https://picsum.photos/seed/prop6/600/400',
    status: PropertyStatus.Updated,
  },
];

const PropertyListings: React.FC = () => {
  return (
    <section className="bg-brand-neutral-light py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-brand-neutral-black text-center mb-4">Imóveis em Destaque</h2>
        <p className="text-lg text-brand-neutral-dark text-center max-w-2xl mx-auto mb-12">
          Explore nossa seleção exclusiva de imóveis que combinam luxo, conforto e localização privilegiada.
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
