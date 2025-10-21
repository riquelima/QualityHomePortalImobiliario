import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ckzhvurabmhvteekyjxg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNremh2dXJhYm1odnRlZWt5anhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDI3ODAsImV4cCI6MjA3MzY3ODc4MH0.Flyk7vlukV-hr5wThG6IogQTBQuUcI164kbU0cFwvws';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixIssues() {
  console.log('🔧 Iniciando correções...');

  try {
    // Primeiro, vamos tentar adicionar dados de teste usando um ID fixo
    // O ID do usuário será criado manualmente no Supabase Dashboard
    console.log('📊 Adicionando dados de teste...');
    
    // Usar um UUID fixo para o anunciante_id
    const fixedUserId = '00000000-0000-0000-0000-000000000001';
    
    const testProperties = [
      {
        titulo: 'Apartamento Moderno em Salvador',
        descricao: 'Lindo apartamento com vista para o mar, totalmente mobiliado.',
        endereco_completo: 'Rua das Flores, 123, Barra, Salvador, BA',
        cidade: 'Salvador',
        rua: 'Rua das Flores',
        numero: '123',
        latitude: -12.9777,
        longitude: -38.5016,
        preco: 450000,
        tipo_operacao: 'venda',
        tipo_imovel: 'apartamento',
        quartos: 3,
        banheiros: 2,
        area_bruta: 85,
        status: 'ativo',
        anunciante_id: fixedUserId
      },
      {
        titulo: 'Casa Familiar no Rio Vermelho',
        descricao: 'Casa espaçosa perfeita para famílias, com quintal e garagem.',
        endereco_completo: 'Av. Oceânica, 456, Rio Vermelho, Salvador, BA',
        cidade: 'Salvador',
        rua: 'Av. Oceânica',
        numero: '456',
        latitude: -13.0093,
        longitude: -38.4658,
        preco: 2500,
        tipo_operacao: 'aluguel',
        tipo_imovel: 'casa',
        quartos: 4,
        banheiros: 3,
        area_bruta: 150,
        status: 'ativo',
        anunciante_id: fixedUserId
      },
      {
        titulo: 'Cobertura de Luxo na Pituba',
        descricao: 'Cobertura com piscina privativa e vista panorâmica da cidade.',
        endereco_completo: 'Av. Paulo VI, 789, Pituba, Salvador, BA',
        cidade: 'Salvador',
        rua: 'Av. Paulo VI',
        numero: '789',
        latitude: -12.9833,
        longitude: -38.4500,
        preco: 850000,
        tipo_operacao: 'venda',
        tipo_imovel: 'apartamento',
        quartos: 4,
        banheiros: 3,
        area_bruta: 200,
        status: 'ativo',
        anunciante_id: fixedUserId
      },
      {
        titulo: 'Casa de Praia em Stella Maris',
        descricao: 'Casa de temporada a poucos metros da praia, ideal para férias.',
        endereco_completo: 'Rua da Praia, 321, Stella Maris, Salvador, BA',
        cidade: 'Salvador',
        rua: 'Rua da Praia',
        numero: '321',
        latitude: -12.8500,
        longitude: -38.3000,
        preco: 300,
        tipo_operacao: 'temporada',
        tipo_imovel: 'casa',
        quartos: 3,
        banheiros: 2,
        area_bruta: 120,
        status: 'ativo',
        anunciante_id: fixedUserId
      }
    ];

    // Primeiro, vamos verificar se já existem propriedades
    const { data: existingProperties, error: checkError } = await supabase
      .from('imoveis')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('❌ Erro ao verificar propriedades existentes:', checkError.message);
      return;
    }

    if (existingProperties && existingProperties.length > 0) {
      console.log('✅ Já existem propriedades no banco de dados');
      return;
    }

    // Tentar inserir as propriedades sem anunciante_id primeiro
    const propertiesWithoutAnunciante = testProperties.map(prop => {
      const { anunciante_id, ...rest } = prop;
      return rest;
    });

    const { data: propertiesData, error: propertiesError } = await supabase
      .from('imoveis')
      .insert(propertiesWithoutAnunciante)
      .select();

    if (propertiesError) {
      console.error('❌ Erro ao inserir propriedades:', propertiesError.message);
      console.log('🔄 Tentando abordagem alternativa...');
      
      // Se falhar, vamos tentar criar um registro na tabela de usuários primeiro
      console.log('👤 Criando registro de usuário...');
      
      // Tentar inserir um usuário fictício na tabela de usuários (se existir)
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert([{
          id: fixedUserId,
          email: 'quallity@admin.com',
          nome: 'Admin Quality Home'
        }])
        .select();

      if (userError) {
        console.log('ℹ️ Tabela de usuários não encontrada ou erro:', userError.message);
      }

      // Tentar novamente com anunciante_id
      const { data: retryData, error: retryError } = await supabase
        .from('imoveis')
        .insert(testProperties)
        .select();

      if (retryError) {
        console.error('❌ Erro na segunda tentativa:', retryError.message);
      } else {
        console.log('✅ Propriedades de teste adicionadas na segunda tentativa:', retryData.length);
      }
    } else {
      console.log('✅ Propriedades de teste adicionadas:', propertiesData.length);
    }

    console.log('🎉 Processo concluído!');
    console.log('📋 Para fazer login, você precisará:');
    console.log('   1. Criar o usuário quallity@admin.com no Supabase Dashboard');
    console.log('   2. Usar a senha: 123456 (mínimo 6 caracteres)');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

fixIssues();