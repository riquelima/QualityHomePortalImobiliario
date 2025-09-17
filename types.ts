
export enum PropertyStatus {
  New = 'Novo',
  Updated = 'Atualizado',
}

export interface Property {
  id: number;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  description: string;
  videos?: string[];
  status?: PropertyStatus;
  lat: number;
  lng: number;
  owner?: {
    name: string;
    phone: string; // e.g., '5571999998888' for WhatsApp link
  };
}

export interface User {
  name: string;
  email: string;
  picture: string;
}