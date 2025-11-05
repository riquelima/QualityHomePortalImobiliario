import { supabase } from '../supabaseClient';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  success: boolean;
}

export interface AdminAuthResponse {
  success: boolean;
  user?: AdminUser;
  error?: string;
}

class AdminAuthService {
  private currentAdmin: AdminUser | null = null;

  // Login do administrador
  async login(email: string, password: string): Promise<AdminAuthResponse> {
    try {
      // Chamar a função do Supabase para verificar login
      const { data, error } = await supabase.rpc('verify_admin_login', {
        p_email: email,
        p_password: password
      });

      if (error) {
        console.error('Erro na autenticação:', error);
        return {
          success: false,
          error: 'Erro interno do servidor'
        };
      }

      if (data && data.length > 0 && data[0].success) {
        const adminData = data[0];
        this.currentAdmin = {
          id: adminData.id,
          email: adminData.email,
          name: adminData.name,
          role: adminData.role,
          success: true
        };

        // Salvar no localStorage para persistência
        localStorage.setItem('admin_user', JSON.stringify(this.currentAdmin));
        localStorage.setItem('admin_token', `admin_${adminData.id}_${Date.now()}`);

        // Vincular sessão do Supabase Auth para liberar políticas RLS nas tabelas
        try {
          const { data: authSignInData, error: authSignInError } = await supabase.auth.signInWithPassword({ email, password });
          if (authSignInError) {
            // Se não existir usuário no Auth, tenta criar e entrar
            const { data: authSignUpData, error: authSignUpError } = await supabase.auth.signUp({ email, password });
            if (!authSignUpError) {
              // Após sign up, tentar sign in novamente
              await supabase.auth.signInWithPassword({ email, password });
            } else {
              console.warn('Supabase Auth signUp falhou:', authSignUpError.message);
            }
          }
        } catch (authError) {
          console.warn('Falha ao vincular sessão ao Supabase Auth:', authError);
        }

        return {
          success: true,
          user: this.currentAdmin
        };
      } else {
        return {
          success: false,
          error: 'Email ou senha incorretos'
        };
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return {
        success: false,
        error: 'Erro de conexão. Tente novamente.'
      };
    }
  }

  // Logout do administrador
  logout(): void {
    this.currentAdmin = null;
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
  }

  // Verificar se está logado
  isAuthenticated(): boolean {
    if (this.currentAdmin) {
      return true;
    }

    // Verificar no localStorage
    const storedAdmin = localStorage.getItem('admin_user');
    const storedToken = localStorage.getItem('admin_token');

    if (storedAdmin && storedToken) {
      try {
        this.currentAdmin = JSON.parse(storedAdmin);
        return true;
      } catch (error) {
        console.error('Erro ao recuperar dados do admin:', error);
        this.logout();
        return false;
      }
    }

    return false;
  }

  // Obter dados do administrador atual
  getCurrentAdmin(): AdminUser | null {
    if (this.currentAdmin) {
      return this.currentAdmin;
    }

    // Tentar recuperar do localStorage
    const storedAdmin = localStorage.getItem('admin_user');
    if (storedAdmin) {
      try {
        this.currentAdmin = JSON.parse(storedAdmin);
        return this.currentAdmin;
      } catch (error) {
        console.error('Erro ao recuperar dados do admin:', error);
        this.logout();
        return null;
      }
    }

    return null;
  }

  // Verificar se tem permissão específica
  hasPermission(requiredRole: string = 'admin'): boolean {
    const admin = this.getCurrentAdmin();
    if (!admin) return false;

    const roleHierarchy = {
      'admin': 1,
      'super_admin': 2
    };

    const currentLevel = roleHierarchy[admin.role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return currentLevel >= requiredLevel;
  }

  // Atualizar último acesso
  async updateLastAccess(): Promise<void> {
    const admin = this.getCurrentAdmin();
    if (!admin) return;

    try {
      await supabase
        .from('admin_users')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', admin.id);
    } catch (error) {
      console.error('Erro ao atualizar último acesso:', error);
    }
  }
}

// Exportar instância singleton
export const adminAuthService = new AdminAuthService();

// Hook personalizado para React
export const useAdminAuth = () => {
  const isAuthenticated = adminAuthService.isAuthenticated();
  const currentAdmin = adminAuthService.getCurrentAdmin();

  return {
    isAuthenticated,
    currentAdmin,
    login: adminAuthService.login.bind(adminAuthService),
    logout: adminAuthService.logout.bind(adminAuthService),
    hasPermission: adminAuthService.hasPermission.bind(adminAuthService)
  };
};