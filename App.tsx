


import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import PropertyListings from './components/PropertyListings';
import MapDrawPage from './components/MapDrawPage';
import PublishAdPage from './components/PublishAdPage';
// FIX: Changed import to be a named import as PublishJourneyPage is not a default export.
import { PublishJourneyPage } from './components/PublishJourneyPage';
import LoginModal from './components/LoginModal';
import GeolocationErrorModal from './components/GeolocationErrorModal';
import SearchResultsPage from './components/SearchResultsPage';
import PropertyDetailPage from './components/PropertyDetailPage';
import FavoritesPage from './components/FavoritesPage';
import ChatListPage from './components/ChatListPage';
import ChatPage from './components/ChatPage';
import MyAdsPage from './components/MyAdsPage';
import SystemModal from './components/SystemModal';
import AllListingsPage from './components/AllListingsPage';
import ContactModal from './components/ContactModal';
import GuideToSellPage from './components/GuideToSellPage';
import DocumentsForSalePage from './components/DocumentsForSalePage';
import { useLanguage } from './contexts/LanguageContext';
import { supabase } from './supabaseClient';
import type { User, Property, ChatSession, Message, Profile, Media } from './types';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';

type MainPage = 'home' | 'favorites' | 'myAds' | 'chatList' | 'publish';
type OverlayPage = 'map' | 'publish-journey' | 'searchResults' | 'propertyDetail' | 'chat' | 'edit-journey' | 'allListings' | 'guideToSell' | 'documentsForSale';


interface PageState {
  page: MainPage | OverlayPage;
  userLocation: { lat: number; lng: number } | null;
  searchQuery?: string;
  propertyId?: number;
  chatSessionId?: string;
  propertyToEdit?: Property;
}

interface ModalConfig {
  isOpen: boolean;
  type: 'success' | 'error' | 'confirm';
  title: string;
  message: string;
  onConfirm?: () => void;
}

