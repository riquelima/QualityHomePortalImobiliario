# PRD - Quality Home Portal Imobiliário

## 1. Visão Geral do Produto

### 1.1 Nome do Produto
**Quality Home Portal Imobiliário**

### 1.2 Descrição
Portal imobiliário moderno e premium inspirado no design do Idealista, desenvolvido para corretores e clientes. O sistema oferece uma plataforma completa para publicação, busca, visualização e gestão de propriedades imobiliárias.

### 1.3 Objetivos do Produto
- Facilitar a publicação e gestão de anúncios imobiliários
- Proporcionar experiência de busca intuitiva para compradores/locatários
- Oferecer ferramentas administrativas robustas para corretores
- Integrar tecnologias modernas (IA, mapas, geolocalização)
- Garantir interface responsiva e acessível

### 1.4 Público-Alvo
- **Primário**: Corretores e imobiliárias
- **Secundário**: Proprietários individuais
- **Terciário**: Compradores e locatários de imóveis

## 2. Funcionalidades Principais

### 2.1 Portal Público

#### 2.1.1 Página Inicial
- **Splash Screen**: Tela de carregamento com logo da empresa
- **Listagem de Propriedades**: Exibição de imóveis em destaque (6 por página)
- **Busca Rápida**: Campo de pesquisa por localização
- **Navegação por Categorias**: Compra, Aluguel, Temporada
- **Geolocalização**: Solicitação de permissão para localização do usuário

#### 2.1.2 Sistema de Busca
- **Busca por Texto**: Pesquisa por endereço, cidade, bairro
- **Filtros Avançados**: 
  - Tipo de operação (venda, aluguel, temporada)
  - Tipo de imóvel (casa, apartamento, terreno, comercial)
  - Faixa de preço
  - Número de quartos e banheiros
  - Área (m²)
- **Busca por Mapa**: Visualização geográfica com marcadores
- **Busca por Proximidade**: Raio de distância baseado na localização

#### 2.1.3 Visualização de Propriedades
- **Cards de Propriedade**: 
  - Carrossel de imagens
  - Informações básicas (preço, área, quartos, banheiros)
  - Localização
  - Botões de ação (visualizar, compartilhar)
- **Página de Detalhes**:
  - Galeria completa de imagens/vídeos
  - Descrição detalhada
  - Características do imóvel
  - Mapa de localização
  - Informações de contato
  - Botão de compartilhamento

#### 2.1.4 Páginas Informativas
- **Guia para Vender**: Orientações para vendedores
- **Documentos para Venda**: Lista de documentos necessários
- **Explorar**: Navegação por tipo de operação

### 2.2 Sistema de Publicação

#### 2.2.1 Jornada de Publicação (Publish Journey)
- **Formulário Completo**: 
  - Tipo de operação (venda, aluguel, temporada)
  - Tipo de imóvel (casa, apartamento, terreno, comercial)
  - Endereço com autocomplete (Google Maps)
  - Coordenadas geográficas automáticas
  - Áreas (bruta e útil)
  - Número de quartos e banheiros
  - Características do imóvel
  - Características do condomínio
  - Preços (venda, aluguel, taxas)
  - Condições específicas

#### 2.2.2 Upload de Mídia
- **Imagens**: Upload múltiplo com preview
- **Vídeos**: Suporte a arquivos de vídeo
- **Validação**: Verificação de formato e tamanho
- **Armazenamento**: Integração com Supabase Storage

#### 2.2.3 Geração Automática de Conteúdo
- **IA para Título**: Geração automática usando Google Gemini
- **IA para Descrição**: Criação de descrições atrativas
- **Validação de Dados**: Verificação de campos obrigatórios

### 2.3 Painel Administrativo

#### 2.3.1 Autenticação
- **Login Seguro**: Sistema de autenticação com Supabase
- **Credenciais Padrão**: 
  - Email: quallity@admin.com
  - Senha: admin123
- **Sessão Persistente**: Manutenção de login no localStorage
- **Controle de Acesso**: Verificação de permissões por role

