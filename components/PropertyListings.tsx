
import React from 'react';
import { Property, PropertyStatus } from '../types';
import PropertyCard from './PropertyCard';
import { useLanguage } from '../contexts/LanguageContext';

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 1,
    title: 'Apartamento Luxo com Vista Mar no Farol da Barra',
    address: 'Av. Oceânica, Barra, Salvador, Bahia',
    price: 3500000,
    bedrooms: 3,
    bathrooms: 4,
    area: 220,
    images: ['https://picsum.photos/seed/prop1a/800/600', 'https://picsum.photos/seed/prop1b/800/600', 'https://picsum.photos/seed/prop1c/800/600', 'https://picsum.photos/seed/prop1d/800/600'],
    description: 'Este deslumbrante apartamento de luxo oferece uma vista panorâmica inigualável para o mar, localizado no coração do Farol da Barra. Com acabamentos de alto padrão, amplos espaços e design moderno, é o refúgio perfeito para quem busca conforto e sofisticação. A sala de estar se abre para uma varanda gourmet, ideal para entreter convidados enquanto aprecia o pôr do sol.',
    videos: ['https://www.youtube.com/embed/U32Z7gUXa-c'],
    status: PropertyStatus.New,
    lat: -13.010,
    lng: -38.533,
  },
  {
    id: 2,
    title: 'Casa de Praia em Condomínio em Porto Seguro',
    address: 'Estrada da Balsa, Arraial d\'Ajuda, Porto Seguro, Bahia',
    price: 4200000,
    bedrooms: 4,
    bathrooms: 5,
    area: 450,
    images: ['https://picsum.photos/seed/prop2a/800/600', 'https://picsum.photos/seed/prop2b/800/600', 'https://picsum.photos/seed/prop2c/800/600', 'https://picsum.photos/seed/prop2d/800/600'],
    description: 'Uma casa de praia espetacular em um condomínio fechado, oferecendo segurança e privacidade. Com acesso direto à praia, esta propriedade possui uma piscina incrível, área de churrasco e um jardim tropical exuberante. Os interiores são espaçosos e arejados, com decoração que combina o rústico e o moderno.',
    status: PropertyStatus.Updated,
    lat: -16.495,
    lng: -39.060,
  },
  {
    id: 3,
    title: 'Cobertura Duplex no Corredor da Vitória',
    address: 'Av. Sete de Setembro, Vitória, Salvador, Bahia',
    price: 5800000,
    bedrooms: 3,
    bathrooms: 5,
    area: 310,
    images: ['https://picsum.photos/seed/prop3a/800/600', 'https://picsum.photos/seed/prop3b/800/600', 'https://picsum.photos/seed/prop3c/800/600', 'https://picsum.photos/seed/prop3d/800/600'],
    description: 'Esta cobertura duplex exclusiva no Corredor da Vitória oferece um estilo de vida de alto padrão. No primeiro piso, encontram-se as áreas sociais integradas e uma cozinha gourmet. O segundo piso conta com um terraço privativo com piscina e uma vista deslumbrante da Baía de Todos os Santos.',
    lat: -12.991,
    lng: -38.528,
  },
    {
    id: 4,
    title: 'Pousada Charmosa na Chapada Diamantina',
    address: 'Rua das Pedras, Lençóis, Bahia',
    price: 2100000,
    bedrooms: 8,
    bathrooms: 9,
    area: 600,
    images: ['https://picsum.photos/seed/prop4a/800/600', 'https://picsum.photos/seed/prop4b/800/600', 'https://picsum.photos/seed/prop4c/800/600', 'https://picsum.photos/seed/prop4d/800/600'],
    description: 'Uma pousada cheia de charme e totalmente operacional no coração de Lençóis, a porta de entrada para a Chapada Diamantina. Com suítes confortáveis, uma área de café da manhã encantadora e um jardim relaxante, é um investimento pronto para gerar renda em um dos destinos turísticos mais procurados do Brasil.',
    videos: ['https://www.youtube.com/embed/y9peY2_Yy_I'],
    status: PropertyStatus.New,
    lat: -12.561,
    lng: -41.390,
  },
  {
    id: 5,
    title: 'Bangalô com Vista para o Mar em Itacaré',
    address: 'Praia da Concha, Itacaré, Bahia',
    price: 980000,
    bedrooms: 1,
    bathrooms: 1,
    area: 80,
    images: ['https://picsum.photos/seed/prop5a/800/600', 'https://picsum.photos/seed/prop5b/800/600', 'https://picsum.photos/seed/prop5c/800/600', 'https://picsum.photos/seed/prop5d/800/600'],
    description: 'Este bangalô romântico é perfeito para casais, oferecendo uma vista espetacular para o mar da Praia da Concha. Com um design rústico-chique, possui uma varanda privativa com rede, uma pequena cozinha e um ambiente totalmente integrado à natureza. Ideal para quem busca um refúgio tranquilo e inspirador.',
    lat: -14.280,
    lng: -38.996,
  },
  {
    id: 6,
    title: 'Mansão à Beira-Mar em Trancoso',
    address: 'Praia dos Nativos, Trancoso, Porto Seguro, Bahia',
    price: 12500000,
    bedrooms: 6,
    bathrooms: 8,
    area: 1200,
    images: ['https://picsum.photos/seed/prop6a/800/600', 'https://picsum.photos/seed/prop6b/800/600', 'https://picsum.photos/seed/prop6c/800/600', 'https://picsum.photos/seed/prop6d/800/600'],
    description: 'Uma mansão cinematográfica "pé na areia" na badalada Praia dos Nativos. A propriedade conta com um design assinado por arquiteto renomado, piscina de borda infinita de frente para o mar, e seis suítes luxuosas. É o epítome do luxo e exclusividade no destino mais cobiçado do litoral baiano.',
    status: PropertyStatus.Updated,
    lat: -16.581,
    lng: -39.073,
  },
  { id: 7, title: 'Apartamento na Pituba, 3 quartos', address: 'Rua Ceará, Pituba, Salvador, Bahia', price: 650000, bedrooms: 3, bathrooms: 2, area: 110, images: ['https://picsum.photos/seed/prop7a/800/600', 'https://picsum.photos/seed/prop7b/800/600'], description: 'Amplo apartamento na Pituba, próximo a escolas, supermercados e tudo que sua família precisa. Possui 3 quartos, sendo uma suíte, e varanda.', lat: -12.999, lng: -38.455 },
  { id: 8, title: 'Casa com piscina em Stella Maris', address: 'Alameda Praia de Guaratuba, Stella Maris, Salvador, Bahia', price: 1200000, bedrooms: 4, bathrooms: 4, area: 350, images: ['https://picsum.photos/seed/prop8a/800/600', 'https://picsum.photos/seed/prop8b/800/600'], description: 'Excelente casa em condomínio fechado em Stella Maris, com 4 suítes, piscina privativa e área gourmet. A poucos metros da praia.', videos: ['https://www.youtube.com/embed/z2w7-I0W_0g'], status: PropertyStatus.New, lat: -12.943, lng: -38.337 },
  { id: 9, title: 'Apartamento 2 quartos no Rio Vermelho', address: 'Rua da Paciência, Rio Vermelho, Salvador, Bahia', price: 520000, bedrooms: 2, bathrooms: 2, area: 80, images: ['https://picsum.photos/seed/prop9a/800/600', 'https://picsum.photos/seed/prop9b/800/600'], description: 'Apartamento charmoso no coração do Rio Vermelho, o bairro mais boêmio de Salvador. Ideal para quem busca viver perto de bares, restaurantes e da vida cultural da cidade.', lat: -13.014, lng: -38.494 },
  { id: 10, title: 'Casa no Pelourinho para fins comerciais', address: 'Largo do Pelourinho, Pelourinho, Salvador, Bahia', price: 950000, bedrooms: 5, bathrooms: 3, area: 250, images: ['https://picsum.photos/seed/prop10a/800/600', 'https://picsum.photos/seed/prop10b/800/600'], description: 'Casarão histórico no Pelourinho, perfeito para instalação de pousada, restaurante ou galeria de arte. Uma oportunidade única de investimento no centro histórico de Salvador.', lat: -12.971, lng: -38.509 },
  { id: 11, title: 'Apartamento de 1 quarto na Graça', address: 'Rua da Graça, Graça, Salvador, Bahia', price: 380000, bedrooms: 1, bathrooms: 1, area: 55, images: ['https://picsum.photos/seed/prop11a/800/600', 'https://picsum.photos/seed/prop11b/800/600'], description: 'Apartamento compacto e funcional no bairro da Graça, conhecido por sua tranquilidade e elegância. Próximo a museus, cafés e do Corredor da Vitória.', status: PropertyStatus.Updated, lat: -12.998, lng: -38.523 },
  { id: 12, title: 'Cobertura com vista para a Baía de Todos os Santos', address: 'Ladeira da Barra, Barra, Salvador, Bahia', price: 2800000, bedrooms: 3, bathrooms: 4, area: 280, images: ['https://picsum.photos/seed/prop12a/800/600', 'https://picsum.photos/seed/prop12b/800/600'], description: 'Viva o luxo nesta cobertura com uma das vistas mais espetaculares de Salvador. Terraço com piscina privativa e espaço gourmet.', videos: ['https://www.youtube.com/embed/U32Z7gUXa-c'], lat: -12.995, lng: -38.531 },
  { id: 13, title: 'Apartamento no Imbuí, perto do metrô', address: 'Rua das Gaivotas, Imbuí, Salvador, Bahia', price: 410000, bedrooms: 2, bathrooms: 2, area: 70, images: ['https://picsum.photos/seed/prop13a/800/600', 'https://picsum.photos/seed/prop13b/800/600'], description: 'Praticidade e mobilidade neste apartamento no Imbuí, a poucos passos da estação de metrô. Condomínio com infraestrutura completa de lazer.', status: PropertyStatus.New, lat: -12.973, lng: -38.443 },
  { id: 14, title: 'Casa em condomínio fechado em Piatã', address: 'Rua da Gratidão, Piatã, Salvador, Bahia', price: 1500000, bedrooms: 4, bathrooms: 5, area: 400, images: ['https://picsum.photos/seed/prop14a/800/600', 'https://picsum.photos/seed/prop14b/800/600'], description: 'Casa espaçosa em condomínio com segurança 24h em Piatã. Ideal para famílias, com amplo jardim, piscina e perto das melhores praias.', lat: -12.951, lng: -38.361 },
  { id: 15, title: 'Studio Mobiliado em Ondina', address: 'Av. Oceânica, Ondina, Salvador, Bahia', price: 320000, bedrooms: 1, bathrooms: 1, area: 40, images: ['https://picsum.photos/seed/prop15a/800/600', 'https://picsum.photos/seed/prop15b/800/600'], description: 'Studio moderno e mobiliado em Ondina, perto da UFBA e do circuito do carnaval. Excelente para investimento ou moradia para estudantes.', lat: -13.013, lng: -38.506 },
  { id: 16, title: 'Apartamento Amplo em Brotas', address: 'Av. Dom João VI, Brotas, Salvador, Bahia', price: 480000, bedrooms: 3, bathrooms: 3, area: 120, images: ['https://picsum.photos/seed/prop16a/800/600', 'https://picsum.photos/seed/prop16b/800/600'], description: 'Apartamento espaçoso e ventilado em Brotas, bairro central com fácil acesso a toda a cidade. Condomínio familiar com playground e salão de festas.', videos: ['https://www.youtube.com/embed/y9peY2_Yy_I'], status: PropertyStatus.Updated, lat: -12.983, lng: -38.490 },
  { id: 17, title: 'Terreno em Itapuã, frente mar', address: 'Rua da Sereia, Itapuã, Salvador, Bahia', price: 700000, bedrooms: 0, bathrooms: 0, area: 1000, images: ['https://picsum.photos/seed/prop17a/800/600', 'https://picsum.photos/seed/prop17b/800/600'], description: 'Terreno de 1000m² de frente para o mar de Itapuã. Oportunidade rara para construir a casa dos seus sonhos ou um empreendimento comercial.', lat: -12.949, lng: -38.351 },
  { id: 18, title: 'Apartamento no Horto Florestal, alto padrão', address: 'Av. Santa Luzia, Horto Florestal, Salvador, Bahia', price: 2200000, bedrooms: 4, bathrooms: 5, area: 250, images: ['https://picsum.photos/seed/prop18a/800/600', 'https://picsum.photos/seed/prop18b/800/600'], description: 'Apartamento de alto luxo no Horto Florestal, o endereço mais nobre de Salvador. Um apartamento por andar, com 4 suítes e varanda gourmet.', lat: -12.991, lng: -38.483 },
  { id: 19, title: 'Casa simples na Liberdade', address: 'Rua do Curuzu, Liberdade, Salvador, Bahia', price: 150000, bedrooms: 2, bathrooms: 1, area: 80, images: ['https://picsum.photos/seed/prop19a/800/600', 'https://picsum.photos/seed/prop19b/800/600'], description: 'Casa simples e bem localizada no bairro da Liberdade, próxima ao comércio local e transporte público.', status: PropertyStatus.New, lat: -12.946, lng: -38.494 },
  { id: 20, title: 'Apartamento no Caminho das Árvores', address: 'Alameda das Espatódeas, Caminho das Árvores, Salvador, Bahia', price: 890000, bedrooms: 3, bathrooms: 3, area: 140, images: ['https://picsum.photos/seed/prop20a/800/600', 'https://picsum.photos/seed/prop20b/800/600'], description: 'More perto de tudo no Caminho das Árvores. Apartamento com 3 suítes, andar alto, e próximo ao Shopping da Bahia.', videos: ['https://www.youtube.com/embed/z2w7-I0W_0g'], lat: -12.980, lng: -38.459 },
  { id: 21, title: 'Loja comercial na Avenida Sete', address: 'Av. Sete de Setembro, Centro, Salvador, Bahia', price: 600000, bedrooms: 0, bathrooms: 1, area: 100, images: ['https://picsum.photos/seed/prop21a/800/600', 'https://picsum.photos/seed/prop21b/800/600'], description: 'Ponto comercial com grande visibilidade na Avenida Sete de Setembro, uma das ruas mais movimentadas de Salvador. Ideal para lojas de varejo.', lat: -12.978, lng: -38.513 },
  { id: 22, title: 'Apartamento na Federação', address: 'Rua Caetano Moura, Federação, Salvador, Bahia', price: 280000, bedrooms: 2, bathrooms: 1, area: 65, images: ['https://picsum.photos/seed/prop22a/800/600', 'https://picsum.photos/seed/prop22b/800/600'], description: 'Apartamento bem dividido na Federação, próximo ao campus da UFBA. Ótimo para estudantes e professores.', lat: -13.001, lng: -38.502 },
  { id: 23, title: 'Casa em Vilas do Atlântico', address: 'Praia de Ipitanga, Vilas do Atlântico, Lauro de Freitas, Bahia', price: 1300000, bedrooms: 4, bathrooms: 4, area: 380, images: ['https://picsum.photos/seed/prop23a/800/600', 'https://picsum.photos/seed/prop23b/800/600'], description: 'Casa duplex em Vilas do Atlântico, condomínio desejado em Lauro de Freitas. Com 4 quartos, piscina e a poucos minutos da praia.', status: PropertyStatus.Updated, lat: -12.899, lng: -38.315 },
  { id: 24, title: 'Apartamento com 2 quartos no Cabula', address: 'Rua Silveira Martins, Cabula, Salvador, Bahia', price: 250000, bedrooms: 2, bathrooms: 2, area: 60, images: ['https://picsum.photos/seed/prop24a/800/600', 'https://picsum.photos/seed/prop24b/800/600'], description: 'Apartamento funcional no Cabula, bairro com infraestrutura completa e fácil acesso. Condomínio com portaria 24h.', videos: ['https://www.youtube.com/embed/U32Z7gUXa-c'], lat: -12.956, lng: -38.461 },
  { id: 25, title: 'Sítio em Abrantes', address: 'Estrada do Coco, Abrantes, Camaçari, Bahia', price: 850000, bedrooms: 3, bathrooms: 3, area: 5000, images: ['https://picsum.photos/seed/prop25a/800/600', 'https://picsum.photos/seed/prop25b/800/600'], description: 'Sítio com casa principal, piscina, e muitas árvores frutíferas em Abrantes, na Estrada do Coco. Perfeito para quem busca tranquilidade perto da cidade.', status: PropertyStatus.New, lat: -12.783, lng: -38.286 },
  { id: 26, title: 'Apartamento na Ribeira com vista mar', address: 'Av. Beira Mar, Ribeira, Salvador, Bahia', price: 350000, bedrooms: 2, bathrooms: 1, area: 75, images: ['https://picsum.photos/seed/prop26a/800/600', 'https://picsum.photos/seed/prop26b/800/600'], description: 'Apartamento com vista para o mar da Ribeira, famoso pelo seu pôr do sol. Bairro tradicional e tranquilo.', lat: -12.919, lng: -38.507 },
  { id: 27, title: 'Casa Colonial no Centro Histórico de Cachoeira', address: 'Rua 25 de Junho, Centro, Cachoeira, Bahia', price: 750000, bedrooms: 4, bathrooms: 3, area: 300, images: ['https://picsum.photos/seed/prop27a/800/600', 'https://picsum.photos/seed/prop27b/800/600'], description: 'Casarão colonial restaurado no centro histórico de Cachoeira, cidade heroica do Recôncavo Baiano. Uma viagem no tempo com conforto moderno.', status: PropertyStatus.New, lat: -12.603, lng: -38.964 },
  { id: 28, title: 'Sítio às margens do Rio Paraguaçu', address: 'Zona Rural, Cachoeira, Bahia', price: 980000, bedrooms: 3, bathrooms: 2, area: 10000, images: ['https://picsum.photos/seed/prop28a/800/600', 'https://picsum.photos/seed/prop28b/800/600'], description: 'Sítio com acesso privativo ao Rio Paraguaçu, ideal para quem gosta de pescar e praticar esportes náuticos. Muita área verde e paz.', videos: ['https://www.youtube.com/embed/y9peY2_Yy_I'], lat: -12.615, lng: -38.971 },
  { id: 29, title: 'Pousada charmosa em Cachoeira', address: 'Ladeira da Ajuda, Cachoeira, Bahia', price: 1300000, bedrooms: 8, bathrooms: 9, area: 700, images: ['https://picsum.photos/seed/prop29a/800/600', 'https://picsum.photos/seed/prop29b/800/600'], description: 'Pousada em pleno funcionamento, com ótima avaliação de hóspedes. Decoração rústica e aconchegante, no coração da histórica Cachoeira.', lat: -12.601, lng: -38.960 },
  { id: 30, title: 'Casa com 2 quartos em Cachoeira', address: 'Rua da Feira, Cachoeira, Bahia', price: 220000, bedrooms: 2, bathrooms: 1, area: 90, images: ['https://picsum.photos/seed/prop30a/800/600', 'https://picsum.photos/seed/prop30b/800/600'], description: 'Casa simples e bem localizada em Cachoeira, próxima à feira livre e ao comércio local.', status: PropertyStatus.Updated, lat: -12.598, lng: -38.968 },
  { id: 31, title: 'Terreno com vista para o rio em Cachoeira', address: 'Alto da Levada, Cachoeira, Bahia', price: 180000, bedrooms: 0, bathrooms: 0, area: 800, images: ['https://picsum.photos/seed/prop31a/800/600', 'https://picsum.photos/seed/prop31b/800/600'], description: 'Terreno em área elevada com vista panorâmica para o Rio Paraguaçu e a cidade de São Félix. Ideal para construir sua casa de campo.', lat: -12.608, lng: -38.955 },
  { id: 32, title: 'Casa Grande em Santo Amaro da Purificação', address: 'Praça da Purificação, Centro, Santo Amaro, Bahia', price: 880000, bedrooms: 5, bathrooms: 4, area: 450, images: ['https://picsum.photos/seed/prop32a/800/600', 'https://picsum.photos/seed/prop32b/800/600'], description: 'Imponente casa no centro de Santo Amaro, terra de Caetano e Bethânia. Arquitetura preservada, com pátio interno e muito espaço.', videos: ['https://www.youtube.com/embed/z2w7-I0W_0g'], lat: -12.546, lng: -38.715 },
  { id: 33, title: 'Fazenda de gado perto de Santo Amaro', address: 'Zona Rural, Santo Amaro, Bahia', price: 2500000, bedrooms: 4, bathrooms: 3, area: 500000, images: ['https://picsum.photos/seed/prop33a/800/600', 'https://picsum.photos/seed/prop33b/800/600'], description: 'Fazenda produtiva com casa sede, curral e pasto. Ótima oportunidade para agronegócio no Recôncavo Baiano.', status: PropertyStatus.New, lat: -12.560, lng: -38.750 },
  { id: 34, title: 'Casa de veraneio em Itapema, Santo Amaro', address: 'Praia de Itapema, Santo Amaro, Bahia', price: 450000, bedrooms: 3, bathrooms: 2, area: 200, images: ['https://picsum.photos/seed/prop34a/800/600', 'https://picsum.photos/seed/prop34b/800/600'], description: 'Casa de praia aconchegante na tranquila vila de Itapema. Ideal para relaxar nos fins de semana e feriados.', lat: -12.723, lng: -38.657 },
  { id: 35, title: 'Apartamento de 2 quartos em Santo Amaro', address: 'Rua do Imperador, Santo Amaro, Bahia', price: 190000, bedrooms: 2, bathrooms: 1, area: 70, images: ['https://picsum.photos/seed/prop35a/800/600', 'https://picsum.photos/seed/prop35b/800/600'], description: 'Apartamento prático e bem localizado no centro de Santo Amaro, perto de bancos e lojas.', lat: -12.549, lng: -38.718 },
  { id: 36, title: 'Ponto Comercial no centro de Santo Amaro', address: 'Rua do Comércio, Santo Amaro, Bahia', price: 320000, bedrooms: 0, bathrooms: 1, area: 120, images: ['https://picsum.photos/seed/prop36a/800/600', 'https://picsum.photos/seed/prop36b/800/600'], description: 'Loja comercial em rua movimentada de Santo Amaro, ideal para diversos tipos de negócio.', status: PropertyStatus.Updated, videos: ['https://www.youtube.com/embed/U32Z7gUXa-c'], lat: -12.547, lng: -38.713 },
  { id: 37, title: 'Casa com vista para a ponte em São Félix', address: 'Av. Beira Rio, São Félix, Bahia', price: 380000, bedrooms: 3, bathrooms: 2, area: 150, images: ['https://picsum.photos/seed/prop37a/800/600', 'https://picsum.photos/seed/prop37b/800/600'], description: 'Casa com varanda e vista para a histórica ponte que liga São Félix a Cachoeira. Um cenário inspirador para o seu dia a dia.', lat: -12.610, lng: -38.972 },
  { id: 38, title: 'Fábrica de charutos desativada em São Félix', address: 'Centro, São Félix, Bahia', price: 1100000, bedrooms: 10, bathrooms: 5, area: 2000, images: ['https://picsum.photos/seed/prop38a/800/600', 'https://picsum.photos/seed/prop38b/800/600'], description: 'Prédio histórico de uma antiga fábrica de charutos, com enorme potencial para se tornar um centro cultural, hotel ou condomínio.', status: PropertyStatus.New, lat: -12.613, lng: -38.974 },
  { id: 39, title: 'Terreno em São Félix', address: 'Zona de Expansão, São Félix, Bahia', price: 120000, bedrooms: 0, bathrooms: 0, area: 1000, images: ['https://picsum.photos/seed/prop39a/800/600', 'https://picsum.photos/seed/prop39b/800/600'], description: 'Terreno plano e pronto para construir na área de expansão de São Félix.', lat: -12.618, lng: -38.980 },
  { id: 40, title: 'Casa simples em São Félix', address: 'Rua da Ladeira, São Félix, Bahia', price: 95000, bedrooms: 2, bathrooms: 1, area: 80, images: ['https://picsum.photos/seed/prop40a/800/600', 'https://picsum.photos/seed/prop40b/800/600'], description: 'Casa pequena e funcional, uma ótima opção de moradia com baixo custo em São Félix.', videos: ['https://www.youtube.com/embed/y9peY2_Yy_I'], lat: -12.611, lng: -38.978 },
  { id: 41, title: 'Chácara perto de São Félix', address: 'Estrada Velha, São Félix, Bahia', price: 600000, bedrooms: 3, bathrooms: 3, area: 8000, images: ['https://picsum.photos/seed/prop41a/800/600', 'https://picsum.photos/seed/prop41b/800/600'], description: 'Chácara agradável com casa, piscina e árvores frutíferas, ideal para moradia ou lazer de fim de semana.', status: PropertyStatus.Updated, lat: -12.625, lng: -38.985 },
  { id: 42, title: 'Casa de pescador em Maragogipe', address: 'Porto do Caijá, Maragogipe, Bahia', price: 150000, bedrooms: 2, bathrooms: 1, area: 90, images: ['https://picsum.photos/seed/prop42a/800/600', 'https://picsum.photos/seed/prop42b/800/600'], description: 'Casa tradicional de pescador, com vista para o estuário do Rio Paraguaçu, em Maragogipe.', lat: -12.775, lng: -38.921 },
  { id: 43, title: 'Estaleiro em Maragogipe', address: 'Av. Marítima, Maragogipe, Bahia', price: 1800000, bedrooms: 2, bathrooms: 2, area: 3000, images: ['https://picsum.photos/seed/prop43a/800/600', 'https://picsum.photos/seed/prop43b/800/600'], description: 'Estaleiro para construção e reparo de saveiros e outras embarcações, uma atividade tradicional e importante na região.', lat: -12.778, lng: -38.918 },
  { id: 44, title: 'Casa com 3 quartos em Maragogipe', address: 'Centro, Maragogipe, Bahia', price: 280000, bedrooms: 3, bathrooms: 2, area: 130, images: ['https://picsum.photos/seed/prop44a/800/600', 'https://picsum.photos/seed/prop44b/800/600'], description: 'Casa espaçosa no centro de Maragogipe, perto do comércio e do porto.', status: PropertyStatus.New, videos: ['https://www.youtube.com/embed/z2w7-I0W_0g'], lat: -12.772, lng: -38.925 },
  { id: 45, title: 'Sítio produtivo em Maragogipe', address: 'Zona Rural, Maragogipe, Bahia', price: 750000, bedrooms: 3, bathrooms: 2, area: 40000, images: ['https://picsum.photos/seed/prop45a/800/600', 'https://picsum.photos/seed/prop45b/800/600'], description: 'Sítio com plantações de dendê e outras culturas, uma oportunidade de negócio no campo.', lat: -12.790, lng: -38.940 },
  { id: 46, title: 'Casa de veraneio em São Roque do Paraguaçu', address: 'São Roque do Paraguaçu, Maragogipe, Bahia', price: 350000, bedrooms: 2, bathrooms: 2, area: 180, images: ['https://picsum.photos/seed/prop46a/800/600', 'https://picsum.photos/seed/prop46b/800/600'], description: 'Casa de veraneio na tranquila vila de São Roque, ideal para descanso e contato com a natureza.', status: PropertyStatus.Updated, lat: -12.871, lng: -38.868 },
  { id: 47, title: 'Casa no centro de Nazaré das Farinhas', address: 'Praça da Matriz, Nazaré, Bahia', price: 420000, bedrooms: 3, bathrooms: 2, area: 200, images: ['https://picsum.photos/seed/prop47a/800/600', 'https://picsum.photos/seed/prop47b/800/600'], description: 'Casa bem localizada no centro de Nazaré, famosa pela sua Feira dos Caxixis.', lat: -13.034, lng: -39.014 },
  { id: 48, title: 'Apartamento em Nazaré', address: 'Rua do Fogo, Nazaré, Bahia', price: 180000, bedrooms: 2, bathrooms: 1, area: 65, images: ['https://picsum.photos/seed/prop48a/800/600', 'https://picsum.photos/seed/prop48b/800/600'], description: 'Apartamento simples e funcional em Nazaré das Farinhas.', videos: ['https://www.youtube.com/embed/U32Z7gUXa-c'], lat: -13.030, lng: -39.018 },
  { id: 49, title: 'Sítio com pomar em Nazaré', address: 'Estrada de Jaguaripe, Nazaré, Bahia', price: 680000, bedrooms: 2, bathrooms: 2, area: 15000, images: ['https://picsum.photos/seed/prop49a/800/600', 'https://picsum.photos/seed/prop49b/800/600'], description: 'Sítio com vasto pomar de frutas diversas, casa sede e muita área verde.', status: PropertyStatus.New, lat: -13.050, lng: -39.030 },
  { id: 50, title: 'Ponto comercial na feira de Nazaré', address: 'Largo da Feira, Nazaré, Bahia', price: 250000, bedrooms: 0, bathrooms: 1, area: 80, images: ['https://picsum.photos/seed/prop50a/800/600', 'https://picsum.photos/seed/prop50b/800/600'], description: 'Ponto comercial em localização estratégica, no largo da feira de Nazaré.', lat: -13.036, lng: -39.011 },
  { id: 51, title: 'Casa para reformar em Nazaré', address: 'Rua da Lapa, Nazaré, Bahia', price: 80000, bedrooms: 2, bathrooms: 1, area: 100, images: ['https://picsum.photos/seed/prop51a/800/600', 'https://picsum.photos/seed/prop51b/800/600'], description: 'Casa com bom potencial para reforma, em rua tranquila de Nazaré.', lat: -13.032, lng: -39.016 },
  { id: 52, title: 'Apartamento no centro de Santo Antônio de Jesus', address: 'Praça Padre Mateus, SAJ, Bahia', price: 350000, bedrooms: 3, bathrooms: 2, area: 100, images: ['https://picsum.photos/seed/prop52a/800/600', 'https://picsum.photos/seed/prop52b/800/600'], description: 'Apartamento no coração de Santo Antônio de Jesus, o polo comercial do Recôncavo.', status: PropertyStatus.Updated, videos: ['https://www.youtube.com/embed/y9peY2_Yy_I'], lat: -12.968, lng: -39.261 },
  { id: 53, title: 'Galpão comercial na BR-101', address: 'Rod. BR-101, Santo Antônio de Jesus, Bahia', price: 1500000, bedrooms: 0, bathrooms: 2, area: 2000, images: ['https://picsum.photos/seed/prop53a/800/600', 'https://picsum.photos/seed/prop53b/800/600'], description: 'Galpão logístico às margens da BR-101, com fácil acesso para caminhões. Ideal para distribuidoras e indústrias.', lat: -12.975, lng: -39.270 },
  { id: 54, title: 'Casa em condomínio em SAJ', address: 'Rua do Cajueiro, Santo Antônio de Jesus, Bahia', price: 550000, bedrooms: 3, bathrooms: 3, area: 180, images: ['https://picsum.photos/seed/prop54a/800/600', 'https://picsum.photos/seed/prop54b/800/600'], description: 'Casa moderna em condomínio fechado com infraestrutura de lazer em Santo Antônio de Jesus.', lat: -12.960, lng: -39.255 },
  { id: 55, title: 'Terreno para loteamento em SAJ', address: 'Zona de Expansão Urbana, SAJ, Bahia', price: 2200000, bedrooms: 0, bathrooms: 0, area: 30000, images: ['https://picsum.photos/seed/prop55a/800/600', 'https://picsum.photos/seed/prop55b/800/600'], description: 'Grande área para desenvolvimento de loteamento residencial na zona de expansão de SAJ.', status: PropertyStatus.New, lat: -12.980, lng: -39.250 },
  { id: 56, title: 'Apartamento de 2 quartos em SAJ', address: 'Rua Sete de Setembro, Santo Antônio de Jesus, Bahia', price: 210000, bedrooms: 2, bathrooms: 1, area: 60, images: ['https://picsum.photos/seed/prop56a/800/600', 'https://picsum.photos/seed/prop56b/800/600'], description: 'Apartamento bem localizado em SAJ, próximo ao centro comercial.', videos: ['https://www.youtube.com/embed/z2w7-I0W_0g'], lat: -12.965, lng: -39.263 },
];

interface PropertyListingsProps {
  onViewDetails: (id: number) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}

const PropertyListings: React.FC<PropertyListingsProps> = ({ onViewDetails, favorites, onToggleFavorite }) => {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-brand-navy text-center mb-4">{t('listings.title')}</h2>
        <p className="text-lg text-brand-gray text-center max-w-2xl mx-auto mb-12">
          {t('listings.description')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_PROPERTIES.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              onViewDetails={onViewDetails}
              isFavorite={favorites.includes(property.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyListings;
