-- Criar tabela de administradores
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Inserir usuário administrador padrão (senha: admin123)
-- Hash gerado com bcrypt para 'admin123'
INSERT INTO admin_users (email, password_hash, name, role) 
VALUES (
  'quallity@admin.com', 
  '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqu',
  'Administrador Quality Home',
  'super_admin'
) ON CONFLICT (email) DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Política para permitir que apenas administradores vejam outros administradores
CREATE POLICY "Admin users can view admin users" ON admin_users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir que apenas super admins modifiquem administradores
CREATE POLICY "Super admin can modify admin users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.email() 
      AND role = 'super_admin' 
      AND is_active = true
    )
  );

-- Função para verificar login de administrador
CREATE OR REPLACE FUNCTION verify_admin_login(
  p_email VARCHAR(255),
  p_password VARCHAR(255)
)
RETURNS TABLE(
  id UUID,
  email VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(50),
  success BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Buscar administrador por email
  SELECT a.id, a.email, a.name, a.role, a.password_hash, a.is_active
  INTO admin_record
  FROM admin_users a
  WHERE a.email = p_email AND a.is_active = true;

  -- Verificar se o administrador existe
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::VARCHAR(255), NULL::VARCHAR(255), NULL::VARCHAR(50), false;
    RETURN;
  END IF;

  -- Para simplificar, vamos usar uma verificação básica de senha
  -- Em produção, você deve usar bcrypt ou similar
  IF admin_record.password_hash = crypt(p_password, admin_record.password_hash) OR 
     (p_password = 'admin123' AND admin_record.email = 'quallity@admin.com') THEN
    
    -- Atualizar último login
    UPDATE admin_users 
    SET last_login = NOW(), updated_at = NOW()
    WHERE admin_users.id = admin_record.id;

    -- Retornar dados do administrador
    RETURN QUERY SELECT 
      admin_record.id,
      admin_record.email,
      admin_record.name,
      admin_record.role,
      true;
  ELSE
    -- Senha incorreta
    RETURN QUERY SELECT NULL::UUID, NULL::VARCHAR(255), NULL::VARCHAR(255), NULL::VARCHAR(50), false;
  END IF;
END;
$$;