#### 2.3.2 Dashboard
- **Métricas Gerais**:
  - Total de imóveis
  - Imóveis ativos
  - Imóveis pendentes
  - Imóveis vendidos/alugados
- **Gráficos**: Distribuição por tipo de imóvel
- **Navegação Rápida**: Acesso às principais funcionalidades

#### 2.3.3 Gestão de Propriedades
- **Listagem Completa**: Todos os imóveis cadastrados
- **Filtros Avançados**:
  - Status (ativo, inativo, vendido, alugado, pendente)
  - Tipo de imóvel
  - Tipo de operação
  - Ordenação por data, preço, título
- **Ações por Propriedade**:
  - Visualizar detalhes
  - Editar
  - Excluir
  - Compartilhar
  - Alterar status

#### 2.3.4 Publicação Simplificada
- **Formulário Admin**: Versão simplificada para publicação rápida
- **Edição de Propriedades**: Modificação de imóveis existentes
- **Validação**: Verificação de dados antes da publicação

## 3. Arquitetura Técnica

### 3.1 Frontend
- **Framework**: React 18.2.0 com TypeScript
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS (classes utilitárias)
- **Estado**: React Hooks (useState, useEffect, useCallback)
- **Roteamento**: Sistema de páginas baseado em estado

### 3.2 Backend e Banco de Dados
- **BaaS**: Supabase (Backend as a Service)
- **Banco de Dados**: PostgreSQL (via Supabase)
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage para mídias
- **Real-time**: Subscriptions para atualizações em tempo real

### 3.3 Integrações Externas

#### 3.3.1 Google Maps API
- **Autocomplete**: Busca de endereços
- **Geocoding**: Conversão de endereços em coordenadas
- **Maps**: Visualização de mapas interativos
- **Places**: Informações detalhadas de locais

#### 3.3.2 Google Gemini AI
- **Geração de Texto**: Títulos e descrições automáticas
- **Processamento**: Análise de dados do imóvel
- **Configuração**: Chave de API via variáveis de ambiente

### 3.4 Estrutura de Dados

#### 3.4.1 Tabela: imoveis
```sql
- id: number (Primary Key)
- anunciante_id: string
- titulo: string
- descricao: string
- endereco_completo: string
- cidade: string
- latitude: number
- longitude: number
- preco: number
- tipo_operacao: 'venda' | 'aluguel' | 'temporada'
- tipo_imovel: string
- quartos: number
- banheiros: number
- area_bruta: number
- area_util: number
- status: 'ativo' | 'inativo' | 'vendido' | 'alugado' | 'pendente'
- caracteristicas_imovel: string[]
- caracteristicas_condominio: string[]
- data_publicacao: timestamp
- data_atualizacao: timestamp
```

#### 3.4.2 Tabela: midias_imovel
```sql
- id: number (Primary Key)
- imovel_id: number (Foreign Key)
- url: string
- tipo: 'imagem' | 'video'
- ordem: number
```

#### 3.4.3 Tabela: admin_users
```sql
- id: UUID (Primary Key)
- email: string (Unique)
- password_hash: string
- name: string
- role: 'admin' | 'super_admin'
- is_active: boolean
- created_at: timestamp
- updated_at: timestamp
- last_login: timestamp
```

## 4. Fluxos de Usuário

### 4.1 Fluxo do Visitante
1. **Acesso ao Portal**: Carregamento da página inicial
2. **Busca de Imóveis**: Utilização de filtros ou busca por texto
3. **Visualização**: Navegação pelos resultados
4. **Detalhes**: Acesso à página completa do imóvel
5. **Contato**: Informações para contato com anunciante

### 4.2 Fluxo de Publicação
1. **Acesso**: Navegação para "Publicar Imóvel"
2. **Formulário**: Preenchimento de dados básicos
3. **Localização**: Seleção de endereço com autocomplete
4. **Detalhes**: Características e especificações
5. **Mídia**: Upload de imagens e vídeos
6. **IA**: Geração automática de título/descrição
7. **Validação**: Verificação de dados obrigatórios
8. **Publicação**: Submissão e confirmação