// ====================================================================================
// DEVELOPMENT DATABASE SEEDING FUNCTION
// To use: Open the browser developer console and run `seedDatabase()`
// ====================================================================================
const seedDatabase = async () => {
  const testUserId = 'e67c0a53-f728-476a-9532-7c2b4d2841c2';
  console.log('--- Iniciando o processo de seeding do banco de dados ---');
  console.log(`Usuário de teste ID: ${testUserId}`);

  try {
    // 1. Limpar dados antigos
    console.log('Limpando anúncios e mídias antigas...');
    const { data: userProperties, error: fetchError } = await supabase
      .from('imoveis')
      .select('id')
      .eq('anunciante_id', testUserId);
    
    if (fetchError) throw new Error(`Erro ao buscar imóveis antigos: ${fetchError.message}`);

    if (userProperties && userProperties.length > 0) {
      const propertyIds = userProperties.map(p => p.id);
      const { error: mediaDeleteError } = await supabase.from('midias_imovel').delete().in('imovel_id', propertyIds);
      if (mediaDeleteError) throw new Error(`Erro ao deletar mídias antigas: ${mediaDeleteError.message}`);
      
      const { error: propertyDeleteError } = await supabase.from('imoveis').delete().eq('anunciante_id', testUserId);
      if (propertyDeleteError) throw new Error(`Erro ao deletar imóveis antigos: ${propertyDeleteError.message}`);
      
      console.log(`${propertyIds.length} anúncios antigos foram limpos.`);
    } else {
      console.log('Nenhum anúncio antigo encontrado para limpar.');
    }

    // 2. Definir dados de teste
    const propertiesToSeed = [
        {
            property: { anunciante_id: testUserId, titulo: 'Apartamento de Luxo com Vista para o Mar na Barra', descricao: 'Desfrute de uma vista deslumbrante do Farol da Barra neste apartamento de 3 suítes, totalmente mobiliado e decorado. Condomínio com infraestrutura completa de lazer e segurança.', endereco_completo: 'Avenida Oceânica, 123, Barra, Salvador, BA', cidade: 'Salvador, BA', rua: 'Avenida Oceânica', numero: '123', latitude: -13.0103, longitude: -38.5307, preco: 2500000, tipo_operacao: 'venda', tipo_imovel: 'Apartamento', quartos: 3, banheiros: 4, area_bruta: 180, possui_elevador: true, taxa_condominio: 1500, caracteristicas_imovel: ["suite", "mobiliado", "cozinhaEquipada", "balcony", "airConditioning"], caracteristicas_condominio: ["pool", "academia", "salaoDeFestas", "portaria24h"], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }, { url: 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Casa Espaçosa com Piscina em Alphaville', descricao: 'Casa moderna com 4 quartos, piscina privativa e área gourmet. Perfeita para famílias que buscam conforto e segurança em um dos melhores condomínios de Salvador.', endereco_completo: 'Alameda das Árvores, 456, Alphaville, Salvador, BA', cidade: 'Salvador, BA', rua: 'Alameda das Árvores', numero: '456', latitude: -12.9469, longitude: -38.4111, preco: 1800000, tipo_operacao: 'venda', tipo_imovel: 'Casa', quartos: 4, banheiros: 5, area_bruta: 320, possui_elevador: false, taxa_condominio: 1200, caracteristicas_imovel: ["suite", "cozinhaEquipada", "escritorio", "garage"], caracteristicas_condominio: ["quadraEsportiva", "parqueInfantil", "portaria24h"], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }, { url: 'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Apartamento Aconchegante para Alugar no Rio Vermelho', descricao: 'Alugue este charmoso apartamento de 1 quarto no coração do Rio Vermelho. Próximo a bares, restaurantes e da praia. Totalmente mobiliado.', endereco_completo: 'Rua da Paciência, 789, Rio Vermelho, Salvador, BA', cidade: 'Salvador, BA', rua: 'Rua da Paciência', numero: '789', latitude: -13.0135, longitude: -38.4912, preco: 3500, tipo_operacao: 'aluguel', tipo_imovel: 'Apartamento', quartos: 1, banheiros: 1, area_bruta: 50, possui_elevador: true, taxa_condominio: 500, caracteristicas_imovel: ["mobiliado", "airConditioning", "cozinhaEquipada"], caracteristicas_condominio: ["portaria24h"], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Excelente Terreno para Construção em Itapuã', descricao: 'Oportunidade única! Terreno plano de 500m², a poucos metros da praia de Itapuã. Ideal para construir a casa dos seus sonhos ou para investimento.', endereco_completo: 'Rua da Sereia, 101, Itapuã, Salvador, BA', cidade: 'Salvador, BA', rua: 'Rua da Sereia', numero: '101', latitude: -12.9515, longitude: -38.3586, preco: 450000, tipo_operacao: 'venda', tipo_imovel: 'Terreno', quartos: 0, banheiros: 0, area_bruta: 500, possui_elevador: false, taxa_condominio: 0, caracteristicas_imovel: [], caracteristicas_condominio: [], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/101808/pexels-photo-101808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Escritório Moderno para Alugar no Caminho das Árvores', descricao: 'Sala comercial de 80m² em prédio de alto padrão na Av. Tancredo Neves. Com recepção, segurança 24h e vaga de garagem. Pronto para o seu negócio.', endereco_completo: 'Avenida Tancredo Neves, 222, Caminho das Árvores, Salvador, BA', cidade: 'Salvador, BA', rua: 'Avenida Tancredo Neves', numero: '222', latitude: -12.9818, longitude: -38.4557, preco: 6000, tipo_operacao: 'aluguel', tipo_imovel: 'Escritório', quartos: 0, banheiros: 2, area_bruta: 80, possui_elevador: true, taxa_condominio: 800, caracteristicas_imovel: ["airConditioning", "garage"], caracteristicas_condominio: ["portaria24h"], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Apartamento 2 Quartos com Suíte no Imbuí', descricao: 'Ótimo apartamento no Imbuí, perto de tudo. 2 quartos sendo uma suíte, varanda e armários planejados. Condomínio com piscina e academia.', endereco_completo: 'Rua das Gaivotas, 333, Imbuí, Salvador, BA', cidade: 'Salvador, BA', rua: 'Rua das Gaivotas', numero: '333', latitude: -12.9691, longitude: -38.4418, preco: 480000, tipo_operacao: 'venda', tipo_imovel: 'Apartamento', quartos: 2, banheiros: 2, area_bruta: 75, possui_elevador: true, taxa_condominio: 650, caracteristicas_imovel: ["suite", "balcony", "builtInWardrobes"], caracteristicas_condominio: ["pool", "academia", "portaria24h"], situacao_ocupacao: 'alugado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Casa de Praia Charmosa em Stella Maris', descricao: 'Viva o sonho de morar perto do mar! Casa duplex com 3 quartos, jardim e a poucos passos da melhor praia de Stella Maris.', endereco_completo: 'Alameda Praia de Guaratuba, 555, Stella Maris, Salvador, BA', cidade: 'Salvador, BA', rua: 'Alameda Praia de Guaratuba', numero: '555', latitude: -12.9431, longitude: -38.3308, preco: 950000, tipo_operacao: 'venda', tipo_imovel: 'Casa', quartos: 3, banheiros: 3, area_bruta: 150, possui_elevador: false, taxa_condominio: 300, caracteristicas_imovel: ["balcony", "greenArea", "cozinhaEquipada"], caracteristicas_condominio: [], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Quarto Individual para Alugar no Centro', descricao: 'Alugo quarto mobiliado em apartamento compartilhado no centro da cidade. Ideal para estudantes. Contas inclusas.', endereco_completo: 'Rua Chile, 444, Centro, Salvador, BA', cidade: 'Salvador, BA', rua: 'Rua Chile', numero: '444', latitude: -12.9750, longitude: -38.5126, preco: 800, tipo_operacao: 'aluguel', tipo_imovel: 'Quarto', quartos: 1, banheiros: 1, area_bruta: 15, possui_elevador: true, taxa_condominio: 0, caracteristicas_imovel: ["mobiliado"], caracteristicas_condominio: [], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/439227/pexels-photo-439227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Cobertura Duplex com Vista Baía de Todos os Santos', descricao: 'Cobertura espetacular na Vitória, com 4 suítes, piscina privativa e vista panorâmica para a Baía. Um imóvel para quem busca exclusividade.', endereco_completo: 'Corredor da Vitória, 777, Vitória, Salvador, BA', cidade: 'Salvador, BA', rua: 'Corredor da Vitória', numero: '777', latitude: -12.9934, longitude: -38.5262, preco: 4500000, tipo_operacao: 'venda', tipo_imovel: 'Apartamento', quartos: 4, banheiros: 6, area_bruta: 400, possui_elevador: true, taxa_condominio: 3000, caracteristicas_imovel: ["suite", "pool", "terrace", "escritorio"], caracteristicas_condominio: ["portaria24h", "salaoDeFestas"], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/314937/pexels-photo-314937.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Apartamento Histórico para Temporada no Pelourinho', descricao: 'Hospede-se no coração do Centro Histórico de Salvador. Apartamento de 2 quartos em um casarão colonial reformado. Diárias a partir de R$ 300.', endereco_completo: 'Largo do Pelourinho, 12, Pelourinho, Salvador, BA', cidade: 'Salvador, BA', rua: 'Largo do Pelourinho', numero: '12', latitude: -12.9719, longitude: -38.5097, preco: 300, tipo_operacao: 'temporada', tipo_imovel: 'Apartamento', quartos: 2, banheiros: 1, area_bruta: 80, possui_elevador: false, taxa_condominio: 0, caracteristicas_imovel: ["mobiliado", "cozinhaEquipada"], caracteristicas_condominio: [], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Casa Aconchegante em Condomínio Fechado em Piatã', descricao: 'Casa térrea com 3 quartos, jardim de inverno e área verde. O condomínio oferece segurança 24h, piscina e quadra.', endereco_completo: 'Rua das Dunas, 88, Piatã, Salvador, BA', cidade: 'Salvador, BA', rua: 'Rua das Dunas', numero: '88', latitude: -12.9528, longitude: -38.3846, preco: 850000, tipo_operacao: 'venda', tipo_imovel: 'Casa', quartos: 3, banheiros: 2, area_bruta: 160, possui_elevador: false, taxa_condominio: 700, caracteristicas_imovel: ["greenArea", "builtInWardrobes"], caracteristicas_condominio: ["pool", "quadraEsportiva", "portaria24h"], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Apartamento Garden para Alugar na Pituba', descricao: 'More com a sensação de estar em uma casa. Apartamento térreo com área externa privativa, 2 quartos e excelente localização.', endereco_completo: 'Rua Ceará, 999, Pituba, Salvador, BA', cidade: 'Salvador, BA', rua: 'Rua Ceará', numero: '999', latitude: -12.9969, longitude: -38.4593, preco: 4200, tipo_operacao: 'aluguel', tipo_imovel: 'Apartamento', quartos: 2, banheiros: 2, area_bruta: 110, possui_elevador: true, taxa_condominio: 800, caracteristicas_imovel: ["terrace", "greenArea"], caracteristicas_condominio: ["salaoDeFestas", "parqueInfantil"], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Terreno Comercial de Esquina na Av. Paralela', descricao: 'Terreno de 1000m² em localização estratégica na Avenida Paralela, ideal para construção de galpão, loja ou centro comercial.', endereco_completo: 'Avenida Luís Viana, 5000, Paralela, Salvador, BA', cidade: 'Salvador, BA', rua: 'Avenida Luís Viana', numero: '5000', latitude: -12.9599, longitude: -38.4239, preco: 3000000, tipo_operacao: 'venda', tipo_imovel: 'Terreno', quartos: 0, banheiros: 0, area_bruta: 1000, possui_elevador: false, taxa_condominio: 0, caracteristicas_imovel: [], caracteristicas_condominio: [], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Studio Mobiliado e Moderno no Costa Azul', descricao: 'Studio compacto e funcional, perfeito para solteiros ou casais. Totalmente mobiliado, com varanda integrada e perto do Salvador Shopping.', endereco_completo: 'Rua Doutor Augusto Lopes Pontes, 131, Costa Azul, Salvador, BA', cidade: 'Salvador, BA', rua: 'Rua Doutor Augusto Lopes Pontes', numero: '131', latitude: -12.9868, longitude: -38.4485, preco: 2500, tipo_operacao: 'aluguel', tipo_imovel: 'Apartamento', quartos: 1, banheiros: 1, area_bruta: 40, possui_elevador: true, taxa_condominio: 450, caracteristicas_imovel: ["mobiliado", "balcony", "airConditioning"], caracteristicas_condominio: ["academia", "portaria24h"], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Casa de Vila Charmosa no Santo Antônio', descricao: 'Casa duplex em vila tranquila no charmoso bairro de Santo Antônio. 2 quartos, reformada, mantendo o estilo colonial.', endereco_completo: 'Ladeira do Baluarte, 22, Santo Antônio, Salvador, BA', cidade: 'Salvador, BA', rua: 'Ladeira do Baluarte', numero: '22', latitude: -12.9665, longitude: -38.5065, preco: 750000, tipo_operacao: 'venda', tipo_imovel: 'Casa', quartos: 2, banheiros: 2, area_bruta: 90, possui_elevador: false, taxa_condominio: 50, caracteristicas_imovel: ["cozinhaEquipada"], caracteristicas_condominio: [], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/209296/pexels-photo-209296.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Apartamento Alto Padrão 4 Suítes no Horto Florestal', descricao: 'Imóvel de alto luxo, 1 por andar, com 4 suítes, varanda gourmet e 4 vagas de garagem. Condomínio com infraestrutura de clube.', endereco_completo: 'Avenida Santa Luzia, 1133, Horto Florestal, Salvador, BA', cidade: 'Salvador, BA', rua: 'Avenida Santa Luzia', numero: '1133', latitude: -12.9960, longitude: -38.4871, preco: 3200000, tipo_operacao: 'venda', tipo_imovel: 'Apartamento', quartos: 4, banheiros: 5, area_bruta: 250, possui_elevador: true, taxa_condominio: 2200, caracteristicas_imovel: ["suite", "balcony", "builtInWardrobes", "escritorio"], caracteristicas_condominio: ["pool", "academia", "quadraEsportiva", "portaria24h"], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Casa Ampla para Alugar em Vilas do Atlântico', descricao: 'Excelente casa com 4 quartos, piscina e quiosque com churrasqueira em Vilas do Atlântico. Próxima à praia e serviços.', endereco_completo: 'Avenida Praia de Itapuã, 100, Vilas do Atlântico, Lauro de Freitas, BA', cidade: 'Lauro de Freitas, BA', rua: 'Avenida Praia de Itapuã', numero: '100', latitude: -12.8710, longitude: -38.3130, preco: 7000, tipo_operacao: 'aluguel', tipo_imovel: 'Casa', quartos: 4, banheiros: 4, area_bruta: 280, possui_elevador: false, taxa_condominio: 400, caracteristicas_imovel: ["pool", "churrasqueira", "greenArea"], caracteristicas_condominio: ["portaria24h"], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Apartamento Espaçoso na Graça', descricao: 'Apartamento amplo e ventilado no bairro da Graça, com 3 quartos, dependência completa e 2 vagas. Perto de escolas e supermercados.', endereco_completo: 'Rua da Graça, 256, Graça, Salvador, BA', cidade: 'Salvador, BA', rua: 'Rua da Graça', numero: '256', latitude: -12.9995, longitude: -38.5225, preco: 980000, tipo_operacao: 'venda', tipo_imovel: 'Apartamento', quartos: 3, banheiros: 3, area_bruta: 140, possui_elevador: true, taxa_condominio: 1100, caracteristicas_imovel: ["balcony", "builtInWardrobes"], caracteristicas_condominio: ["salaoDeFestas", "portaria24h"], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/208736/pexels-photo-208736.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Sala Comercial com Vista Mar no Comércio', descricao: 'Sala comercial de 50m² em prédio histórico reformado no Comércio. Vista para o mar. Excelente para escritórios de advocacia ou startups.', endereco_completo: 'Avenida da França, 393, Comércio, Salvador, BA', cidade: 'Salvador, BA', rua: 'Avenida da França', numero: '393', latitude: -12.9691, longitude: -38.5144, preco: 350000, tipo_operacao: 'venda', tipo_imovel: 'Escritório', quartos: 0, banheiros: 1, area_bruta: 50, possui_elevador: true, taxa_condominio: 550, caracteristicas_imovel: ["terrace"], caracteristicas_condominio: ["portaria24h"], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        },
        {
            property: { anunciante_id: testUserId, titulo: 'Casa de Temporada com Piscina em Morro de São Paulo', descricao: 'Alugue esta casa incrível para suas férias em Morro de São Paulo. 3 suítes, piscina com deck e perto da Segunda Praia. Diárias a partir de R$ 800.', endereco_completo: 'Rua da Segunda Praia, 10, Morro de São Paulo, Cairu, BA', cidade: 'Cairu, BA', rua: 'Rua da Segunda Praia', numero: '10', latitude: -13.3813, longitude: -38.9137, preco: 800, tipo_operacao: 'temporada', tipo_imovel: 'Casa', quartos: 3, banheiros: 4, area_bruta: 200, possui_elevador: false, taxa_condominio: 0, caracteristicas_imovel: ["pool", "mobiliado", "suite", "cozinhaEquipada"], caracteristicas_condominio: [], situacao_ocupacao: 'desocupado', status: 'ativo' },
            media: [{ url: 'https://images.pexels.com/photos/1428348/pexels-photo-1428348.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', tipo: 'imagem' }]
        }
    ];

    // 3. Inserir novos dados
    console.log(`Iniciando a inserção de ${propertiesToSeed.length} novos anúncios...`);
    for (const [index, data] of propertiesToSeed.entries()) {
      const { data: insertedProperty, error: propertyError } = await supabase
        .from('imoveis')
        .insert(data.property)
        .select('id')
        .single();

      if (propertyError) throw new Error(`Erro ao inserir imóvel #${index + 1} (${data.property.titulo}): ${propertyError.message}`);
      
      if (data.media.length > 0) {
        const mediaToInsert = data.media.map(m => ({
          imovel_id: insertedProperty.id,
          url: m.url,
          tipo: m.tipo
        }));
        const { error: mediaError } = await supabase.from('midias_imovel').insert(mediaToInsert);
        if (mediaError) throw new Error(`Erro ao inserir mídia para imóvel #${index + 1}: ${mediaError.message}`);
      }
      console.log(`Anúncio #${index + 1} ('${data.property.titulo}') criado com sucesso.`);
    }

    console.log('--- Processo de seeding concluído com sucesso! ---');
    console.log('Recarregue a página para ver os novos anúncios.');

  } catch (error: any) {
    console.error('--- Ocorreu um erro durante o seeding ---');
    console.error(error.message);
  }
};


const App: React.FC = () => {
  const [isSplashing, setIsSplashing] = useState(true);
  const [pageState, setPageState] = useState<PageState>({ page: 'home', userLocation: null });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isGeoErrorModalOpen, setIsGeoErrorModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({ isOpen: false, type: 'success', title: '', message: '' });
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loginIntent, setLoginIntent] = useState<'default' | 'publish'>('default');
  const [favorites, setFavorites] = useState<number[]>([]);
  const { t } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  const [myAds, setMyAds] = useState<Property[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const fetchingRef = useRef(false);
  const [contactModalProperty, setContactModalProperty] = useState<Property | null>(null);

  const navigateHome = useCallback(() => setPageState({ page: 'home', userLocation: null }), []);

  const showModal = useCallback((config: Omit<ModalConfig, 'isOpen'>) => {
    setModalConfig({ ...config, isOpen: true });
  }, []);

  const hideModal = () => {
      setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const fetchAllData = useCallback(async (currentUser: User | null) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setIsLoading(true);
    console.time('fetchAllData');

    try {
        let query = supabase
            .from('imoveis')
            .select(`
                *,
                midias_imovel ( id, url, tipo ),
                perfis:anunciante_id ( id, nome_completo, telefone, url_foto_perfil )
            `);

        if (currentUser) {
            query = query.or(`status.eq.ativo,anunciante_id.eq.${currentUser.id}`);
        } else {
            query = query.eq('status', 'ativo');
        }

        const { data: propertiesData, error } = await query;
        if (error) throw error;

        const uniquePropertiesData = propertiesData || [];

        const adaptedProperties = uniquePropertiesData.map((db:any): Property => ({
          ...db,
          title: db.titulo,
          address: db.endereco_completo,
          bedrooms: db.quartos,
          bathrooms: db.banheiros,
          area: db.area_bruta,
          lat: db.latitude,
          lng: db.longitude,
          price: db.preco,
          description: db.descricao,
          images: (db.midias_imovel || []).filter((m:any)=>m.tipo==='imagem').map((m:any)=>m.url),
          videos: (db.midias_imovel || []).filter((m:any)=>m.tipo==='video').map((m:any)=>m.url),
          owner: db.perfis ? { ...db.perfis, phone: db.perfis.telefone } : undefined,
          midias_imovel: db.midias_imovel || [],
        }));

        setProperties(adaptedProperties);
        setMyAds(currentUser ? adaptedProperties.filter(p => p.anunciante_id === currentUser.id) : []);

        if (currentUser) {
            const { data: favoritesData, error: favoritesError } = await supabase
                .from('favoritos_usuario')
                .select('imovel_id')
                .eq('usuario_id', currentUser.id);

            if (favoritesError) console.error('Error fetching favorites:', favoritesError);
            else setFavorites(favoritesData.map(f => f.imovel_id));

            const { data: chatData, error: chatError } = await supabase
                .rpc('get_user_chat_sessions', { user_id_param: currentUser.id });

            if (chatError) console.error('Error fetching chat sessions:', chatError);
            else if (chatData) {
                const adaptedSessions = chatData.map((s: any) => {
                    const validParticipants = (s.participants || []).filter((p: any) => p && p.id);
                    const validMessages = (s.messages || []).filter((m: any) => m && m.id && m.data_envio);

                    return {
                        id: s.session_id,
                        sessionId: s.session_id,
                        propertyId: s.imovel_id,
                        imovel_id: s.imovel_id,
                        participants: validParticipants.reduce((acc: any, p: any) => {
                            acc[p.id] = { id: p.id, nome_completo: p.nome_completo };
                            return acc;
                        }, {}),
                        messages: validMessages.map((m: any): Message => ({
                            id: m.id,
                            senderId: m.remetente_id,
                            text: m.conteudo,
                            timestamp: new Date(m.data_envio),
                            remetente_id: m.remetente_id,
                            conteudo: m.conteudo,
                            data_envio: m.data_envio,
                        })),
                        mensagens: validMessages,
                        participantes: validParticipants.reduce((acc: any, p: any) => {
                            acc[p.id] = { id: p.id, nome_completo: p.nome_completo };
                            return acc;
                        }, {}),
                    };
                });
                setChatSessions(adaptedSessions);
            }
        } else {
            setFavorites([]);
            setChatSessions([]);
            setMyAds([]);
        }
    } catch (error: any) {
        console.error('Falha ao buscar dados:', error);
        setProperties([]);
        setMyAds([]);
        showModal({
            type: 'error',
            title: t('systemModal.errorTitle'),
            message: `${t('systemModal.fetchError')} ${t('systemModal.errorDetails')}: ${error.message}`,
        });
    } finally {
        console.timeEnd('fetchAllData');
        setIsLoading(false);
        fetchingRef.current = false;
    }
  }, [t, showModal]);
  
  const navigateToPublishJourney = () => setPageState({ page: 'publish-journey', userLocation: null });

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        if (event === 'INITIAL_SESSION') {
            try {
                const savedStateJSON = sessionStorage.getItem('qualityHomePageState');
                if (savedStateJSON) {
                    const savedState = JSON.parse(savedStateJSON) as PageState;
                    if (savedState && typeof savedState.page === 'string') {
                        setPageState(savedState);
                    }
                }
            } catch (error) {
                console.error("Could not restore page state:", error);
                sessionStorage.removeItem('qualityHomePageState');
            }
        }

        const { data: userProfile, error } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (error && error.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from('perfis')
            .insert({
              id: currentUser.id,
              nome_completo: currentUser.user_metadata.full_name || currentUser.email,
              url_foto_perfil: currentUser.user_metadata.avatar_url,
            })
            .select()
            .single();
          if(insertError) console.error("Error creating profile:", insertError);
          else setProfile(newProfile);
        } else if (userProfile) {
          setProfile(userProfile);
        }

        const savedIntent = localStorage.getItem('loginIntent');
        if (event === 'SIGNED_IN' && savedIntent === 'publish') {
            navigateToPublishJourney();
            localStorage.removeItem('loginIntent');
        } else if (loginIntent === 'publish') {
            navigateToPublishJourney();
            setLoginIntent('default');
        }
      } else {
        setProfile(null);
        sessionStorage.removeItem('qualityHomePageState');
      }
      setIsAuthReady(true);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loginIntent]);

  useEffect(() => {
    if (user && isAuthReady) {
        try {
            const stateToSave = JSON.stringify(pageState);
            sessionStorage.setItem('qualityHomePageState', stateToSave);
        } catch (error) {
            console.error("Could not save page state:", error);
        }
    }
  }, [pageState, user, isAuthReady]);
  
  useEffect(() => {
    if(isAuthReady) {
      fetchAllData(user);
    }
  }, [isAuthReady, user, fetchAllData]);

  useEffect(() => {
    (window as any).seedDatabase = seedDatabase;
    console.log("Função de teste 'seedDatabase()' disponível. Use para popular o banco de dados.");
  }, []);

  useEffect(() => {
    if (!user) return;
  
    const channel = supabase
      .channel('public:mensagens_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens_chat' }, (payload) => {
        const newMessage = payload.new as any;
  
        if (newMessage.remetente_id !== user.id) {
          setHasUnreadMessages(true);
        }
  
        setChatSessions(prevSessions => {
          const sessionIndex = prevSessions.findIndex(s => s.id === newMessage.sessao_id);
  
          if (sessionIndex === -1) {
            fetchAllData(user);
            return prevSessions;
          }
  
          const updatedSessions = [...prevSessions];
          const targetSession = { ...updatedSessions[sessionIndex] };
  
          const messageExists = targetSession.messages.some(m => m.id === newMessage.id);
          if (messageExists) {
            return prevSessions;
          }
  
          const adaptedMessage: Message = {
            id: newMessage.id,
            senderId: newMessage.remetente_id,
            text: newMessage.conteudo,
            timestamp: new Date(newMessage.data_envio),
            remetente_id: newMessage.remetente_id,
            conteudo: newMessage.conteudo,
            data_envio: newMessage.data_envio,
          };
          
          targetSession.messages = [...targetSession.messages, adaptedMessage];
          targetSession.mensagens = [...targetSession.mensagens, adaptedMessage];
          
          updatedSessions[sessionIndex] = targetSession;
  
          return updatedSessions;
        });
      })
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchAllData]);

  useEffect(() => {
    if (!isAuthReady) return;

    const propertiesChannel = supabase
      .channel('public:imoveis')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'imoveis' },
        (payload) => {
          console.log('Real-time change detected on imoveis table:', payload);
          fetchAllData(user);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(propertiesChannel);
    };
  }, [isAuthReady, user, fetchAllData]);

  useEffect(() => {
    if (!isLoading) return;
    const timeoutId = setTimeout(() => {
      console.warn("Fetch timeout reached. Forcing loading state to false.");
      setIsLoading(false);
    }, 8000);
    return () => clearTimeout(timeoutId);
  }, [isLoading]);
  
  const navigateToMap = (location: { lat: number; lng: number } | null = null) => setPageState({ page: 'map', userLocation: location });
  const navigateToPublish = () => {
    if (user) {
      navigateToPublishJourney();
    } else {
      openLoginModal('publish');
    }
  };
  
  const navigateToSearchResults = (query: string) => setPageState({ page: 'searchResults', userLocation: null, searchQuery: query });
  const navigateToPropertyDetail = (id: number) => setPageState({ page: 'propertyDetail', propertyId: id, userLocation: null });
  const navigateToFavorites = () => setPageState(prev => ({ ...prev, page: 'favorites' }));
  const navigateToChatList = () => {
    setHasUnreadMessages(false);
    setPageState(prev => ({ ...prev, page: 'chatList' }));
  };
  const navigateToChat = (sessionId: string) => setPageState({ page: 'chat', chatSessionId: sessionId, userLocation: null });
  const navigateToMyAds = () => {
    if (user) {
      setPageState(prev => ({ ...prev, page: 'myAds' }));
    } else {
      openLoginModal();
    }
  };
  const navigateToEditJourney = (property: Property) => {
    setPageState({ page: 'edit-journey', userLocation: null, propertyToEdit: property });
  };
  const navigateToAllListings = () => setPageState({ page: 'allListings', userLocation: null });
  const navigateToGuideToSell = () => setPageState({ page: 'guideToSell', userLocation: null });
  const navigateToDocumentsForSale = () => setPageState({ page: 'documentsForSale', userLocation: null });

  const openLoginModal = (intent: 'default' | 'publish' = 'default') => {
    setLoginIntent(intent);
    setIsLoginModalOpen(true);
  }
  const closeLoginModal = () => setIsLoginModalOpen(false);
  
  const openGeoErrorModal = () => setIsGeoErrorModalOpen(true);
  const closeGeoErrorModal = () => setIsGeoErrorModalOpen(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error signing out:', error.message);
    }
    navigateHome();
  };

  const toggleFavorite = async (propertyId: number) => {
    if (!user) {
      openLoginModal();
      return;
    }
    const isCurrentlyFavorite = favorites.includes(propertyId);
    if (isCurrentlyFavorite) {
      const { error } = await supabase.from('favoritos_usuario').delete().match({ usuario_id: user.id, imovel_id: propertyId });
      if (!error) setFavorites(prev => prev.filter(id => id !== propertyId));
      else console.error("Error removing favorite:", error);
    } else {
      const { error } = await supabase.from('favoritos_usuario').insert({ usuario_id: user.id, imovel_id: propertyId });
      if (!error) setFavorites(prev => [...prev, propertyId]);
      else console.error("Error adding favorite:", error);
    }
  };

  const handleAddProperty = useCallback(async (newProperty: Property) => {
    showModal({
        type: 'success',
        title: t('systemModal.successTitle'),
        message: t('confirmationModal.message'),
    });
    navigateHome();
    if (user) {
        fetchAllData(user);
    }
  }, [user, fetchAllData, t, showModal, navigateHome]);

  const handleUpdateProperty = useCallback(async () => {
    showModal({
        type: 'success',
        title: t('systemModal.successTitle'),
        message: t('systemModal.editSuccessMessage'),
    });
    navigateHome();
    if (user) {
        fetchAllData(user);
    }
  }, [user, fetchAllData, t, showModal, navigateHome]);

  const handlePublishError = useCallback((message: string) => {
    showModal({
        type: 'error',
        title: t('systemModal.errorTitle'),
        message: message,
    });
  }, [t, showModal]);

  const confirmDeleteProperty = async (propertyId: number) => {
    const { error: mediaError } = await supabase
        .from('midias_imovel')
        .delete()
        .eq('imovel_id', propertyId);

    if (mediaError) {
        showModal({ type: 'error', title: t('systemModal.errorTitle'), message: `${t('myAdsPage.adDeletedError')} (media): ${mediaError.message}` });
        console.error('Error deleting property media:', mediaError);
        return;
    }
    
    const { error: propertyError } = await supabase
        .from('imoveis')
        .delete()
        .eq('id', propertyId);

    if (propertyError) {
        showModal({ type: 'error', title: t('systemModal.errorTitle'), message: `${t('myAdsPage.adDeletedError')} ${t('systemModal.errorDetails')}: ${propertyError.message}` });
        console.error('Error deleting property:', propertyError);
    } else {
        showModal({ type: 'success', title: t('systemModal.successTitle'), message: t('myAdsPage.adDeletedSuccess') });
        if (user) {
            fetchAllData(user);
        }
    }
  };

  const handleRequestDeleteProperty = useCallback((propertyId: number) => {
    showModal({
        type: 'confirm',
        title: t('systemModal.confirmTitle'),
        message: t('myAdsPage.deleteConfirm'),
        onConfirm: () => confirmDeleteProperty(propertyId),
    });
  }, [t, showModal]);
  
  const handleStartChat = async (property: Property) => {
    if (!user || !property.anunciante_id) {
      openLoginModal();
      return;
    }
    
    const { data: existing, error: findError } = await supabase.rpc('find_chat_session', {
      p_imovel_id: property.id,
      user1_id: user.id,
      user2_id: property.anunciante_id
    });

    if (findError) {
      console.error("Error finding chat session:", findError);
      return;
    }

    if (existing) {
        navigateToChat(existing);
    } else {
        const { data: newSession, error: createError } = await supabase.rpc('create_chat_session', {
            p_imovel_id: property.id,
            user1_id: user.id,
            user2_id: property.anunciante_id
        });
        if (createError) {
            console.error("Error creating chat session:", createError);
        } else if (newSession) {
            fetchAllData(user);
            navigateToChat(newSession);
        }
    }
  };

  const handleSendMessage = async (sessionId: string, text: string) => {
    if (!user || !text.trim()) return;

    const newMessage = {
      sessao_id: sessionId,
      remetente_id: user.id,
      conteudo: text.trim(),
    };

    const { error } = await supabase.from('mensagens_chat').insert(newMessage);
    if(error) console.error("Error sending message:", error);
  };
  
  const openContactModal = (property: Property) => {
    if (!property.owner) {
      console.warn("Attempted to open contact modal for property with no owner.", property);
      return;
    }
    setContactModalProperty(property);
  };
  const closeContactModal = () => setContactModalProperty(null);

  const mainPages: (MainPage | OverlayPage)[] = ['home', 'favorites', 'myAds', 'chatList', 'publish'];
  const isOverlayPage = !mainPages.includes(pageState.page);

  const renderOverlayPage = () => {
    const commonProps = {
        user,
        profile,
        onLogout: handleLogout,
        onNavigateToFavorites: navigateToFavorites,
        onNavigateToChatList: navigateToChatList,
        onNavigateToMyAds: navigateToMyAds,
        onNavigateToAllListings: navigateToAllListings,
        hasUnreadMessages,
        navigateToGuideToSell,
        navigateToDocumentsForSale,
        navigateHome,
        onPublishAdClick: navigateToPublish,
        onAccessClick: () => openLoginModal('default'),
    };
      
    switch (pageState.page) {
      case 'map':
        return <MapDrawPage 
                  onBack={navigateHome} 
                  userLocation={pageState.userLocation} 
                  onViewDetails={navigateToPropertyDetail}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  properties={properties}
                  onContactClick={openContactModal}
               />;
      case 'publish-journey':
      case 'edit-journey':
        return <PublishJourneyPage
                  propertyToEdit={pageState.page === 'edit-journey' ? pageState.propertyToEdit : null}
                  onBack={navigateHome}
                  onAddProperty={handleAddProperty}
                  onUpdateProperty={handleUpdateProperty}
                  onPublishError={handlePublishError}
                  onRequestModal={showModal}
                  onOpenLoginModal={openLoginModal}
                  {...commonProps}
                />;
      case 'searchResults':
        const query = pageState.searchQuery?.toLowerCase() ?? '';
        const filteredProperties = query
          ? properties.filter(p =>
            p.title.toLowerCase().includes(query) || p.address.toLowerCase().includes(query)
          )
          : [];
        return <SearchResultsPage
          onBack={navigateHome}
          searchQuery={pageState.searchQuery ?? ''}
          properties={filteredProperties}
          onViewDetails={navigateToPropertyDetail}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onContactClick={openContactModal}
          {...commonProps}
        />;
      case 'propertyDetail':
        const property = [...properties, ...myAds].find(p => p.id === pageState.propertyId);
        if (!property) {
          navigateHome();
          return null;
        }
        return <PropertyDetailPage 
                  property={property}
                  onBack={() => window.history.back()}
                  isFavorite={favorites.includes(property.id)}
                  onToggleFavorite={toggleFavorite}
                  onStartChat={handleStartChat}
                  {...commonProps}
                />;
      
      case 'chat':
        const session = chatSessions.find(s => s.id === pageState.chatSessionId);
        const propertyForChat = properties.find(p => p.id === session?.imovel_id);
        if (!session || !user || !propertyForChat) { navigateToChatList(); return null; }
        return <ChatPage
                  onBack={navigateToChatList}
                  user={user}
                  session={session}
                  property={propertyForChat}
                  onSendMessage={handleSendMessage}
               />;
      case 'allListings':
        return <AllListingsPage
          onBack={navigateHome}
          properties={properties}
          onViewDetails={navigateToPropertyDetail}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onSearchSubmit={navigateToSearchResults}
          onGeolocationError={openGeoErrorModal}
          onContactClick={openContactModal}
          {...commonProps}
        />;
       case 'guideToSell':
        return <GuideToSellPage
          onBack={navigateHome}
          {...commonProps}
        />;
      case 'documentsForSale':
        return <DocumentsForSalePage
          onBack={navigateHome}
          {...commonProps}
        />;
      default:
        return null;
    }
  };

  const renderMainContent = () => {
     const commonProps = {
        user,
        profile,
        onLogout: handleLogout,
        onNavigateToFavorites: navigateToFavorites,
        onNavigateToChatList: navigateToChatList,
        onNavigateToMyAds: navigateToMyAds,
        onNavigateToAllListings: navigateToAllListings,
        hasUnreadMessages,
        navigateToGuideToSell,
        navigateToDocumentsForSale,
        navigateHome,
        onPublishAdClick: navigateToPublish,
        onAccessClick: () => openLoginModal('default'),
    };
    
    switch(pageState.page) {
        case 'home':
            return (
                <>
                    <Header {...commonProps} />
                    <main className="pb-24">
                      <Hero 
                        onDrawOnMapClick={() => navigateToMap()} 
                        onSearchNearMe={(location) => navigateToMap(location)}
                        onGeolocationError={openGeoErrorModal}
                        onSearchSubmit={navigateToSearchResults}
                      />
                      <PropertyListings 
                        properties={properties}
                        onViewDetails={navigateToPropertyDetail} 
                        favorites={favorites}
                        onToggleFavorite={toggleFavorite}
                        isLoading={isLoading}
                        onContactClick={openContactModal}
                      />
                    </main>
                </>
            );
        case 'favorites':
            const favoriteProperties = properties.filter(p => favorites.includes(p.id));
            return <FavoritesPage
                onBack={navigateHome}
                properties={favoriteProperties}
                onViewDetails={navigateToPropertyDetail}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onContactClick={openContactModal}
                {...commonProps}
              />;
        case 'myAds':
             if (!user) { navigateHome(); return null; }
            return <MyAdsPage
                onBack={navigateHome}
                userProperties={myAds}
                onViewDetails={navigateToPropertyDetail}
                onDeleteProperty={handleRequestDeleteProperty}
                onEditProperty={navigateToEditJourney}
                {...commonProps}
            />;
        case 'chatList':
            if (!user) { navigateHome(); return null; }
            return <ChatListPage
                  onBack={navigateHome}
                  chatSessions={chatSessions.filter(s => s.participantes[user.id])}
                  properties={properties}
                  onNavigateToChat={navigateToChat}
                  {...commonProps}
               />;
        case 'publish':
            return <PublishAdPage 
                onBack={navigateHome} 
                onOpenLoginModal={() => openLoginModal('publish')} 
                onNavigateToJourney={navigateToPublishJourney}
                {...commonProps}
            />;
        default:
          return null;
    }
  };

  if (isSplashing) {
    return <SplashScreen onFinished={() => setIsSplashing(false)} />;
  }

  return (
    <>
      {isOverlayPage ? renderOverlayPage() : 
        (
            <div className="bg-white font-sans text-brand-dark">
                {renderMainContent()}
                <BottomNav 
                    activeView={pageState.page as MainPage}
                    onNavigate={(page) => {
                       if (page === 'publish') {
                           navigateToPublish();
                       } else {
                           setPageState(prev => ({ ...prev, page: page as MainPage }))
                       }
                    }}
                    hasUnreadMessages={hasUnreadMessages}
                />
            </div>
        )
      }

      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} loginIntent={loginIntent} />
      <GeolocationErrorModal isOpen={isGeoErrorModalOpen} onClose={closeGeoErrorModal} />
      <SystemModal
        {...modalConfig}
        onClose={hideModal}
      />
      <ContactModal 
        isOpen={!!contactModalProperty}
        onClose={closeContactModal}
        owner={contactModalProperty?.owner}
        propertyTitle={contactModalProperty?.title || ''}
        onStartChat={() => {
          if (contactModalProperty) {
            handleStartChat(contactModalProperty);
            closeContactModal();
          }
        }}
      />
    </>
  );
};

export default App;