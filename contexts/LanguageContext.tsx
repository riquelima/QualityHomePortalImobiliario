
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
    "logout": "Terminar sessão",
    "myAccount": "Ir para a tua conta",
    "ads": "Anúncios",
    "savedSearches": "Pesquisas guardadas",
    "favorites": "Favoritos",
    "chat": "Chat"
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
    "breadcrumbPublish": "Como colocar um anúncio",
    "mainCard": {
      "title": "Como colocar um anúncio na Quallity Home",
      "benefit1": "Seus 2 primeiros anúncios são grátis. Se forem quartos, pode publicar até 5 anúncios grátis.",
      "benefit2": "Você tem acesso a uma área privada onde pode gerenciar seu anúncio e os contatos que recebe.",
      "benefit3": "Você pode resolver questões, trocar informações e organizar visitas de uma forma eficiente através do nosso chat.",
      "agencyInfo": "Para vender ou alugar mais rápido, contate uma agência imobiliária.",
      "publishButton": "Publique seu anúncio grátis",
      "professionalInfo": "Você é um profissional imobiliário? Conheça as nossas vantagens para profissionais."
    },
    "steps": {
      "title": "Quais são os passos a seguir para publicar o seu anúncio como proprietário particular?",
      "intro": "Há 4 pontos essenciais para vender ou alugar o seu imóvel o mais rapidamente possível:",
      "step1Title": "1. Inserir as melhores fotografias que você tiver e, se possível, uma planta que mostre a disposição dos cômodos",
      "step1Content": "• Certifique-se de que tem fotos de qualidade à mão quando publicar o seu anúncio. Se não as tiver, poderá adicionar mais tarde, mas lembre-se, sem fotos não terá resultados.\n• A foto principal é essencial. Será a capa do seu anúncio, a única que será enviada por email aos interessados e a que vai aparecer na lista de resultados.\n• Ordene suas fotos de forma lógica para criar uma história atrativa e opte por imagens horizontais que ficam muito bem.\n• Incluir uma planta feita à mão, mesmo que não esteja detalhada, oferece informação útil para que os interessados visualizem a distribuição dos cômodos e como seria viver ali.",
      "step2Title": "2. Indicar o endereço exato",
      "step2Content": "Para que as pessoas que procuram na zona conheçam o seu anúncio, é muito importante indicar o endereço correto do imóvel. Se, por algum motivo, não queira indicá-lo, tem à sua disposição a possibilidade de ocultar o endereço por R$ 9,90.",
      "step3Title": "3. Colocar um preço de acordo com o valor de mercado",
      "step3Content": "Em caso de dúvida, pode fazer uma avaliação gratuita do seu imóvel no nosso site ou verificar o preço médio nessa zona.",
      "step4Title": "4. Indicar as características do seu imóvel e descrever a sua casa em detalhes",
      "step4Content": "Inclua informações sobre o seu imóvel, como o número de quartos, m2, banheiros, etc. Refira também as comodidades adicionais, como a presença de um elevador, um terraço, uma vaga de estacionamento, uma arrecadação, etc. Afinal, todos estes detalhes valorizam o seu imóvel. Destaque as características especiais do seu imóvel, sobretudo as que aparecem nas fotografias. Não se esqueça de explicar os serviços próximos, os transportes disponíveis e os lugares de interesse na zona."
    },
    "advantages": {
      "title": "Vantagens de publicar na Quallity Home",
      "advantage1Title": "Garantia de visibilidade",
      "advantage1Content": "Os anúncios publicados no nosso site são visitados por milhões de utilizadores, o que lhe dá a oportunidade de vender ou alugar o seu imóvel de uma forma mais rápida e eficaz.",
      "advantage2Title": "A melhor experiência",
      "advantage2Content": "O APP da Quallity Home tem múltiplas funcionalidades que ajudarão você a gerenciar sua publicação e para quem procura um imóvel, permite configurar alertas totalmente personalizados para receber imediatamente novos imóveis.",
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
    "title": "Publicar o seu anúncio de particular",
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
        "city": "Localidade",
        "street": "Rua",
        "number": "Número da via"
      },
      "hideAddress": {
        "label": "Quer ocultar a rua e o número? (opcional)",
        "option": "Ocultar endereço por R$ 9,90"
      },
      "submitButton": "Verificar endereço"
    },
    "verifiedAddress": {
      "label": "Localização do imóvel",
      "edit": "Editar"
    },
    "contactDetails": {
      "title": "Os teus dados de contacto",
      "emailLabel": "O teu email",
      "emailDescription": "Nunca será visto no anúncio, apenas nas alertas e notificações.",
      "changeAccount": "Entrar com outra conta",
      "phoneLabel": "O teu telefone",
      "phonePlaceholder": "Seu número com DDD",
      "addPhone": "Acrescentar telefone adicional",
      "nameLabel": "O teu nome",
      "nameDescription": "Será visível no anúncio e quando escrevas a outros utilizadores.",
      "preferenceLabel": "Como preferes ser contactado?",
      "prefChatAndPhone": "Telefone e mensagens no nosso chat (recomendado)",
      "prefChatAndPhoneDesc": "Irás receber um aviso das mensagens por e-mail e notificações na nossa app",
      "prefChatOnly": "Só por mensagens de chat",
      "prefChatOnlyDesc": "Irás receber um aviso das mensagens por e-mail e notificações na nossa app",
      "prefPhoneOnly": "Só por telefone",
      "continueButton": "Continuar para detalhes do imóvel",
      "nextStepInfo": "No próximo passo poderás inserir as características e o preço."
    },
    "detailsForm": {
      "title": "Aproveita, este anúncio é grátis ;-)",
      "adTitle": "Título do anúncio",
      "adTitlePlaceholder": "Ex: Apartamento incrível com vista mar na Barra",
      "apartmentCharacteristics": "Características do apartamento",
      "propertyType": "Tipo de apartamento (opcional)",
      "apartment": "Apartamento",
      "penthouse": "Penthouse",
      "duplex": "Duplex",
      "studio": "Tole/estúdio/loft",
      "condition": "Estado",
      "forRenovation": "Para recuperar",
      "goodCondition": "Bom estado",
      "grossArea": "m² área bruta",
      "netArea": "m² úteis (opcional)",
      "bedrooms": "Número de quartos na casa",
      "bathrooms": "Número de casas de banho completas e de serviço",
      "hasElevator": "Tem elevador?",
      "yes": "Sim, tem",
      "no": "Não tem",
      "energyCertificate": "Certificado energético",
      "energyClass": "Classe energética",
      "select": "Seleciona",
      "orientation": "Orientação (opcional)",
      "north": "Norte",
      "south": "Sul",
      "east": "Este",
      "west": "Oeste",
      "otherHomeFeatures": "Outras características da tua moradia",
      "builtInWardrobes": "Armários embutidos",
      "airConditioning": "Ar condicionado",
      "terrace": "Terraço",
      "balcony": "Varanda",
      "storageRoom": "Arrecadação",
      "garage": "Lugar de garagem/Box",
      "otherBuildingFeatures": "Outras características do teu prédio",
      "pool": "Piscina",
      "greenArea": "Zona verde",
      "showMoreDetails": "Indicar mais detalhes",
      "propertyPrice": "Preço do imóvel",
      "price": "Preço",
      "condoFee": "Gastos de condomínio (opcional)",
      "saleSituation": "Em que situação será vendido o imóvel?",
      "rentedWithTenants": "Arrendado, com inquilinos",
      "withoutTenants": "Sem inquilinos",
      "adDescription": "Descrição do anúncio",
      "descriptionPlaceholder": "Escreve aqui a descrição em português. Mais tarde, poderás adicionar outras línguas.",
      "continueToPhotosButton": "Continuar e importar fotos"
    },
    "photosForm": {
      "title": "Adicionar fotos, plantas e vídeos ao teu anúncio",
      "dragAndDrop": "Arrasta e solta as tuas fotos aqui ou seleciona-as a partir do teu dispositivo",
      "addButton": "Adicionar fotos e vídeos",
      "limitsInfo": "Seleciona até 40 fotos e 10 plantas (máx. 32 MB cada) e 6 vídeos (máx. 600 MB cada) da tua galeria.",
      "rememberTitle": "Lembra-te que...",
      "tip1": "Fotos, plantas e vídeos: atraem mais pessoas para o teu anúncio",
      "tip2": "Se tiveres uma planta do imóvel, podes tirar uma foto da mesma ou desenhá-la à mão e tirar uma fotografia do desenho",
      "tip3": "Quando tirares as tuas fotografias, certifica-te de que cada divisão está arrumada, limpa e bem iluminada",
      "backButton": "Voltar",
      "continueButton": "Continuar sem fotos"
    },
    "sidebar": {
      "title": "Informação útil",
      "p1": "Prepare as fotos. Se ainda não as tem, poderá adicioná-las mais tarde. Sem fotos não obterá resultados.",
      "p2": "Oferecemos os dois primeiros anúncios grátis para que experimente o nosso serviço. Pode publicar anúncios grátis de apartamentos, moradias, terrenos, espaços comerciais, etc. até que o vendas ou alugues.",
      "p3": "Além disso, podes publicar até 5 quartos grátis, em imóveis para partilhar, que não se somam ao número de anúncios que te oferecemos.",
      "p4": "Para garantir a qualidade dos nossos serviços, cobramos uma taxa nos seguintes casos:",
      "case1": "anunciantes com mais de dois imóveis",
      "case2": "anunciantes de imóveis duplicados",
      "case3": "imóveis à venda por mais de 1.000.000 de euros",
      "case4": "imóveis em arrendamento por mais de 2.500 €/mês",
      "quickSell": {
        "title": "Quer vender a sua casa rapidamente?",
        "link": "Encontre a agência imobiliária mais adequada"
      },
      "professional": {
        "title": "É profissional imobiliário?",
        "link": "Conhece as vantagens que oferecemos para profissionais"
      }
    },
    "locationConfirmationModal": {
      "title": "Está no lugar correto?",
      "subtitle": "Se não está bem localizado, pode arrastar o pino até à posição correta.",
      "countryInfo": "Brasil",
      "confirmButton": "Confirmar endereço",
      "backButton": "Voltar a escrever o endereço"
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
    "removeFromFavorites": "Remover dos Favoritos"
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
    "chat": "Chat"
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
      "hideAddress": {
        "label": "Want to hide the street and number? (optional)",
        "option": "Hide address for R$ 9,90"
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
      "apartmentCharacteristics": "Apartment characteristics",
      "propertyType": "Type of apartment (optional)",
      "apartment": "Apartment",
      "penthouse": "Penthouse",
      "duplex": "Duplex",
      "studio": "Studio/loft",
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
      "energyCertificate": "Energy certificate",
      "energyClass": "Energy class",
      "select": "Select",
      "orientation": "Orientation (optional)",
      "north": "North",
      "south": "South",
      "east": "East",
      "west": "West",
      "otherHomeFeatures": "Other features of your home",
      "builtInWardrobes": "Built-in wardrobes",
      "airConditioning": "Air conditioning",
      "terrace": "Terrace",
      "balcony": "Balcony",
      "storageRoom": "Storage room",
      "garage": "Garage space/Box",
      "otherBuildingFeatures": "Other features of your building",
      "pool": "Pool",
      "greenArea": "Green area",
      "showMoreDetails": "Indicate more details",
      "propertyPrice": "Property price",
      "price": "Price",
      "condoFee": "Condominium fees (optional)",
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
      "limitsInfo": "Select up to 40 photos and 10 floor plans (max. 32 MB each) and 6 videos (max. 600 MB each) from your gallery.",
      "rememberTitle": "Remember that...",
      "tip1": "Photos, floor plans, and videos: attract more people to your ad",
      "tip2": "If you have a floor plan of the property, you can take a photo of it or draw it by hand and take a photograph of the drawing",
      "tip3": "When you take your photographs, make sure that each room is tidy, clean, and well-lit",
      "backButton": "Back",
      "continueButton": "Continue without photos"
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
    "removeFromFavorites": "Remove from Favorites"
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
    "chat": "Chat"
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
      "hideAddress": {
        "label": "¿Quieres ocultar la calle y el número? (opcional)",
        "option": "Ocultar dirección por 9,90 €"
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
      "apartmentCharacteristics": "Características del apartamento",
      "propertyType": "Tipo de apartamento (opcional)",
      "apartment": "Apartamento",
      "penthouse": "Penthouse",
      "duplex": "Dúplex",
      "studio": "Estudio/loft",
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
      "energyCertificate": "Certificado energético",
      "energyClass": "Clase energética",
      "select": "Selecciona",
      "orientation": "Orientación (opcional)",
      "north": "Norte",
      "south": "Sur",
      "east": "Este",
      "west": "Oeste",
      "otherHomeFeatures": "Otras características de tu vivienda",
      "builtInWardrobes": "Armarios empotrados",
      "airConditioning": "Aire acondicionado",
      "terrace": "Terraza",
      "balcony": "Balcón",
      "storageRoom": "Trastero",
      "garage": "Plaza de garaje/Box",
      "otherBuildingFeatures": "Otras características de tu edificio",
      "pool": "Piscina",
      "greenArea": "Zona verde",
      "showMoreDetails": "Indicar más detalles",
      "propertyPrice": "Precio del inmueble",
      "price": "Precio",
      "condoFee": "Gastos de comunidad (opcional)",
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
        "limitsInfo": "Selecciona hasta 40 fotos y 10 planos (máx. 32 MB cada uno) y 6 vídeos (máx. 600 MB cada uno) de tu galería.",
        "rememberTitle": "Recuerda que...",
        "tip1": "Fotos, planos y vídeos: atraen a más personas a tu anuncio",
        "tip2": "Si tienes un plano del inmueble, puedes hacerle una foto o dibujarlo a mano y hacer una fotografía del dibujo",
        "tip3": "Cuando hagas tus fotografías, asegúrate de que cada estancia está ordenada, limpia y bien iluminada",
        "backButton": "Volver",
        "continueButton": "Continuar sin fotos"
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
    "removeFromFavorites": "Quitar de Favoritos"
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
