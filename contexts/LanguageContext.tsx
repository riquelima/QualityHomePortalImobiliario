
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
    "logout": "Sair"
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
    "contact": "Contato"
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
    "form": {
      "propertyType": {
        "label": "Escolha o tipo de imóvel",
        "apartment": "Apartamento",
        "house": "Casa",
        "land": "Terreno",
        "office": "Escritório"
      },
      "operation": {
        "label": "Operação",
        "sell": "Vender",
        "rent": "Alugar",
        "season": "Temporada"
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
    "logout": "Logout"
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
    "contact": "Contact"
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
    "form": {
      "propertyType": {
        "label": "Choose the property type",
        "apartment": "Apartment",
        "house": "House",
        "land": "Land",
        "office": "Office"
      },
      "operation": {
        "label": "Operation",
        "sell": "Sell",
        "rent": "Rent",
        "season": "Season"
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
    "logout": "Cerrar sesión"
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
      "garajes": "Garajes"
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
    "contact": "Contacto"
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
      "drawOnMap": "Dibujar en el Mapa"
    },
    "title": {
      "proximity": "Inmuebles cerca de ti",
      "draw": "Dibuja tu búsqueda en Salvador"
    },
    "drawInstruction": "Mueve el mapa para localizar el área que te interesa antes de dibujar la zona donde buscas",
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
      "agencyInfo": "Para vender o alquilar más rápido contacta con una agencia inmobiliaria.",
      "publishButton": "Publica tu anuncio gratis",
      "professionalInfo": "¿Eres un profesional inmobiliario? Conoce nuestras ventajas para profesionales."
    },
    "steps": {
      "title": "¿Cuáles son los pasos a seguir para publicar tu anuncio como propietario particular?",
      "intro": "Hay 4 puntos esenciales para vender o alquilar tu inmueble lo más rápidamente posible:",
      "step1Title": "1. Inserta las mejores fotografías que tengas y, a poder ser, un plano que muestre la disposición de las estancias",
      "step1Content": "• Asegúrate de que tienes fotos de calidad a mano cuando publiques tu anuncio. Si no las tienes, podrás añadirlas más tarde, pero recuerda que sin fotos no tendrás resultados.\n• La foto principal es esencial. Será la portada de tu anuncio, la única que se enviará por email a los interesados y la que aparecerá en el listado de resultados.\n• Ordena tus fotos de forma lógica para crear una historia atractiva y opta por imágenes horizontales que quedan muy bien.\n• Incluir un plano hecho a mano, aunque no esté detallado, ofrece información útil para que los interesados visualicen la distribución de las estancias y cómo sería vivir allí.",
      "step2Title": "2. Indica la dirección exacta",
      "step2Content": "Para que las personas que buscan en la zona conozcan tu anuncio, es muy importante indicar la dirección correcta del inmueble. Si, por algún motivo, no quieres indicarla, tienes a tu disposición la posibilidad de ocultar la dirección por 9,90 €.",
      "step3Title": "3. Pon un precio acorde con el valor de mercado",
      "step3Content": "En caso de duda, puedes hacer una valoración gratuita de tu inmueble en nuestra web o verificar el precio medio en esa zona.",
      "step4Title": "4. Indica las características de tu inmueble y describe tu casa al detalle",
      "step4Content": "Incluye información sobre tu inmueble, como el número de habitaciones, m2, baños, etc. Refiere también las comodidades adicionales, como la presencia de un ascensor, una terraza, una plaza de garaje, un trastero, etc. Al fin y al cabo, todos estos detalles revalorizan tu inmueble. Destaca las características especiales de tu inmueble, sobre todo las que aparecen en las fotografías. No te olvides de explicar los servicios próximos, los transportes disponibles y los lugares de interés de la zona."
    },
    "advantages": {
      "title": "Ventajas de publicar en Quallity Home",
      "advantage1Title": "Garantía de visibilidad",
      "advantage1Content": "Los anuncios publicados en nuestro sitio son visitados por millones de usuarios, lo que te da la oportunidad de vender o alquilar tu inmueble de una forma más rápida y eficaz.",
      "advantage2Title": "La mejor experiencia",
      "advantage2Content": "La APP de Quallity Home tiene múltiples funcionalidades que te ayudarán a gestionar tu publicación y para quien busca un inmueble, permite configurar alertas totalmente personalizadas para recibir inmediatamente nuevos inmuebles.",
      "advantage3Title": "Gran variedad de productos para tu anuncio",
      "advantage3Content": "Disponemos de una vasta gama de herramientas para mejorar la posición de tu anuncio y ganar visibilidad."
    }
  },
  "loginModal": {
    "title": "Inicia sesión o regístrate para publicar tu anuncio",
    "description": "Publica tu anuncio para que sea visto por millones de personas que buscan su próximo inmueble.",
    "emailLabel": "Tu correo electrónico",
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
    "form": {
      "propertyType": {
        "label": "Elige el tipo de inmueble",
        "apartment": "Apartamento",
        "house": "Casa",
        "land": "Terreno",
        "office": "Oficina"
      },
      "operation": {
        "label": "Operación",
        "sell": "Vender",
        "rent": "Alquilar",
        "season": "Temporada"
      },
      "location": {
        "label": "Ubicación del inmueble",
        "city": "Localidad",
        "street": "Calle",
        "number": "Número de la vía"
      },
      "hideAddress": {
        "label": "¿Quieres ocultar la calle y el número? (opcional)",
        "option": "Ocultar dirección por R$ 9,90"
      },
      "submitButton": "Verificar dirección"
    },
    "sidebar": {
      "title": "Información útil",
      "p1": "Prepara las fotos. Si aún no las tienes, podrás añadirlas más tarde. Sin fotos no obtendrás resultados.",
      "p2": "Te ofrecemos los dos primeros anuncios gratis para que pruebes nuestro servicio. Puedes publicar anuncios gratis de apartamentos, viviendas, terrenos, locales comerciales, etc. hasta que los vendas o alquiles.",
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
      "subtitle": "Si no está bien ubicado, puede arrastrar el marcador a la posición correcta.",
      "countryInfo": "Brasil",
      "confirmButton": "Confirmar dirección",
      "backButton": "Volver a escribir la dirección"
    }
  },
  "geolocationErrorModal": {
    "title": "Error de Ubicación",
    "description": "No pudimos obtener tu ubicación. Esto puede ocurrir si denegaste la solicitud de permiso o si tu navegador no es compatible con la geolocalización. Por favor, comprueba los permisos del sitio en tu navegador e inténtalo de nuevo.",
    "closeButton": "OK"
  },
  "searchResults": {
    "breadcrumb": "Resultados de la búsqueda",
    "title": "Inmuebles para \"{query}\"",
    "subtitle": "{count} inmuebles encontrados",
    "noResults": {
      "title": "No se encontraron resultados",
      "description": "Intenta ajustar tus términos de búsqueda o buscar una ubicación diferente."
    }
  },
  "footer": {
    "text": "Quality Home Portal Inmobiliario. Todos los derechos reservados."
  }
};


type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  pt: ptTranslations,
  en: enTranslations,
  es: esTranslations,
};

// Função para obter um valor aninhado de um objeto a partir de uma chave string "a.b.c"
const getNestedTranslation = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};


export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const t = (key: string, options?: { [key: string]: string | number }): string => {
    const translation = getNestedTranslation(translations[language], key) || key;
    
    if (options) {
      return Object.entries(options).reduce((str, [key, value]) => {
        return str.replace(`{${key}}`, String(value));
      }, translation);
    }
    
    return translation;
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
