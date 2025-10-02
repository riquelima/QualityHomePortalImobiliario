


import type { User } from '@supabase/supabase-js';

export { User };

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
  images: string[] | null;
  videos?: string[] | null;
  status?: string; // Alterado para string para suportar 'ativo'/'inativo'
  owner?: Profile & { email?: string, phone?: string }; // Merged Profile with legacy owner fields for compatibility
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

  // Novos campos para terrenos
  topografia?: string;
  zoneamento?: string;
  murado?: boolean;
  em_condominio?: boolean;
}

export interface Message {
  id: number | string;
  senderId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ChatSession {
  id: string;
  imovel_id: number;
  participants: {
    [key: string]: {
        id: string,
        nome_completo: string,
        url_foto_perfil?: string;
    }
  };
  messages: Message[];
  unreadCount: number;
}
