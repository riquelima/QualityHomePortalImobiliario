

import type { User } from '@supabase/supabase-js';

export { User };

// FIX: Added the missing PropertyStatus enum which is used in PropertyCard.tsx.
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

export interface Media {
  id: number;
  imovel_id: number;
  url: string;
  tipo: 'imagem' | 'video';
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
  status?: string; // Alterado para string para suportar 'ativo'/'inativo'
  owner?: Profile & { email?: string, phone?: string }; // Merged Profile with legacy owner fields for compatibility
  midias_imovel?: Media[];
  caracteristicas_imovel?: string[];
  caracteristicas_condominio?: string[];
  situacao_ocupacao?: string;
  taxa_condominio?: number;
  possui_elevador?: boolean;

  // Novos campos para formulários específicos
  valor_iptu?: number;
  aceita_financiamento?: boolean;
  condicoes_aluguel?: string[];
  permite_animais?: boolean;
  minimo_diarias?: number;
  maximo_hospedes?: number;
  taxa_limpeza?: number;
  datas_disponiveis?: string[]; // Array de datas no formato 'YYYY-MM-DD'
  // FIX: Added missing property 'area_util' used in PublishJourneyPage.tsx.
  area_util?: number;
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