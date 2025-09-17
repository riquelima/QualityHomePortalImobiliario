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
    // FIX: Add email to owner to support chat functionality.
    email: string;
  };
}

export interface User {
  name: string;
  email: string;
  picture: string;
}

export interface Message {
  id: string;
  senderId: string; // email of the sender
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  sessionId: string; // e.g., `${propertyId}-${user.email}-${owner.email}`
  propertyId: number;
  participants: { [key: string]: string }; // email -> name mapping
  messages: Message[];
}
