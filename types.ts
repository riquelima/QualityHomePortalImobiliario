
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
  image: string;
  status?: PropertyStatus;
  lat: number;
  lng: number;
}

export interface User {
  name: string;
  email: string;
  picture: string;
}
