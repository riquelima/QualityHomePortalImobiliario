

import type { User } from '@supabase/supabase-js';

export { User };

export enum PropertyStatus {
  New = 'Novo',
  Updated = 'Atualizado',
}

export interface Profile {
  id: string; // UUID from auth.users
  nome_completo: string;
  url_foto_perfil: string;
  telefone?: string;
}

export interface Property {
  id: number;
  anunciante_id?: string;
  titulo: string;
  descricao: string;
  endereco_completo: string;
  cidade?: string;
  rua?: string;
  numero?: string;
  latitude: number;
  longitude: number;
  preco: number;
  tipo_operacao?: string;
  tipo_imovel?: string;
  quartos: number;
  banheiros: number;
  area_bruta: number;
  // Mapeando para o front-end
  bedrooms: number;
  bathrooms: number;
  area: number;
  address: string;
  title: string;
  lat: number;
  lng: number;
  // FIX: Added price and description for frontend consistency.
  price: number;
  description: string;


  // Campos que já existem no front
  images: string[];
  videos?: string[];
  status?: PropertyStatus;
  owner?: Profile & { email?: string, phone?: string }; // Merged Profile with legacy owner fields for compatibility
  midias_imovel?: { url: string, tipo: 'imagem' | 'video' }[];
  caracteristicas_imovel?: string[];
  caracteristicas_condominio?: string[];
  situacao_ocupacao?: string;
}

export interface Message {
  id: number | string;
  sessao_id?: string;
  remetente_id: string; // UUID of the sender profile
  conteudo: string;
  data_envio: string | Date;
  // Legacy fields for UI compatibility
  senderId: string;
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string; // UUID from sessoes_chat
  imovel_id: number;
  participantes: {
    [key: string]: { // key is user UUID
        id: string,
        nome_completo: string,
    }
  };
  mensagens: Message[];
  // Legacy fields for UI compatibility
  sessionId: string;
  propertyId: number;
  messages: Message[];
}