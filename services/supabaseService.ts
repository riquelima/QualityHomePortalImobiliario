import { supabase } from '../supabaseClient';
import { PropertyFormData } from '../components/admin/PropertyForm';

// Interface para o imóvel no banco de dados
export interface ImovelDB {
  id?: number;
  anunciante_id: string;
  titulo: string;
  descricao?: string;
  endereco_completo?: string;
  cidade?: string;
  rua?: string;
  numero?: string;
  latitude?: number;
  longitude?: number;
  preco: number;
  tipo_operacao: 'venda' | 'aluguel' | 'temporada';
  tipo_imovel?: string;
  quartos?: number;
  banheiros?: number;
  area_bruta?: number;
  area_util?: number;
  possui_elevador?: boolean;
  taxa_condominio?: number;
  status?: 'ativo' | 'inativo' | 'vendido' | 'alugado' | 'pendente';
  caracteristicas_imovel?: string[];
  caracteristicas_condominio?: string[];
  situacao_ocupacao?: string;
  valor_iptu?: number;
  aceita_financiamento?: boolean;
  condicoes_aluguel?: string[];
  permite_animais?: boolean;
  minimo_diarias?: number;
  maximo_hospedes?: number;
  taxa_limpeza?: number;
  datas_disponiveis?: string[];
  topografia?: string;
  zoneamento?: string;
  murado?: boolean;
  em_condominio?: boolean;
  images?: any;
  videos?: any;
  share_url?: string;
}

// Serviço para operações com imóveis
export class PropertyService {
  // Criar um novo imóvel
  static async createProperty(propertyData: PropertyFormData): Promise<{ data: ImovelDB | null; error: any }> {
    try {
      // Obter o usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      // Preparar dados para inserção
      const imovelData: Omit<ImovelDB, 'id'> = {
        anunciante_id: user.id,
        titulo: propertyData.titulo,
        descricao: propertyData.descricao,
        endereco_completo: propertyData.endereco_completo,
        cidade: propertyData.cidade,
        rua: propertyData.rua,
        numero: propertyData.numero,
        latitude: undefined, // Opcional - será definido posteriormente se necessário
        longitude: undefined, // Opcional - será definido posteriormente se necessário
        preco: propertyData.preco,
        tipo_operacao: propertyData.tipo_operacao,
        tipo_imovel: propertyData.tipo_imovel,
        quartos: propertyData.quartos,
        banheiros: propertyData.banheiros,
        area_bruta: propertyData.area_bruta,
        area_util: propertyData.area_util,
        possui_elevador: propertyData.possui_elevador,
        taxa_condominio: propertyData.taxa_condominio,
        status: 'ativo',
        caracteristicas_imovel: propertyData.caracteristicas_imovel,
        caracteristicas_condominio: propertyData.caracteristicas_condominio,
        situacao_ocupacao: propertyData.situacao_ocupacao,
        valor_iptu: propertyData.valor_iptu,
        aceita_financiamento: propertyData.aceita_financiamento,
        condicoes_aluguel: propertyData.condicoes_aluguel,
        permite_animais: propertyData.permite_animais,
        minimo_diarias: propertyData.minimo_diarias,
        maximo_hospedes: propertyData.maximo_hospedes,
        taxa_limpeza: propertyData.taxa_limpeza,
        datas_disponiveis: propertyData.datas_disponiveis,
        topografia: propertyData.topografia,
        zoneamento: propertyData.zoneamento,
        murado: propertyData.murado,
        em_condominio: propertyData.em_condominio,
        images: propertyData.images,
        videos: propertyData.videos
      };

      const { data, error } = await supabase
        .from('imoveis')
        .insert([imovelData])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Buscar imóveis ativos
  static async getActiveProperties(): Promise<{ data: ImovelDB[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('imoveis')
        .select('*')
        .eq('status', 'ativo')
        .order('data_publicacao', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Buscar imóveis do usuário atual
  static async getUserProperties(): Promise<{ data: ImovelDB[] | null; error: any }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('imoveis')
        .select('*')
        .eq('anunciante_id', user.id)
        .order('data_publicacao', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Buscar um imóvel específico
  static async getPropertyById(id: number): Promise<{ data: ImovelDB | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('imoveis')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Atualizar um imóvel
  static async updateProperty(id: number, propertyData: Partial<PropertyFormData>): Promise<{ data: ImovelDB | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('imoveis')
        .update(propertyData)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Deletar um imóvel
  static async deleteProperty(id: number): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('imoveis')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Buscar imóveis com filtros
  static async searchProperties(filters: {
    tipo_operacao?: string;
    tipo_imovel?: string;
    cidade?: string;
    preco_min?: number;
    preco_max?: number;
    quartos?: number;
    banheiros?: number;
  }): Promise<{ data: ImovelDB[] | null; error: any }> {
    try {
      let query = supabase
        .from('imoveis')
        .select('*')
        .eq('status', 'ativo');

      if (filters.tipo_operacao) {
        query = query.eq('tipo_operacao', filters.tipo_operacao);
      }

      if (filters.tipo_imovel) {
        query = query.eq('tipo_imovel', filters.tipo_imovel);
      }

      if (filters.cidade) {
        query = query.ilike('cidade', `%${filters.cidade}%`);
      }

      if (filters.preco_min) {
        query = query.gte('preco', filters.preco_min);
      }

      if (filters.preco_max) {
        query = query.lte('preco', filters.preco_max);
      }

      if (filters.quartos) {
        query = query.gte('quartos', filters.quartos);
      }

      if (filters.banheiros) {
        query = query.gte('banheiros', filters.banheiros);
      }

      const { data, error } = await query.order('data_publicacao', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Serviço para autenticação
export class AuthService {
  // Login com email e senha
  static async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  // Registro com email e senha
  static async signUp(email: string, password: string) {
    return await supabase.auth.signUp({ email, password });
  }

  // Logout
  static async signOut() {
    return await supabase.auth.signOut();
  }

  // Obter usuário atual
  static async getCurrentUser() {
    return await supabase.auth.getUser();
  }

  // Verificar se o usuário está logado
  static async isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  }
}

export default { PropertyService, AuthService, supabase };