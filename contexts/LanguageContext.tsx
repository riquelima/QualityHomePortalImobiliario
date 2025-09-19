

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Translations are embedded directly to avoid module resolution issues.
const ptTranslations = {
  "header": {
    "nav": {
      "owners": "Proprietários",
      "search": "Buscar imóveis"
    },
    "publishAd": "Publique seu anúncio",
    "access": "Acessar",
    "openMenu": "Abrir menu",
    "closeMenu": "Fechar menu",
    "menuTitle": "Menu",
    "logout": "Sair",
    "myAccount": "Minha conta",
    "ads": "Anúncios",
    "savedSearches": "Pesquisas salvas",
    "favorites": "Favoritos",
    "chat": "Chat",
    "ownersDropdown": {
      "sell": {
        "title": "Vender",
        "publish": "Publicar seu anúncio",
        "guide": "Guia para vender",
        "documents": "Documentos necessários para a venda"
      },
      "rent": {
        "title": "Alugar",
        "publish": "Publicar seu anúncio"
      },
      "forYourHome": {
        "title": "Serviços",
        "ownerArea": "Área do cliente"
      }
    },
    "searchDropdown": {
      "buy": {
        "title": "Buscar para comprar",
        "explore": "Explorar bairros e preços"
      },
      "rent": {
        "title": "Buscar para alugar",
        "explore": "Explorar bairros e preços"
      }
    }
  },
  "hero": {
    "defaultTitle": "Descubra seu novo lar, hoje.",
    "geminiPrompt": "Crie uma frase de efeito muito curta para um portal imobiliário, com no máximo 7 palavras. Deve ser convidativa e direta. A resposta DEVE ser em português do Brasil. Exemplos de frases que gosto: 'Encontre seu imóvel aqui', 'Tudo começa hoje', 'Bem vindo a Quallity Home Portal Imobiliário', 'Que tal uma nova casa?', 'Alugue sem burocracia', 'Vamos agendar uma visita?'. Gere uma nova frase nesse estilo. Não use aspas na resposta.",
    "tabs": {
      "buy": "Comprar",
      "rent": "Alugar",
      "season": "Temporada"
    },
    "propertyTypes": {
      "housesAndApts": "Casas e apartamentos",
      "offices": "Escritórios",
      "garages": "Garagens"
    },
    "locationPlaceholder": "Digite a localização (bairro, cidade, região)",
    "drawOnMap": "Desenhe sua área",
    "searchNearMe": "Pesquisar perto de você",
    "loadingLocation": "Obtendo localização...",
    "searchButton": "Buscar",
    "geolocationNotSupported": "A geolocalização não é suportada por este navegador.",
    "geolocationError": "Não foi possível obter a sua localização. Por favor, verifique as permissões do seu navegador."
  },
  "listings": {
    "title": "Imóveis em Destaque",
    "description": "Explore nossa seleção exclusiva de imóveis que combinam luxo, conforto e localização privilegiada."
  },
  "propertyCard": {
    "bedrooms": "Quartos",
    "bathrooms": "Ban.",
    "details": "Detalhes",
    "contact": "Contato",
    "addToFavorites": "Adicionar aos favoritos",
    "removeFromFavorites": "Remover dos favoritos"
  },
  "infoSection": {
    "draw": {
      "title": "Desenhe a sua área de busca",
      "description": "Escolha exatamente a área que você procura no mapa.",
      "link": "Desenhar sua área de busca"
    },
    "publish": {
      "title": "Publique seu imóvel grátis",
      "description": "Os seus 2 primeiros anúncios são grátis. Casas, quartos, escritórios...",
      "link": "Publicar um anúncio grátis"
    }
  },
  "map": {
    "loading": "Carregando mapa...",
    "breadcrumbs": {
      "home": "Início",
      "proximitySearch": "Pesquisa por Proximidade",
      "drawOnMap": "Desenhar no mapa"
    },
    "title": {
      "proximity": "Imóveis perto de você",
      "draw": "Desenhe a sua pesquisa em Salvador"
    },
    "drawInstruction": "Mova o mapa para localizar a área de interesse antes de desenhar a zona que procura",
    "drawInstructionNew": "Use as ferramentas de desenho no canto superior esquerdo para selecionar sua área.",
    "drawButton": "Desenhar sua área",
    "clearButton": "Limpar Desenho",
    "drawingInProgress": "Desenhando...",
    "userLocationPopup": "Sua localização",
    "toggleResults": {
      "show": "Ver {count} Imóveis",
      "hide": "Ocultar Resultados"
    },
    "resultsPanel": {
      "title": "{count} imóveis encontrados",
      "proximityTitle": "{count} imóveis encontrados num raio de {radius}km",
      "noResults": {
        "line1": "Nenhum imóvel encontrado nesta área.",
        "line2": "Tente desenhar uma área maior ou em outra localização."
      }
    }
  },
  "publishAdPage": {
    "breadcrumbHome": "Início",
    "breadcrumbPublish": "Como publicar um anúncio",
    "mainCard": {
      "title": "Como publicar um anúncio na Quality Home",
      "benefit1": "Seus 2 primeiros anúncios são grátis. Para quartos, você pode publicar até 5 anúncios gratuitos.",
      "benefit2": "Você tem acesso a uma área privada onde pode gerenciar seu anúncio e os contatos que recebe.",
      "benefit3": "Você pode tirar dúvidas, trocar informações e organizar visitas de forma eficiente através do nosso chat.",
      "agencyInfo": "Para vender ou alugar mais rápido, contate uma agência imobiliária.",
      "publishButton": "Publique seu anúncio grátis",
      "professionalInfo": "Você é um profissional do mercado imobiliário? Conheça nossas vantagens para profissionais."
    },
    "steps": {
      "title": "Quais são os passos para publicar seu anúncio?",
      "intro": "Existem 4 pontos essenciais para vender ou alugar seu imóvel o mais rápido possível:",
      "step1Title": "1. Adicione as melhores fotos que você tiver e, se possível, a planta do imóvel",
      "step1Content": "• Certifique-se de que tem fotos de qualidade à mão quando publicar seu anúncio. Se não as tiver, poderá adicionar mais tarde, mas lembre-se, sem fotos, você não terá resultados.\n• A foto principal é essencial. Será a capa do seu anúncio, a única que será enviada por e-mail aos interessados e a que vai aparecer na lista de resultados.\n• Organize suas fotos de forma lógica para criar uma história atrativa e opte por imagens horizontais que ficam muito bem.\n• Incluir uma planta, mesmo que desenhada à mão, oferece informações úteis para que os interessados visualizem a distribuição dos cômodos e como seria viver ali.",
      "step2Title": "2. Informe o endereço exato",
      "step2Content": "Para que as pessoas que procuram na região encontrem seu anúncio, é muito importante informar o endereço correto do imóvel. Se, por algum motivo, você não queira informá-lo, você tem a opção de ocultar o endereço por R$ 9,90.",
      "step3Title": "3. Defina um preço de acordo com o valor de mercado",
      "step3Content": "Em caso de dúvida, você pode fazer uma avaliação gratuita do seu imóvel em nosso site ou verificar o preço médio na região.",
      "step4Title": "4. Descreva as características e os detalhes do seu imóvel",
      "step4Content": "Inclua informações sobre seu imóvel, como o número de quartos, m², banheiros, etc. Mencione também as comodidades adicionais, como a presença de elevador, terraço, vaga de garagem, etc. Afinal, todos estes detalhes valorizam seu imóvel. Destaque as características especiais, principalmente as que aparecem nas fotos. Não se esqueça de mencionar os serviços próximos, os transportes disponíveis e os pontos de interesse na região."
    },
    "advantages": {
      "title": "Vantagens de publicar na Quality Home",
      "advantage1Title": "Garantia de visibilidade",
      "advantage1Content": "Os anúncios publicados em nosso site são visitados por milhões de usuários, o que lhe dá a oportunidade de vender ou alugar seu imóvel de forma mais rápida e eficaz.",
      "advantage2Title": "A melhor experiência",
      "advantage2Content": "O aplicativo da Quality Home tem múltiplas funcionalidades que ajudarão você a gerenciar sua publicação e, para quem procura um imóvel, permite configurar alertas personalizados para receber novos imóveis imediatamente.",
      "advantage3Title": "Grande variedade de produtos para o seu anúncio",
      "advantage3Content": "Disponibilizamos uma vasta gama de ferramentas para melhorar a posição do seu anúncio e ganhar visibilidade."
    }
  },
  "loginModal": {
    "title": "Faça login ou cadastre-se para publicar seu anúncio",
    "description": "Publique seu anúncio para que seja visto por milhões de pessoas que procuram o seu próximo imóvel.",
    "emailLabel": "Seu e-mail",
    "continueButton": "Continuar",
    "socialLoginPrompt": "Você também pode",
    "googleButton": "Continuar com Google",
    "appleButton": "Continuar com Apple"
  },
  "publishJourney": {
    "stepper": {
      "step1": "1. Dados básicos",
      "step2": "2. Detalhes",
      "step3": "3. Fotos"
    },
    "title": "Publicar seu anúncio particular",
    "editTitle": "Editar seu anúncio",
    "adPublishedSuccess": "Anúncio publicado com sucesso!",
    "form": {
      "propertyType": {
        "label": "Escolha o tipo de imóvel"
      },
      "operation": {
        "label": "Operação"
      },
      "location": {
        "label": "Localização do imóvel",
        "city": "Cidade / Bairro",
        "street": "Rua",
        "number": "Número"
      },
      "submitButton": "Verificar endereço"
    },
    "verifiedAddress": {
      "label": "Localização do imóvel",
      "edit": "Editar"
    },
    "contactDetails": {
      "title": "Seus dados de contato",
      "emailLabel": "Seu e-mail",
      "emailDescription": "Nunca será exibido no anúncio, apenas em alertas e notificações.",
      "changeAccount": "Entrar com outra conta",
      "phoneLabel": "Seu telefone",
      "phonePlaceholder": "Seu número com DDD",
      "addPhone": "Adicionar outro telefone",
      "nameLabel": "Seu nome",
      "nameDescription": "Será visível no anúncio e quando você enviar mensagens para outros usuários.",
      "preferenceLabel": "Como prefere ser contatado?",
      "prefChatAndPhone": "Telefone e mensagens no nosso chat (recomendado)",
      "prefChatAndPhoneDesc": "Você receberá um aviso das mensagens por e-mail e notificações em nosso aplicativo",
      "prefChatOnly": "Apenas por mensagens de chat",
      "prefChatOnlyDesc": "Você receberá um aviso das mensagens por e-mail e notificações em nosso aplicativo",
      "prefPhoneOnly": "Apenas por telefone",
      "continueButton": "Continuar para os detalhes do imóvel",
      "nextStepInfo": "No próximo passo, você poderá inserir as características e o preço."
    },
    "detailsForm": {
      "title": "Aproveite, este anúncio é grátis ;-)",
      "adTitle": "Título do anúncio",
      "adTitlePlaceholder": "Ex: Apartamento incrível com vista para o mar na Barra",
      "apartmentCharacteristics": "Características do imóvel",
      "propertyType": "Tipo de imóvel (opcional)",
      "apartment": "Apartamento",
      "house": "Casa",
      "room": "Quarto",
      "office": "Escritório",
      "land": "Terreno",
      "condition": "Condição",
      "forRenovation": "Precisa de reforma",
      "goodCondition": "Bom estado",
      "grossArea": "m² área bruta",
      "netArea": "m² área útil (opcional)",
      "bedrooms": "Número de quartos",
      "bathrooms": "Número de banheiros",
      "hasElevator": "Possui elevador?",
      "yes": "Sim",
      "no": "Não",
      "otherHomeFeatures": "Outras características do seu imóvel",
      "builtInWardrobes": "Armários embutidos",
      "airConditioning": "Ar condicionado",
      "terrace": "Terraço",
      "balcony": "Varanda",
      "garage": "Vaga de garagem/Box",
      "mobiliado": "Mobiliado",
      "cozinhaEquipada": "Cozinha equipada",
      "suite": "Suíte",
      "escritorio": "Escritório",
      "otherBuildingFeatures": "Outras características do condomínio",
      "pool": "Piscina",
      "greenArea": "Área verde",
      "portaria24h": "Portaria 24h",
      "academia": "Academia",
      "salaoDeFestas": "Salão de festas",
      "churrasqueira": "Churrasqueira",
      "parqueInfantil": "Parque infantil",
      "quadraEsportiva": "Quadra esportiva",
      "sauna": "Sauna",
      "espacoGourmet": "Espaço gourmet",
      "showMoreDetails": "Mostrar mais detalhes",
      "propertyPrice": "Preço do imóvel",
      "price": "Preço",
      "condoFee": "Valor do condomínio (opcional)",
      "currency": {
        "price": "reais",
        "fee": "reais/mês"
      },
      "saleSituation": "Situação de ocupação do imóvel",
      "rentedWithTenants": "Alugado (com inquilinos)",
      "withoutTenants": "Desocupado (sem inquilinos)",
      "adDescription": "Descrição do anúncio",
      "descriptionPlaceholder": "Escreva aqui a descrição do anúncio. Mais tarde, você poderá adicionar outros idiomas.",
      "continueToPhotosButton": "Continuar para fotos"
    },
    "photosForm": {
      "title": "Adicione fotos, plantas e vídeos ao seu anúncio",
      "dragAndDrop": "Arraste e solte suas fotos aqui ou selecione do seu dispositivo",
      "addButton": "Adicionar fotos e vídeos",
      "limitsInfo": "Selecione até 30 fotos e 10 plantas (máx. 32MB cada) e 6 vídeos (máx. 600MB cada) da sua galeria.",
      "rememberTitle": "Lembre-se...",
      "tip1": "Fotos, plantas e vídeos atraem mais pessoas para o seu anúncio",
      "tip2": "Se você tiver a planta do imóvel, pode tirar uma foto dela ou desenhá-la à mão e fotografar o desenho",
      "tip3": "Ao tirar suas fotos, certifique-se de que cada cômodo esteja arrumado, limpo e bem iluminado",
      "backButton": "Voltar",
      "continueButton": "Continuar sem fotos",
      "publishButton": "Publicar Anúncio",
      "updateButton": "Atualizar Anúncio",
      "publishingButton": "Publicando...",
      "updatingButton": "Atualizando...",
      "removeFile": "Remover arquivo"
    },
    "sidebar": {
      "title": "Informação útil",
      "p1": "Prepare as fotos. Se ainda não as tem, poderá adicioná-las mais tarde. Sem fotos, seu anúncio não terá bons resultados.",
      "p2": "Oferecemos os dois primeiros anúncios grátis para que você experimente nosso serviço. Anuncie apartamentos, casas, terrenos ou espaços comerciais gratuitamente.",
      "p3": "Além disso, você pode publicar até 5 quartos para alugar gratuitamente, que não entram na conta do limite de anúncios.",
      "p4": "Para garantir a qualidade dos nossos serviços, uma taxa será cobrada nos seguintes casos:",
      "case1": "anunciantes com mais de dois imóveis",
      "case2": "anunciantes de imóveis duplicados",
      "case3": "imóveis à venda por mais de R$ 5.000.000",
      "case4": "imóveis para aluguel por mais de R$ 10.000/mês",
      "quickSell": {
        "title": "Quer vender seu imóvel rapidamente?",
        "link": "Encontre a imobiliária mais adequada para você"
      },
      "professional": {
        "title": "Você é um profissional do mercado imobiliário?",
        "link": "Conheça as vantagens que oferecemos para profissionais"
      }
    },
    "locationConfirmationModal": {
      "title": "A localização está correta?",
      "subtitle": "Se não estiver bem localizado, você pode arrastar o marcador para a posição correta.",
      "countryInfo": "Brasil",
      "confirmButton": "Confirmar endereço",
      "backButton": "Digitar o endereço novamente"
    },
    "locationPermissionModal": {
      "title": "Melhorar sugestões de cidade?",
      "message": "Para oferecer sugestões mais relevantes para sua região, podemos usar sua localização. Seus dados exatos nunca são salvos ou compartilhados."
    }
  },
  "geolocationErrorModal": {
    "title": "Erro de Localização",
    "description": "Não foi possível obter a sua localização. Isto pode acontecer se você negou o pedido de permissão ou se o seu navegador não suporta geolocalização. Por favor, verifique as permissões de site do seu navegador e tente novamente.",
    "closeButton": "OK"
  },
  "searchResults": {
    "breadcrumb": "Resultados da busca",
    "title": "Imóveis para \"{query}\"",
    "subtitle": "{count} imóveis encontrados",
    "noResults": {
      "title": "Nenhum resultado encontrado",
      "description": "Tente ajustar seus termos de busca ou pesquisar por uma localização diferente."
    }
  },
  "propertyDetail": {
    "breadcrumb": "Detalhes do Imóvel",
    "gallery": "Galeria de Fotos",
    "description": "Descrição",
    "details": "Detalhes do Imóvel",
    "videos": "Galeria de Vídeos",
    "scheduleVisit": "Agendar Visita",
    "addToFavorites": "Adicionar aos Favoritos",
    "removeFromFavorites": "Remover dos Favoritos",
    "generalDetails": "Detalhes Gerais",
    "propertyFeatures": "Características do Imóvel",
    "condoAmenities": "Comodidades do Condomínio",
    "propertyType": "Tipo de imóvel",
    "occupationStatus": "Situação",
    "hasElevator": "Elevador",
    "yes": "Sim",
    "no": "Não",
    "condoFee": "Condomínio"
  },
  "favoritesPage": {
    "title": "Meus Imóveis Favoritos",
    "breadcrumb": "Favoritos",
    "noFavorites": {
      "title": "Você ainda não tem imóveis favoritos",
      "description": "Clique no coração nos anúncios para salvar os imóveis que você mais gosta aqui."
    }
  },
  "contactModal": {
    "title": "Contato do Anunciante",
    "contactPerson": "Falar com",
    "phone": "Telefone",
    "whatsappButton": "Conversar no WhatsApp",
    "chatButton": "Conversar pelo chat",
    "whatsappMessage": "Olá, vi este imóvel no Quality Home Portal e gostaria de mais informações. Título do anúncio: {title}"
  },
  "chatList": {
    "title": "Minhas Conversas",
    "breadcrumb": "Chat",
    "noChats": {
      "title": "Você ainda não tem conversas",
      "description": "Inicie uma conversa a partir da página de detalhes de um imóvel."
    }
  },
  "chatPage": {
    "title": "Conversa sobre: {title}",
    "messagePlaceholder": "Digite sua mensagem...",
    "sendButton": "Enviar"
  },
  "myAdsPage": {
    "title": "Meus Anúncios",
    "breadcrumb": "Meus Anúncios",
    "noAds": {
      "title": "Você ainda não publicou nenhum anúncio",
      "description": "Comece agora e alcance milhares de pessoas interessadas no seu imóvel."
    },
    "newAdButton": "Publicar Novo Anúncio",
    "viewButton": "Visualizar",
    "editButton": "Editar",
    "deleteButton": "Excluir",
    "deleteConfirm": "Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.",
    "adDeletedSuccess": "Anúncio excluído com sucesso.",
    "adDeletedError": "Erro ao excluir o anúncio.",
    "inactiveStatus": "Inativo"
  },
  "confirmationModal": {
    "title": "Sucesso!",
    "message": "Seu anúncio foi publicado com sucesso e já está visível no portal.",
    "closeButton": "Entendido"
  },
  "systemModal": {
    "successTitle": "Sucesso!",
    "errorTitle": "Ocorreu um Erro",
    "confirmTitle": "Você tem certeza?",
    "okButton": "Entendido",
    "confirmButton": "Confirmar",
    "cancelButton": "Cancelar",
    "fetchError": "Não foi possível carregar os anúncios. Por favor, tente recarregar a página.",
    "editSuccessMessage": "Anúncio atualizado com sucesso!",
    "errorDetails": "Detalhes do erro"
  },
  "footer": {
    "text": "Quality Home Portal Imobiliário. Todos os direitos reservados."
  }
};
const enTranslations = {
  "header": {
    "nav": {
      "owners": "Owners",
      "search": "Search properties"
    },
    "publishAd": "Publish your ad",
    "access": "Access",
    "openMenu": "Open menu",
    "closeMenu": "Close menu",
    "menuTitle": "Menu",
    "logout": "Log out",
    "myAccount": "Go to your account",
    "ads": "Ads",
    "savedSearches": "Saved searches",
    "favorites": "Favorites",
    "chat": "Chat",
    "ownersDropdown": {
      "sell": {
        "title": "Sell",
        "publish": "Publish your ad",
        "evaluate": "Value your home",
        "guide": "Guide to selling",
        "documents": "Documents needed for sale",
        "findAgencies": "Find agencies to sell"
      },
      "rent": {
        "title": "Rent out",
        "publish": "Publish your ad",
        "findAgencies": "Find agencies to rent"
      },
      "forYourHome": {
        "title": "For your home",
        "ownerArea": "Owner's area",
        "transferCredit": "Transfer your mortgage to another bank",
        "calculateRemodel": "Calculate the price of a remodel"
      }
    },
    "searchDropdown": {
      "buy": {
        "title": "Looking to buy",
        "whatToBuy": "What house can you buy?",
        "credit": "Your mortgage step by step",
        "explore": "Explore neighborhoods and prices",
        "evaluate": "Value a house"
      },
      "rent": {
        "title": "Looking to rent",
        "explore": "Explore neighborhoods and prices"
      }
    }
  },
  "hero": {
    "defaultTitle": "Discover your new home, today.",
    "geminiPrompt": "Create a very short tagline for a real estate portal, with a maximum of 7 words. It should be inviting and direct. The response MUST be in English. Examples of phrases I like: 'Find your property here', 'It all starts today', 'Welcome to Quallity Home Real Estate Portal', 'How about a new house?', 'Rent without bureaucracy', 'Shall we schedule a visit?'. Generate a new phrase in this style. Do not use quotes in the response.",
    "tabs": {
      "buy": "Buy",
      "rent": "Rent",
      "season": "Season"
    },
    "propertyTypes": {
      "housesAndApts": "Houses and apartments",
      "offices": "Offices",
      "garages": "Garages"
    },
    "locationPlaceholder": "Enter location (neighborhood, city, region)",
    "drawOnMap": "Draw your zone",
    "searchNearMe": "Search near you",
    "loadingLocation": "Getting location...",
    "searchButton": "Search",
    "geolocationNotSupported": "Geolocation is not supported by this browser.",
    "geolocationError": "Could not get your location. Please check your browser permissions."
  },
  "listings": {
    "title": "Featured Properties",
    "description": "Explore our exclusive selection of properties that combine luxury, comfort, and prime location."
  },
  "propertyCard": {
    "bedrooms": "Beds",
    "bathrooms": "Baths",
    "details": "Details",
    "contact": "Contact",
    "addToFavorites": "Add to favorites",
    "removeFromFavorites": "Remove from favorites"
  },
  "infoSection": {
    "draw": {
      "title": "Draw your search area",
      "description": "Choose exactly the area you are looking for on the map.",
      "link": "Draw your search area"
    },
    "publish": {
      "title": "Publish your property for free",
      "description": "Your first 2 ads are free. Houses, rooms, offices...",
      "link": "Publish a free ad"
    }
  },
  "map": {
    "loading": "Loading map...",
    "breadcrumbs": {
      "home": "Home",
      "proximitySearch": "Proximity Search",
      "drawOnMap": "Draw on Map"
    },
    "title": {
      "proximity": "Properties near you",
      "draw": "Draw your search in Salvador"
    },
    "drawInstruction": "Move the map to locate the area of interest before drawing the zone you're looking for",
    "drawInstructionNew": "Use the drawing tools in the top-left corner to select your area.",
    "drawButton": "Draw your area",
    "clearButton": "Clear Drawing",
    "drawingInProgress": "Drawing...",
    "userLocationPopup": "Your location",
    "toggleResults": {
      "show": "View {count} Properties",
      "hide": "Hide Results"
    },
    "resultsPanel": {
      "title": "{count} properties found",
      "proximityTitle": "{count} properties found within a {radius}km radius",
      "noResults": {
        "line1": "No properties found in this area.",
        "line2": "Try drawing a larger area or in another location."
      }
    }
  },
  "publishAdPage": {
    "breadcrumbHome": "Home",
    "breadcrumbPublish": "How to post an ad",
    "mainCard": {
      "title": "How to post an ad on Quallity Home",
      "benefit1": "Your first 2 ads are free. If they are rooms, you can publish up to 5 free ads.",
      "benefit2": "You have access to a private area where you can manage your ad and the contacts you receive.",
      "benefit3": "You can resolve questions, exchange information, and organize visits efficiently through our chat.",
      "agencyInfo": "To sell or rent faster, contact a real estate agency.",
      "publishButton": "Publish your ad for free",
      "professionalInfo": "Are you a real estate professional? Discover our advantages for professionals."
    },
    "steps": {
      "title": "What are the steps to publish your ad as a private owner?",
      "intro": "There are 4 essential points to sell or rent your property as quickly as possible:",
      "step1Title": "1. Insert the best photos you have and, if possible, a floor plan showing the layout of the rooms",
      "step1Content": "• Make sure you have quality photos on hand when you publish your ad. If you don't have them, you can add them later, but remember, you won't get results without photos.\n• The main photo is essential. It will be the cover of your ad, the only one sent by email to interested parties, and what will appear in the results list.\n• Arrange your photos logically to create an attractive story and opt for horizontal images that look great.\n• Including a hand-drawn floor plan, even if not detailed, provides useful information for interested parties to visualize the distribution of rooms and what it would be like to live there.",
      "step2Title": "2. Indicate the exact address",
      "step2Content": "For people searching in the area to know your ad, it is very important to indicate the correct address of the property. If, for some reason, you do not want to indicate it, you have the option to hide the address for €9.90.",
      "step3Title": "3. Set a price according to the market value",
      "step3Content": "If in doubt, you can get a free valuation of your property on our site or check the average price in that area.",
      "step4Title": "4. Indicate the characteristics of your property and describe your house in detail",
      "step4Content": "Include information about your property, such as the number of bedrooms, m2, bathrooms, etc. Also mention additional amenities, such as the presence of an elevator, a terrace, a parking space, a storage room, etc. After all, all these details add value to your property. Highlight the special features of your property, especially those that appear in the photographs. Don't forget to explain nearby services, available transportation, and places of interest in the area."
    },
    "advantages": {
      "title": "Advantages of publishing on Quallity Home",
      "advantage1Title": "Guaranteed visibility",
      "advantage1Content": "The ads published on our site are visited by millions of users, which gives you the opportunity to sell or rent your property more quickly and effectively.",
      "advantage2Title": "The best experience",
      "advantage2Content": "The Quallity Home APP has multiple functionalities that will help you manage your publication and for those looking for a property, it allows you to configure fully personalized alerts to immediately receive new properties.",
      "advantage3Title": "Wide variety of products for your ad",
      "advantage3Content": "We have a wide range of tools to improve the position of your ad and gain visibility."
    }
  },
  "loginModal": {
    "title": "Log in or sign up to publish your ad",
    "description": "Publish your ad to be seen by millions of people looking for their next property.",
    "emailLabel": "Your email",
    "continueButton": "Continue",
    "socialLoginPrompt": "You can also",
    "googleButton": "Continue with Google",
    "appleButton": "Continue with Apple"
  },
  "publishJourney": {
    "stepper": {
      "step1": "1. Basic data",
      "step2": "2. Details",
      "step3": "3. Photos"
    },
    "title": "Publish your private ad",
    "editTitle": "Edit your ad",
    "adPublishedSuccess": "Ad published successfully!",
    "form": {
      "propertyType": {
        "label": "Choose the property type"
      },
      "operation": {
        "label": "Operation"
      },
      "location": {
        "label": "Property location",
        "city": "City",
        "street": "Street",
        "number": "Street number"
      },
      "submitButton": "Verify address"
    },
    "verifiedAddress": {
      "label": "Property location",
      "edit": "Edit"
    },
    "contactDetails": {
      "title": "Your contact details",
      "emailLabel": "Your email",
      "emailDescription": "It will never be visible in the ad, only in alerts and notifications.",
      "changeAccount": "Sign in with another account",
      "phoneLabel": "Your phone",
      "phonePlaceholder": "Your number with area code",
      "addPhone": "Add additional phone",
      "nameLabel": "Your name",
      "nameDescription": "It will be visible in the ad and when you write to other users.",
      "preferenceLabel": "How do you prefer to be contacted?",
      "prefChatAndPhone": "Phone and messages in our chat (recommended)",
      "prefChatAndPhoneDesc": "You will receive a notification of messages by e-mail and in our app",
      "prefChatOnly": "Only by chat messages",
      "prefChatOnlyDesc": "You will receive a notification of messages by e-mail and in our app",
      "prefPhoneOnly": "Only by phone",
      "continueButton": "Continue to property details",
      "nextStepInfo": "In the next step you can enter the characteristics and the price."
    },
     "detailsForm": {
      "title": "Take advantage, this ad is free ;-)",
      "adTitle": "Ad Title",
      "adTitlePlaceholder": "e.g., Amazing apartment with sea view in Barra",
      "apartmentCharacteristics": "Property characteristics",
      "propertyType": "Type of property (optional)",
      "apartment": "Apartment",
      "house": "House",
      "room": "Room",
      "office": "Office",
      "land": "Land",
      "condition": "Condition",
      "forRenovation": "For renovation",
      "goodCondition": "Good condition",
      "grossArea": "m² gross area",
      "netArea": "m² net area (optional)",
      "bedrooms": "Number of bedrooms in the house",
      "bathrooms": "Number of full and service bathrooms",
      "hasElevator": "Has an elevator?",
      "yes": "Yes, it has",
      "no": "No, it doesn't",
      "otherHomeFeatures": "Other features of your home",
      "builtInWardrobes": "Built-in wardrobes",
      "airConditioning": "Air conditioning",
      "terrace": "Terrace",
      "balcony": "Balcony",
      "garage": "Garage space/Box",
      "mobiliado": "Furnished",
      "cozinhaEquipada": "Equipped Kitchen",
      "suite": "Suite",
      "escritorio": "Home Office",
      "otherBuildingFeatures": "Other features of your building",
      "pool": "Pool",
      "greenArea": "Green area",
      "portaria24h": "24h Concierge",
      "academia": "Gym",
      "salaoDeFestas": "Party Hall",
      "churrasqueira": "Barbecue Area",
      "parqueInfantil": "Playground",
      "quadraEsportiva": "Sports Court",
      "sauna": "Sauna",
      "espacoGourmet": "Gourmet Area",
      "showMoreDetails": "Indicate more details",
      "propertyPrice": "Property price",
      "price": "Price",
      "condoFee": "Condominium fees (optional)",
      "currency": {
        "price": "dollars",
        "fee": "dollars/month"
      },
      "saleSituation": "In what situation will the property be sold?",
      "rentedWithTenants": "Rented, with tenants",
      "withoutTenants": "Without tenants",
      "adDescription": "Ad description",
      "descriptionPlaceholder": "Write the description in English here. Later, you can add other languages.",
      "continueToPhotosButton": "Continue and import photos"
    },
    "photosForm": {
      "title": "Add photos, floor plans, and videos to your ad",
      "dragAndDrop": "Drag and drop your photos here or select them from your device",
      "addButton": "Add photos and videos",
      "limitsInfo": "Select up to 30 photos and 10 floor plans (max. 32 MB each) and 6 videos (max. 600 MB each) from your gallery.",
      "rememberTitle": "Remember that...",
      "tip1": "Photos, floor plans, and videos: attract more people to your ad",
      "tip2": "If you have a floor plan of the property, you can take a photo of it or draw it by hand and take a photograph of the drawing",
      "tip3": "When you take your photographs, make sure that each room is tidy, clean, and well-lit",
      "backButton": "Back",
      "continueButton": "Continue without photos",
      "publishButton": "Publish Ad",
      "updateButton": "Update Ad",
      "publishingButton": "Publishing...",
      "updatingButton": "Updating...",
      "removeFile": "Remove file"
    },
    "sidebar": {
      "title": "Useful information",
      "p1": "Prepare the photos. If you don't have them yet, you can add them later. You won't get results without photos.",
      "p2": "We offer you the first two ads for free so you can try our service. You can publish free ads for apartments, houses, land, commercial spaces, etc., until you sell or rent them.",
      "p3": "Additionally, you can publish up to 5 free rooms in properties for sharing, which do not count towards the number of ads we offer.",
      "p4": "To ensure the quality of our services, we charge a fee in the following cases:",
      "case1": "advertisers with more than two properties",
      "case2": "advertisers with duplicate properties",
      "case3": "properties for sale for more than 1,000,000 euros",
      "case4": "properties for rent for more than 2,500 €/month",
      "quickSell": {
        "title": "Want to sell your house quickly?",
        "link": "Find the most suitable real estate agency"
      },
      "professional": {
        "title": "Are you a real estate professional?",
        "link": "Learn about the advantages we offer for professionals"
      }
    },
    "locationConfirmationModal": {
      "title": "Is this the right place?",
      "subtitle": "If it's not well-located, you can drag the pin to the correct position.",
      "countryInfo": "Brazil",
      "confirmButton": "Confirm address",
      "backButton": "Go back to writing the address"
    },
    "locationPermissionModal": {
      "title": "Improve City Suggestions?",
      "message": "To provide more relevant suggestions for your region, we can use your location. Your exact location data is never saved or shared."
    }
  },
  "geolocationErrorModal": {
    "title": "Location Error",
    "description": "We could not get your location. This might happen if you denied the permission request or if your browser does not support geolocation. Please check your browser's site permissions and try again.",
    "closeButton": "OK"
  },
  "searchResults": {
    "breadcrumb": "Search Results",
    "title": "Properties for \"{query}\"",
    "subtitle": "{count} properties found",
    "noResults": {
      "title": "No results found",
      "description": "Try adjusting your search terms or searching for a different location."
    }
  },
  "propertyDetail": {
    "breadcrumb": "Property Details",
    "gallery": "Photo Gallery",
    "description": "Description",
    "details": "Property Details",
    "videos": "Video Gallery",
    "scheduleVisit": "Schedule Visit",
    "addToFavorites": "Add to Favorites",
    "removeFromFavorites": "Remove from Favorites",
    "generalDetails": "General Details",
    "propertyFeatures": "Property Features",
    "condoAmenities": "Condo Amenities",
    "propertyType": "Property type",
    "occupationStatus": "Status",
    "hasElevator": "Elevator",
    "yes": "Yes",
    "no": "No",
    "condoFee": "Condo Fee"
  },
  "favoritesPage": {
    "title": "My Favorite Properties",
    "breadcrumb": "Favorites",
    "noFavorites": {
      "title": "You have no favorite properties yet",
      "description": "Click the heart on the listings to save the properties you like best here."
    }
  },
  "contactModal": {
    "title": "Advertiser Contact",
    "contactPerson": "Contact",
    "phone": "Phone",
    "whatsappButton": "Chat on WhatsApp",
    "chatButton": "Chat via app",
    "whatsappMessage": "Hello, I saw this property on the Quality Home Portal and would like more information. Ad title: {title}"
  },
  "chatList": {
    "title": "My Chats",
    "breadcrumb": "Chat",
    "noChats": {
      "title": "You have no chats yet",
      "description": "Start a conversation from a property's detail page."
    }
  },
  "chatPage": {
    "title": "Chat about: {title}",
    "messagePlaceholder": "Type your message...",
    "sendButton": "Send"
  },
  "myAdsPage": {
    "title": "My Ads",
    "breadcrumb": "My Ads",
    "noAds": {
      "title": "You haven't published any ads yet",
      "description": "Get started now and reach thousands of people interested in your property."
    },
    "newAdButton": "Publish New Ad",
    "viewButton": "View",
    "editButton": "Edit",
    "deleteButton": "Delete",
    "deleteConfirm": "Are you sure you want to delete this ad? This action cannot be undone.",
    "adDeletedSuccess": "Ad deleted successfully!",
    "adDeletedError": "Error deleting ad.",
    "inactiveStatus": "Inactive"
  },
  "confirmationModal": {
    "title": "Success!",
    "message": "Your ad has been successfully published and is now visible on the portal.",
    "closeButton": "Got it"
  },
  "systemModal": {
    "successTitle": "Success!",
    "errorTitle": "An Error Occurred",
    "confirmTitle": "Are you sure?",
    "okButton": "Got it",
    "confirmButton": "Confirm",
    "cancelButton": "Cancel",
    "fetchError": "Could not load ads. Please try reloading the page.",
    "editSuccessMessage": "Ad updated successfully!",
    "errorDetails": "Error details"
  },
  "footer": {
    "text": "Quality Home Real Estate Portal. All rights reserved."
  }
};
const esTranslations = {
  "header": {
    "nav": {
      "owners": "Propietarios",
      "search": "Buscar inmuebles"
    },
    "publishAd": "Publica tu anuncio",
    "access": "Acceder",
    "openMenu": "Abrir menú",
    "closeMenu": "Cerrar menú",
    "menuTitle": "Menú",
    "logout": "Cerrar sesión",
    "myAccount": "Ir a tu cuenta",
    "ads": "Anuncios",
    "savedSearches": "Búsquedas guardadas",
    "favorites": "Favoritos",
    "chat": "Chat",
    "ownersDropdown": {
      "sell": {
        "title": "Vender",
        "publish": "Publica tu anuncio",
        "evaluate": "Valorar tu casa",
        "guide": "Guía para vender",
        "documents": "Documentos necesarios para la venta",
        "findAgencies": "Buscar agencias para vender"
      },
      "rent": {
        "title": "Poner en alquiler",
        "publish": "Publica tu anuncio",
        "findAgencies": "Buscar agencias para alquilar"
      },
      "forYourHome": {
        "title": "Para tu vivienda",
        "ownerArea": "Área de propietario",
        "transferCredit": "Transferir tu hipoteca a otro banco",
        "calculateRemodel": "Calcular el precio de una reforma"
      }
    },
    "searchDropdown": {
      "buy": {
        "title": "Buscar para comprar",
        "whatToBuy": "¿Qué casa puedes comprar?",
        "credit": "Tu hipoteca paso a paso",
        "explore": "Explorar barrios y precios",
        "evaluate": "Valorar una casa"
      },
      "rent": {
        "title": "Buscar para alquilar",
        "explore": "Explorar barrios y precios"
      }
    }
  },
  "hero": {
    "defaultTitle": "Descubre tu nuevo hogar, hoy.",
    "geminiPrompt": "Crea un eslogan muy corto para un portal inmobiliario, con un máximo de 7 palabras. Debe ser atractivo y directo. La respuesta DEBE ser en español. Ejemplos de frases que me gustan: 'Encuentra tu inmueble aquí', 'Todo empieza hoy', 'Bienvenido al Portal Inmobiliario Quallity Home', '¿Qué tal una casa nueva?', 'Alquila sin burocracia', '¿Agendamos una visita?'. Genera una nueva frase en este estilo. No uses comillas en la respuesta.",
    "tabs": {
      "buy": "Comprar",
      "rent": "Alquilar",
      "season": "Temporada"
    },
    "propertyTypes": {
      "housesAndApts": "Casas y apartamentos",
      "offices": "Oficinas",
      "garages": "Garajes"
    },
    "locationPlaceholder": "Introduce la ubicación (barrio, ciudad, región)",
    "drawOnMap": "Dibuja tu zona",
    "searchNearMe": "Buscar cerca de ti",
    "loadingLocation": "Obteniendo ubicación...",
    "searchButton": "Buscar",
    "geolocationNotSupported": "La geolocalización no es compatible con este navegador.",
    "geolocationError": "No se pudo obtener tu ubicación. Por favor, comprueba los permisos de tu navegador."
  },
  "listings": {
    "title": "Inmuebles Destacados",
    "description": "Explora nuestra selección exclusiva de inmuebles que combinan lujo, confort y una ubicación privilegiada."
  },
  "propertyCard": {
    "bedrooms": "Hab.",
    "bathrooms": "Baños",
    "details": "Detalles",
    "contact": "Contacto",
    "addToFavorites": "Añadir a favoritos",
    "removeFromFavorites": "Quitar de favoritos"
  },
  "infoSection": {
    "draw": {
      "title": "Dibuja tu área de búsqueda",
      "description": "Elige exactamente el área que buscas en el mapa.",
      "link": "Dibuja tu área de búsqueda"
    },
    "publish": {
      "title": "Publica tu inmueble gratis",
      "description": "Tus 2 primeros anuncios son gratis. Casas, habitaciones, oficinas...",
      "link": "Publicar un anuncio gratis"
    }
  },
  "map": {
    "loading": "Cargando mapa...",
    "breadcrumbs": {
      "home": "Inicio",
      "proximitySearch": "Búsqueda por Proximidad",
      "drawOnMap": "Dibujar en el mapa"
    },
    "title": {
      "proximity": "Inmuebles cerca de ti",
      "draw": "Dibuja tu búsqueda en Salvador"
    },
    "drawInstruction": "Mueve el mapa para localizar el área de interés antes de dibujar la zona que buscas",
    "drawInstructionNew": "Usa las herramientas de dibujo en la esquina superior izquierda para seleccionar tu área.",
    "drawButton": "Dibujar tu área",
    "clearButton": "Limpiar Dibujo",
    "drawingInProgress": "Dibujando...",
    "userLocationPopup": "Tu ubicación",
    "toggleResults": {
      "show": "Ver {count} Inmuebles",
      "hide": "Ocultar Resultados"
    },
    "resultsPanel": {
      "title": "{count} inmuebles encontrados",
      "proximityTitle": "{count} inmuebles encontrados en un radio de {radius}km",
      "noResults": {
        "line1": "No se encontraron inmuebles en esta área.",
        "line2": "Intenta dibujar un área más grande o en otra ubicación."
      }
    }
  },
  "publishAdPage": {
    "breadcrumbHome": "Inicio",
    "breadcrumbPublish": "Cómo poner un anuncio",
    "mainCard": {
      "title": "Cómo poner un anuncio en Quallity Home",
      "benefit1": "Tus 2 primeros anuncios son gratis. Si son habitaciones, puedes publicar hasta 5 anuncios gratis.",
      "benefit2": "Tienes acceso a un área privada donde puedes gestionar tu anuncio y los contactos que recibes.",
      "benefit3": "Puedes resolver dudas, intercambiar información y organizar visitas de forma eficiente a través de nuestro chat.",
      "agencyInfo": "Para vender o alquilar más rápido, contacta con una agencia inmobiliaria.",
      "publishButton": "Publica tu anuncio gratis",
      "professionalInfo": "¿Eres un profesional inmobiliario? Conoce nuestras ventajas para profesionales."
    },
    "steps": {
      "title": "¿Cuáles son los pasos a seguir para publicar tu anuncio como propietario particular?",
      "intro": "Hay 4 puntos esenciales para vender o alquilar tu inmueble lo más rápidamente posible:",
      "step1Title": "1. Insertar las mejores fotografías que tengas y, si es posible, un plano que muestre la distribución de las estancias",
      "step1Content": "• Asegúrate de tener fotos de calidad a mano cuando publiques tu anuncio. Si no las tienes, podrás añadirlas más tarde, pero recuerda, sin fotos no tendrás resultados.\n• La foto principal es esencial. Será la portada de tu anuncio, la única que se enviará por email a los interesados y la que aparecerá en la lista de resultados.\n• Ordena tus fotos de forma lógica para crear una historia atractiva y opta por imágenes horizontales que quedan muy bien.\n• Incluir un plano hecho a mano, aunque no esté detallado, ofrece información útil para que los interesados visualicen la distribución de las estancias y cómo sería vivir allí.",
      "step2Title": "2. Indicar la dirección exacta",
      "step2Content": "Para que las personas que buscan en la zona conozcan tu anuncio, es muy importante indicar la dirección correcta del inmueble. Si, por algún motivo, no quieres indicarla, tienes a tu disposición la posibilidad de ocultar la dirección por 9,90 €.",
      "step3Title": "3. Poner un precio de acuerdo con el valor de mercado",
      "step3Content": "En caso de duda, puedes hacer una valoración gratuita de tu inmueble en nuestra web o verificar el precio medio en esa zona.",
      "step4Title": "4. Indicar las características de tu inmueble y describir tu casa en detalle",
      "step4Content": "Incluye información sobre tu inmueble, como el número de habitaciones, m2, baños, etc. Refiere también las comodidades adicionales, como la presencia de un ascensor, una terraza, una plaza de garaje, un trastero, etc. Al fin y al cabo, todos estos detalles valorizan tu inmueble. Destaca las características especiales de tu inmueble, sobre todo las que aparecen en las fotografías. No te olvides de explicar los servicios cercanos, los transportes disponibles y los lugares de interés en la zona."
    },
    "advantages": {
      "title": "Ventajas de publicar en Quallity Home",
      "advantage1Title": "Garantía de visibilidad",
      "advantage1Content": "Los anuncios publicados en nuestra web son visitados por millones de usuarios, lo que te da la oportunidad de vender o alquilar tu inmueble de una forma más rápida y eficaz.",
      "advantage2Title": "La mejor experiencia",
      "advantage2Content": "La APP de Quallity Home tiene múltiples funcionalidades que te ayudarán a gestionar tu publicación y para quien busca un inmueble, permite configurar alertas totalmente personalizadas para recibir inmediatamente nuevos inmuebles.",
      "advantage3Title": "Gran variedad de productos para tu anuncio",
      "advantage3Content": "Disponemos de una amplia gama de herramientas para mejorar la posición de tu anuncio y ganar visibilidad."
    }
  },
  "loginModal": {
    "title": "Inicia sesión o regístrate para publicar tu anuncio",
    "description": "Publica tu anuncio para que sea visto por millones de personas que buscan su próximo inmueble.",
    "emailLabel": "Tu e-mail",
    "continueButton": "Continuar",
    "socialLoginPrompt": "También puedes",
    "googleButton": "Continuar con Google",
    "appleButton": "Continuar con Apple"
  },
  "publishJourney": {
    "stepper": {
      "step1": "1. Datos básicos",
      "step2": "2. Detalles",
      "step3": "3. Fotos"
    },
    "title": "Publicar tu anuncio de particular",
    "editTitle": "Editar tu anuncio",
    "adPublishedSuccess": "¡Anuncio publicado con éxito!",
    "form": {
      "propertyType": {
        "label": "Elige el tipo de inmueble"
      },
      "operation": {
        "label": "Operación"
      },
      "location": {
        "label": "Ubicación del inmueble",
        "city": "Localidad",
        "street": "Calle",
        "number": "Número de la vía"
      },
      "submitButton": "Verificar dirección"
    },
    "verifiedAddress": {
      "label": "Ubicación del inmueble",
      "edit": "Editar"
    },
    "contactDetails": {
      "title": "Tus datos de contacto",
      "emailLabel": "Tu email",
      "emailDescription": "Nunca será visible en el anuncio, solo en las alertas y notificaciones.",
      "changeAccount": "Iniciar sesión con otra cuenta",
      "phoneLabel": "Tu teléfono",
      "phonePlaceholder": "Tu número con prefijo",
      "addPhone": "Añadir teléfono adicional",
      "nameLabel": "Tu nombre",
      "nameDescription": "Será visible en el anuncio y cuando escribas a otros usuarios.",
      "preferenceLabel": "¿Cómo prefieres que te contacten?",
      "prefChatAndPhone": "Teléfono y mensajes en nuestro chat (recomendado)",
      "prefChatAndPhoneDesc": "Recibirás un aviso de los mensajes por e-mail y notificaciones en nuestra app",
      "prefChatOnly": "Solo por mensajes de chat",
      "prefChatOnlyDesc": "Recibirás un aviso de los mensajes por e-mail y notificaciones en nuestra app",
      "prefPhoneOnly": "Solo por teléfono",
      "continueButton": "Continuar a detalles del inmueble",
      "nextStepInfo": "En el próximo paso podrás introducir las características y el precio."
    },
     "detailsForm": {
      "title": "Aprovecha, este anuncio es gratis ;-)",
      "adTitle": "Título del anuncio",
      "adTitlePlaceholder": "Ej: Increíble apartamento con vistas al mar en Barra",
      "apartmentCharacteristics": "Características del inmueble",
      "propertyType": "Tipo de inmueble (opcional)",
      "apartment": "Apartamento",
      "house": "Casa",
      "room": "Habitación",
      "office": "Oficina",
      "land": "Terreno",
      "condition": "Estado",
      "forRenovation": "Para reformar",
      "goodCondition": "Buen estado",
      "grossArea": "m² superficie bruta",
      "netArea": "m² superficie útil (opcional)",
      "bedrooms": "Número de habitaciones en la casa",
      "bathrooms": "Número de baños completos y de servicio",
      "hasElevator": "¿Tiene ascensor?",
      "yes": "Sí, tiene",
      "no": "No tiene",
      "otherHomeFeatures": "Otras características de tu vivienda",
      "builtInWardrobes": "Armarios empotrados",
      "airConditioning": "Aire acondicionado",
      "terrace": "Terraza",
      "balcony": "Balcón",
      "garage": "Plaza de garaje/Box",
      "mobiliado": "Amueblado",
      "cozinhaEquipada": "Cocina equipada",
      "suite": "Suite",
      "escritorio": "Oficina en casa",
      "otherBuildingFeatures": "Otras características de tu edificio",
      "pool": "Piscina",
      "greenArea": "Zona verde",
      "portaria24h": "Portería 24h",
      "academia": "Gimnasio",
      "salaoDeFestas": "Salón de fiestas",
      "churrasqueira": "Zona de barbacoa",
      "parqueInfantil": "Parque infantil",
      "quadraEsportiva": "Cancha deportiva",
      "sauna": "Sauna",
      "espacoGourmet": "Espacio gourmet",
      "showMoreDetails": "Indicar más detalles",
      "propertyPrice": "Precio del inmueble",
      "price": "Precio",
      "condoFee": "Gastos de comunidad (opcional)",
      "currency": {
        "price": "euros",
        "fee": "euros/mes"
      },
      "saleSituation": "¿En qué situación se venderá el inmueble?",
      "rentedWithTenants": "Alquilado, con inquilinos",
      "withoutTenants": "Sin inquilinos",
      "adDescription": "Descripción del anuncio",
      "descriptionPlaceholder": "Escribe aquí la descripción en español. Más tarde, podrás añadir otros idiomas.",
      "continueToPhotosButton": "Continuar e importar fotos"
    },
    "photosForm": {
        "title": "Añadir fotos, planos y vídeos a tu anuncio",
        "dragAndDrop": "Arrastra y suelta tus fotos aquí o selecciónalas desde tu dispositivo",
        "addButton": "Añadir fotos y vídeos",
        "limitsInfo": "Selecciona hasta 30 fotos y 10 planos (máx. 32 MB cada uno) y 6 vídeos (máx. 600 MB cada uno) de tu galería.",
        "rememberTitle": "Recuerda que...",
        "tip1": "Fotos, planos y vídeos: atraen a más personas a tu anuncio",
        "tip2": "Si tienes un plano del inmueble, puedes hacerle una foto o dibujarlo a mano y hacer una fotografía del dibujo",
        "tip3": "Cuando hagas tus fotografías, asegúrate de que cada estancia está ordenada, limpia y bien iluminada",
        "backButton": "Volver",
        "continueButton": "Continuar sin fotos",
        "publishButton": "Publicar Anuncio",
        "updateButton": "Actualizar Anuncio",
        "publishingButton": "Publicando...",
        "updatingButton": "Actualizando...",
        "removeFile": "Quitar archivo"
    },
    "sidebar": {
      "title": "Información útil",
      "p1": "Prepara las fotos. Si todavía no las tienes, podrás añadirlas más tarde. Sin fotos no obtendrás resultados.",
      "p2": "Te ofrecemos los dos primeros anuncios gratis para que pruebes nuestro servicio. Puedes publicar anuncios gratis de apartamentos, chalets, terrenos, locales comerciales, etc. hasta que los vendas o alquiles.",
      "p3": "Además, puedes publicar hasta 5 habitaciones gratis, en inmuebles para compartir, que no se suman al número de anuncios que te ofrecemos.",
      "p4": "Para garantizar la calidad de nuestros servicios, cobramos una tasa en los siguientes casos:",
      "case1": "anunciantes con más de dos inmuebles",
      "case2": "anunciantes de inmuebles duplicados",
      "case3": "inmuebles en venta por más de 1.000.000 de euros",
      "case4": "inmuebles en alquiler por más de 2.500 €/mes",
      "quickSell": {
        "title": "¿Quieres vender tu casa rápidamente?",
        "link": "Encuentra la agencia inmobiliaria más adecuada"
      },
      "professional": {
        "title": "¿Eres profesional inmobiliario?",
        "link": "Conoce las ventajas que ofrecemos para profesionales"
      }
    },
    "locationConfirmationModal": {
      "title": "¿Está en el lugar correcto?",
      "subtitle": "Si no está bien ubicado, puedes arrastrar el pin hasta la posición correcta.",
      "countryInfo": "Brasil",
      "confirmButton": "Confirmar dirección",
      "backButton": "Volver a escribir la dirección"
    },
    "locationPermissionModal": {
      "title": "¿Mejorar sugerencias de ciudad?",
      "message": "Para ofrecer sugerencias más relevantes para tu región, podemos usar tu ubicación. Tus datos de ubicación exacta nunca se guardan ni se comparten."
    }
  },
  "geolocationErrorModal": {
    "title": "Error de Ubicación",
    "description": "No pudimos obtener tu ubicación. Esto puede ocurrir si denegaste la solicitud de permiso o si tu navegador no admite la geolocalización. Por favor, revisa los permisos de sitio de tu navegador e inténtalo de nuevo.",
    "closeButton": "OK"
  },
  "searchResults": {
    "breadcrumb": "Resultados de búsqueda",
    "title": "Inmuebles para \"{query}\"",
    "subtitle": "{count} inmuebles encontrados",
    "noResults": {
      "title": "No se encontraron resultados",
      "description": "Intenta ajustar tus términos de búsqueda o busca una ubicación diferente."
    }
  },
  "propertyDetail": {
    "breadcrumb": "Detalles del Inmueble",
    "gallery": "Galería de Fotos",
    "description": "Descripción",
    "details": "Detalles del Inmueble",
    "videos": "Galería de Vídeos",
    "scheduleVisit": "Agendar Visita",
    "addToFavorites": "Añadir a Favoritos",
    "removeFromFavorites": "Quitar de Favoritos",
    "generalDetails": "Detalles Generales",
    "propertyFeatures": "Características del Inmueble",
    "condoAmenities": "Comodidades del Condominio",
    "propertyType": "Tipo de inmueble",
    "occupationStatus": "Situación",
    "hasElevator": "Ascensor",
    "yes": "Sí",
    "no": "No",
    "condoFee": "Comunidad"
  },
  "favoritesPage": {
    "title": "Mis Inmuebles Favoritos",
    "breadcrumb": "Favoritos",
    "noFavorites": {
      "title": "Aún no tienes inmuebles favoritos",
      "description": "Haz clic en el corazón en los anuncios para guardar los inmuebles que más te gusten aquí."
    }
  },
  "contactModal": {
    "title": "Contacto del Anunciante",
    "contactPerson": "Hablar con",
    "phone": "Teléfono",
    "whatsappButton": "Chatear por WhatsApp",
    "chatButton": "Chatear por el chat",
    "whatsappMessage": "Hola, vi este inmueble en el Portal Quality Home y me gustaría más información. Título del anuncio: {title}"
  },
  "chatList": {
    "title": "Mis Chats",
    "breadcrumb": "Chat",
    "noChats": {
      "title": "Aún no tienes conversaciones",
      "description": "Inicia una conversación desde la página de detalles de un inmueble."
    }
  },
  "chatPage": {
    "title": "Chat sobre: {title}",
    "messagePlaceholder": "Escribe tu mensaje...",
    "sendButton": "Enviar"
  },
  "myAdsPage": {
    "title": "Mis Anuncios",
    "breadcrumb": "Mis Anuncios",
    "noAds": {
      "title": "Aún no has publicado ningún anuncio",
      "description": "Empieza ahora y llega a miles de personas interesadas en tu inmueble."
    },
    "newAdButton": "Publicar Nuevo Anuncio",
    "viewButton": "Ver",
    "editButton": "Editar",
    "deleteButton": "Eliminar",
    "deleteConfirm": "¿Estás seguro de que quieres eliminar este anuncio? Esta acción no se puede deshacer.",
    "adDeletedSuccess": "¡Anuncio eliminado con éxito!",
    "adDeletedError": "Error al eliminar el anuncio.",
    "inactiveStatus": "Inactivo"
  },
  "confirmationModal": {
    "title": "¡Éxito!",
    "message": "Tu anuncio se ha publicado correctamente y ya está visible en el portal.",
    "closeButton": "Entendido"
  },
  "systemModal": {
    "successTitle": "¡Éxito!",
    "errorTitle": "Ocurrió un Error",
    "confirmTitle": "¿Estás seguro?",
    "okButton": "Entendido",
    "confirmButton": "Confirmar",
    "cancelButton": "Cancelar",
    "fetchError": "No se pudieron cargar los anuncios. Por favor, intenta recargar la página.",
    "editSuccessMessage": "¡Anuncio actualizado con éxito!",
    "errorDetails": "Detalles del error"
  },
  "footer": {
    "text": "Quality Home Portal Inmobiliario. Todos los derechos reservados."
  }
};

type Language = 'pt' | 'en' | 'es';

const translations = {
  pt: ptTranslations,
  en: enTranslations,
  es: esTranslations,
};

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const t = (key: string, options?: { [key: string]: string | number }) => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        return key; // Return the key itself if not found
      }
    }

    if (typeof result === 'string' && options) {
      Object.keys(options).forEach(optKey => {
        result = result.replace(`{${optKey}}`, String(options[optKey]));
      });
    }
    
    return result || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