### 4.3 Fluxo Administrativo
1. **Login**: Autenticação no painel admin
2. **Dashboard**: Visualização de métricas
3. **Gestão**: Acesso à lista de propriedades
4. **Ações**: Edição, exclusão ou alteração de status
5. **Publicação**: Criação de novos anúncios
6. **Logout**: Encerramento da sessão

## 5. Requisitos Não Funcionais

### 5.1 Performance
- **Carregamento Inicial**: < 3 segundos
- **Navegação**: Transições fluidas entre páginas
- **Imagens**: Lazy loading e otimização automática
- **Paginação**: Carregamento incremental (6 itens por página)

### 5.2 Responsividade
- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: Suporte a tablets e desktops
- **Touch**: Gestos de toque para carrosséis e mapas

### 5.3 Acessibilidade
- **WCAG**: Conformidade com diretrizes de acessibilidade
- **Navegação**: Suporte a teclado
- **Screen Readers**: Compatibilidade com leitores de tela
- **Contraste**: Cores adequadas para visibilidade

### 5.4 Segurança
- **Autenticação**: Senhas criptografadas (bcrypt)
- **Autorização**: Controle de acesso baseado em roles
- **RLS**: Row Level Security no Supabase
- **HTTPS**: Comunicação segura
- **Validação**: Sanitização de inputs

### 5.5 Escalabilidade
- **CDN**: Distribuição de conteúdo estático
- **Cache**: Estratégias de cache para APIs
- **Otimização**: Lazy loading e code splitting
- **Monitoramento**: Logs e métricas de performance

## 6. Configuração e Deploy

### 6.1 Variáveis de Ambiente
```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_GOOGLE_MAPS_API_KEY=sua_chave_google_maps
GEMINI_API_KEY=sua_chave_gemini
```

### 6.2 Scripts de Build
- **Desenvolvimento**: `npm run dev` (porta 3000)
- **Build**: `npm run build`
- **Preview**: `npm run preview` (porta 4173)

### 6.3 Dependências Principais
- React 18.2.0
- @supabase/supabase-js 2
- @react-google-maps/api 2.19.2
- @google/genai latest
- recharts 3.3.0

## 7. Roadmap e Melhorias Futuras

### 7.1 Fase 2 - Funcionalidades Avançadas
- **Chat em Tempo Real**: Comunicação entre interessados e anunciantes
- **Sistema de Favoritos**: Salvamento de imóveis preferidos
- **Alertas**: Notificações por email/SMS para novos imóveis
- **Comparação**: Ferramenta para comparar propriedades
- **Tours Virtuais**: Integração com tours 360°

### 7.2 Fase 3 - Inteligência e Analytics
- **Recomendações**: IA para sugestão de imóveis
- **Análise de Mercado**: Relatórios de preços e tendências
- **Avaliação Automática**: Estimativa de valor de imóveis
- **Insights**: Dashboard com métricas avançadas

### 7.3 Fase 4 - Expansão
- **Multi-idioma**: Suporte a português, inglês e espanhol
- **Multi-moeda**: Conversão automática de valores
- **API Pública**: Endpoints para integrações externas
- **Mobile App**: Aplicativo nativo iOS/Android

## 8. Métricas de Sucesso

### 8.1 KPIs Técnicos
- **Uptime**: > 99.5%
- **Performance**: Core Web Vitals dentro dos limites
- **Erro Rate**: < 1%
- **Load Time**: < 3 segundos

### 8.2 KPIs de Negócio
- **Conversão**: Taxa de contatos por visualização
- **Engajamento**: Tempo médio na plataforma
- **Retenção**: Usuários recorrentes
- **Crescimento**: Novos anúncios por mês

## 9. Suporte e Manutenção

### 9.1 Documentação
- **README**: Instruções de instalação e configuração
- **API Docs**: Documentação das integrações
- **User Guide**: Manual do usuário
- **Admin Guide**: Manual administrativo

### 9.2 Monitoramento
- **Logs**: Sistema de logging estruturado
- **Alertas**: Notificações para erros críticos
- **Backup**: Backup automático do banco de dados
- **Updates**: Processo de atualização contínua

---

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Autor**: Quality Home Development Team  
**Status**: Implementado e em Produção