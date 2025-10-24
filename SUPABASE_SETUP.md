# Configuração do Supabase para Autenticação de Administrador

## Instruções para configurar a autenticação de administrador

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione o projeto: `https://ckzhvurabmhvteekyjxg.supabase.co`

### 2. Execute o Script SQL
1. No dashboard do Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo do arquivo `seeds/admin_setup.sql`
4. Execute o script clicando em **Run**

### 3. Verificar a Criação da Tabela
1. Vá para **Table Editor**
2. Verifique se a tabela `admin_users` foi criada
3. Confirme se há um registro com email `quallity@admin.com`

### 4. Credenciais de Login
- **Email:** `quallity@admin.com`
- **Senha:** `admin123`

### 5. Funcionalidades Implementadas
- ✅ Autenticação real com Supabase
- ✅ Proteção de rotas administrativas
- ✅ Sessão persistente no localStorage
- ✅ Informações do usuário no sidebar
- ✅ Logout funcional
- ✅ Verificação de permissões por role

### 6. Estrutura da Tabela admin_users
```sql
- id: UUID (Primary Key)
- email: VARCHAR(255) UNIQUE
- password_hash: VARCHAR(255)
- name: VARCHAR(255)
- role: VARCHAR(50) - 'admin' ou 'super_admin'
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- last_login: TIMESTAMP
```

### 7. Segurança
- Row Level Security (RLS) habilitado
- Políticas de acesso configuradas
- Função de verificação de login segura
- Hash de senhas (em produção, use bcrypt real)

### 8. Como Testar
1. Execute o script SQL no Supabase
2. Acesse a aplicação
3. Vá para o rodapé e clique em "Painel Administrativo"
4. Use as credenciais: `quallity@admin.com` / `admin123`
5. Verifique se o dashboard carrega corretamente
6. Teste o logout

### 9. Próximos Passos (Opcional)
- Adicionar mais administradores via SQL
- Implementar recuperação de senha
- Adicionar auditoria de ações
- Implementar 2FA (Two-Factor Authentication)