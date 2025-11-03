import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

// Translations are embedded directly to avoid module resolution issues.
const ptTranslations = {
  "home": {
    "title": "Lar dos sonhos? Encontre aqui.",
    "description": "Explore nossa seleção exclusiva de imóveis que combinam luxo, conforto e localização privilegiada."
  },
  "hero": {
    "defaultTitle": "O seu novo lar está aqui",
    "geminiPrompt": "Gere um título curto e inspirador para um portal imobiliário de luxo em português do Brasil. O título deve ser sofisticado e convidativo, com no máximo 8 palavras. Retorne apenas o título, sem aspas.",
    "tabs": {
      "buy": "Comprar",
      "rent": "Alugar",
      "season": "Temporada"
    },
    "locationPlaceholder": "Digite a Cidade",
    "drawOnMap": "Desenhar no mapa",
    "searchNearMe": "Buscar perto de mim",
    "loadingLocation": "Buscando localização...",
    "searchButton": "Buscar"
  },
  "initialGeolocationModal": {
    "title": "Usar sua localização?",
    "message": "Para aprimorar sua experiência e mostrar imóveis perto de você, podemos usar sua localização. Seus dados exatos nunca são compartilhados.",
    "allowButton": "Permitir",
    "denyButton": "Talvez depois"
  },
  "header": {
    "nav": {
      "buy": "Comprar",
      "rent": "Alugar",
      "season": "Temporada",
      "advancedSearch": "Busca Avançada"
    },
    "openMenu": "Abrir menu",
    "closeMenu": "Fechar menu",
    "menuTitle": "Menu",
    "logout": "Sair",
    "ownersDropdown": {
      "sell": {
        "guide": "Guia para vender",
        "documents": "Documentos necessários para a venda"
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
  "listings": {
    "title": "Imóveis em Destaque",
    "foundTitle": "Imóveis Encontrados",
    "description": "Explore nossa seleção exclusiva de imóveis que combinam luxo, conforto e localização privilegiada.",
    "noResults": {
      "title": "Nenhum Imóvel Encontrado",
      "description": "Parece que não há imóveis que correspondam à sua busca. Tente alterar os filtros."
    },
    "viewAll": "Ver todos os imóveis"
  },
  "propertyCard": {
    "bedrooms": "Quartos",
    "bathrooms": "Ban.",
    "details": "Detalhes"
  },
  "map": {
    "breadcrumbs": {
      "home": "Início",
      "proximitySearch": "Pesquisa por Proximidade",
      "drawOnMap": "Desenhar no mapa"
    },
    "title": {
      "proximity": "Imóveis perto de você",
      "draw": "Desenhe a sua pesquisa em Salvador"
    },
    "drawButton": "Desenhar sua área",
    "clearButton": "Limpar Desenho",
    "drawingInProgress": "Desenhando...",
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
  "publishJourney": {
    "stepper": {
      "step1": "1. Dados básicos",
      "step2": "2. Detalhes",
      "step3": "3. Fotos"
    },
    "title": "Publicar seu anúncio particular",
    "editTitle": "Editar seu anúncio",
    "adPublishedSuccess": "Anúncio publicado com sucesso!",
    "errors": { "titleTooShort": "O título do anúncio deve ter pelo menos 10 caracteres." },
    "limitExceeded": {
      "title": "Limite de arquivos excedido",
      "message": "Você pode enviar no máximo {count} arquivos por anúncio."
    },
    "form": {
      "propertyType": {
        "label": "Escolha o tipo de imóvel"
      },
      "operation": {
        "label": "Operação",
        "sell": "Vender",
        "rent": "Alugar",
        "season": "Temporada"
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
    "detailsForm": {
      "title": "Detalhes do Anúncio",
      "adTitle": "Título do anúncio",
      "adTitlePlaceholder": "Ex: Apartamento incrível com vista para o mar na Barra",
      "aiTitlePrompt": "Baseado no seguinte título de anúncio imobiliário, crie um mais atraente e chamativo. Mantenha-o conciso e profissional, com no máximo 10 palavras. Título original: '{title}'. Retorne apenas o novo título, sem aspas e sem texto adicional.",
      "aiTitleButtonLabel": "Melhorar com IA",
      "aiTitleError": "Não foi possível gerar um título. Verifique sua conexão ou tente novamente.",
      "aiDescriptionPrompt": "Você é um corretor de imóveis especialista em marketing. Sua tarefa é criar uma descrição de anúncio irresistível em português do Brasil. Use as informações detalhadas fornecidas abaixo para criar um texto corrido, profissional e convidativo. Incorpore os detalhes de forma natural na descrição, transformando a lista de características em uma narrativa que vende. Não repita a lista de características. O objetivo é fazer o leitor se imaginar no imóvel. Seja criativo e foque nos benefícios que cada característica oferece.\n\n**Regras importantes:**\n- **Incorpore todos os detalhes fornecidos.** Mencione o número de quartos, banheiros, área e características especiais.\n- **Não liste as características.** Descreva-as como parte de uma história (ex: 'relaxe na varanda espaçosa' em vez de 'característica: varanda').\n- **Não inclua o preço.**\n- **Não repita o título do anúncio.**\n- O texto final deve ter entre 2 e 4 parágrafos.\n\n**Informações do Imóvel:**\n{details}",
      "aiDescriptionButtonLabel": "Melhorar descrição com IA",
      "aiDescriptionError": "Não foi possível gerar uma descrição. Verifique sua conexão ou tente novamente.",
      "apartmentCharacteristics": "Características do imóvel",
      "landCharacteristics": "Características do Terreno",
      "topography": "Topografia",
      "flat": "Plano",
      "uphill": "Aclive",
      "downhill": "Declive",
      "irregular": "Irregular",
      "zoning": "Zoneamento",
      "residential": "Residencial",
      "commercial": "Comercial",
      "mixedUse": "Misto",
      "industrial": "Industrial",
      "walled": "É Murado?",
      "gatedCommunity": "Está em Condomínio Fechado?",
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
      "hasElevator": "Elevador",
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
      "adDescription": "Descrição do anúncio",
      "descriptionPlaceholder": "Escreva aqui a descrição do anúncio.",
      "continueToPhotosButton": "Continuar para fotos",
      "sellTitle": "Detalhes para Venda",
      "rentTitle": "Detalhes para Aluguel",
      "seasonTitle": "Detalhes para Temporada",
      "salePrice": "Preço de Venda",
      "iptuAnnual": "Valor do IPTU (anual, opcional)",
      "acceptsFinancing": "Aceita financiamento?",
      "occupationSituation": "Situação de ocupação do imóvel",
      "rented": "Alugado (com inquilinos)",
      "vacant": "Desocupado (sem inquilinos)",
      "monthlyRent": "Valor do Aluguel (mensal)",
      "condoFee": "Valor do condomínio (opcional)",
      "iptuMonthly": "Valor do IPTU (mensal, opcional)",
      "rentalConditions": "Condições de aluguel",
      "deposit": "Caução",
      "guarantor": "Fiador",
      "insurance": "Seguro Fiança",
      "petsAllowed": "Permite animais?",
      "dailyRate": "Valor da Diária",
      "minStay": "Mínimo de diárias",
      "maxGuests": "Máximo de hóspedes",
      "cleaningFee": "Taxa de limpeza (opcional)",
      "availability": "Disponibilidade"
    },
    "photosForm": {
      "title": "Adicione fotos, plantas e vídeos ao seu anúncio",
      "dragAndDrop": "Arraste e solte suas fotos aqui ou selecione do seu dispositivo",
      "addButton": "Adicionar fotos e vídeos",
      "limitsInfo": "Envie até 10 arquivos (fotos e vídeos). Máx. 32MB por foto e 600MB por vídeo.",
      "rememberTitle": "Lembre-se...",
      "tip1": "Fotos, plantas e vídeos atraem mais pessoas para o seu anúncio",
      "tip2": "Se você tiver a planta do imóvel, pode tirar uma foto dela ou desenhá-la à mão e fotografar o desenho",
      "tip3": "Ao tirar suas fotos, certifique-se de que cada cômodo esteja arrumado, limpo e bem iluminado",
      "backButton": "Voltar",
      "publishButton": "Publicar Anúncio",
      "updateButton": "Atualizar Anúncio",
      "publishingButton": "Publicando...",
      "updatingButton": "Atualizando...",
      "removeFile": "Remover arquivo"
    },
    "mediaValidation": {
      "dangerousFile": "Tipo de arquivo não permitido por motivos de segurança",
      "unsupportedType": "Tipo de arquivo não suportado. Use apenas imagens (JPG, PNG, WebP, GIF) ou vídeos (MP4, MOV, AVI, WebM)",
      "imageTooLarge": "Imagem muito grande. Tamanho máximo: 32MB",
      "videoTooLarge": "Vídeo muito grande. Tamanho máximo: 600MB",
      "tooManyFiles": "Máximo de 10 arquivos permitidos",
      "unreadableFile": "Não foi possível ler o arquivo",
      "invalidImage": "Arquivo não é uma imagem válida",
      "invalidVideo": "Arquivo não é um vídeo válido",
      "readError": "Erro ao ler o arquivo",
      "validationFailed": "Falha na validação do arquivo",
      "someFilesRejected": "Alguns arquivos foram rejeitados devido a problemas de validação"
    },
    "locationConfirmationModal": {
      "title": "A localização está correta?",
      "subtitle": "Se não estiver bem localizado, você pode arrastar o marcador para a posição correta.",
      "countryInfo": "Brasil",
      "confirmButton": "Confirmar endereço",
      "backButton": "Digitar o endereço novamente"
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
  "myAdsPage": {
    "title": "Painel de Anúncios",
    "breadcrumb": "Painel de Anúncios",
    "noAds": {
      "title": "Nenhum anúncio publicado",
      "description": "Comece agora a publicar os imóveis da Quallity Home."
    },
    "newAdButton": "Publicar Novo Anúncio",
    "viewButton": "Visualizar",
    "editButton": "Editar",
    "deleteButton": "Excluir",
    "deleteConfirm": "Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.",
    "adDeletedSuccess": "Anúncio excluído com sucesso.",
    "adDeletedError": "Erro ao excluir o anúncio.",
    "inactiveStatus": "Inativo",
    "publishSuccessTitle": "Sucesso!",
    "publishSuccessMessage": "Seu anúncio foi publicado com sucesso e já está visível para todos.",
    "updateSuccessMessage": "Seu anúncio foi atualizado com sucesso.",
    "shareButton": "Compartilhar"
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
    "linkCopiedTitle": "Link Copiado!",
    "linkCopiedMessage": "O link do imóvel foi copiado para sua área de transferência.",
    "linkCopyErrorTitle": "Erro ao Copiar",
    "linkCopyErrorMessage": "Não foi possível copiar o link. Tente novamente.",
    "networkError": "Erro de conexão. Verifique sua internet e tente novamente.",
    "dataError": "Erro ao processar dados. Tente novamente em alguns instantes.",
    "authError": "Erro de autenticação. Faça login novamente.",
    "generalError": "Ocorreu um erro inesperado. Tente novamente.",
    "loadMoreError": "Erro ao carregar mais imóveis. Tente novamente."
  },
  "loading": {
    "general": "Carregando...",
    "initialLoad": "Carregando imóveis...",
    "loadingMore": "Carregando mais imóveis...",
    "refreshing": "Atualizando dados...",
    "searching": "Buscando imóveis..."
  },
  "documentsForSalePage": {
    "title": "Documentos Necessários para a Venda",
    "intro": "A venda de um imóvel envolve uma série de documentos para garantir a segurança jurídica da transação. Aqui está uma lista geral dos documentos normalmente exigidos:",
    "seller": {
      "title": "Documentos do Vendedor (e cônjuge, se houver)",
      "doc1": "Documento de identidade (RG e CPF)",
      "doc2": "Comprovante de estado civil (Certidão de Nascimento ou Casamento)",
      "doc3": "Comprovante de endereço",
      "doc4": "Certidões negativas de débitos (federais, estaduais, municipais e trabalhistas)",
      "doc5": "Pacto antenupcial, se houver"
    },
    "buyer": {
      "title": "Documentos do Comprador (e cônjuge, se houver)",
      "doc1": "Documento de identidade (RG e CPF)",
      "doc2": "Comprovante de estado civil",
      "doc3": "Comprovante de endereço"
    },
    "property": {
      "title": "Documentos do Imóvel",
      "doc1": "Matrícula atualizada do imóvel (emitida pelo Cartório de Registro de Imóveis)",
      "doc2": "Certidão de Ônus Reais (para verificar se há pendências como hipotecas ou penhoras)",
      "doc3": "Certidão negativa de débitos de IPTU (emitida pela prefeitura)",
      "doc4": "Declaração de quitação de débitos condominiais (se aplicável)",
      "doc5": "Planta do imóvel aprovada pela prefeitura (opcional, mas recomendado)"
    },
    "disclaimer": {
      "title": "Aviso Importante",
      "text": "Esta é uma lista de referência. A documentação exata pode variar dependendo da localização do imóvel e das particularidades da negociação. Recomendamos sempre a consulta a um advogado ou corretor de imóveis."
    }
  },
  "footer": {
    "text": "Quallity Home Portal Imobiliário. Todos os direitos reservados."
  },
  "explorePage": {
    "showMap": "Mostrar Mapa",
    "hideMap": "Ocultar Mapa"
  }
};
const enTranslations = {
  "home": {
    "title": "Dream home? Find it here.",
    "description": "Explore our exclusive selection of properties that combine luxury, comfort, and prime location."
  },
  "hero": {
    "defaultTitle": "Your new home is here",
    "geminiPrompt": "Generate a short and inspiring title for a luxury real estate portal in English. The title should be sophisticated and inviting, with a maximum of 8 words. Return only the title, without quotes.",
    "tabs": {
      "buy": "Buy",
      "rent": "Rent",
      "season": "Seasonal"
    },
    "locationPlaceholder": "Enter the City",
    "drawOnMap": "Draw on map",
    "searchNearMe": "Search near me",
    "loadingLocation": "Fetching location...",
    "searchButton": "Search"
  },
  "initialGeolocationModal": {
    "title": "Use your location?",
    "message": "To enhance your experience and show properties near you, we can use your location. Your exact data is never shared.",
    "allowButton": "Allow",
    "denyButton": "Maybe Later"
  },
  "header": {
    "nav": {
      "buy": "Buy",
      "rent": "Rent",
      "season": "Seasonal",
      "advancedSearch": "Advanced Search"
    },
    "openMenu": "Open menu",
    "closeMenu": "Close menu",
    "menuTitle": "Menu",
    "logout": "Log out",
    "ownersDropdown": {
      "sell": {
        "guide": "Guide to selling",
        "documents": "Documents needed for sale"
      }
    },
    "searchDropdown": {
      "buy": {
        "title": "Looking to buy",
        "explore": "Explore neighborhoods and prices"
      },
      "rent": {
        "title": "Looking to rent",
        "explore": "Explore neighborhoods and prices"
      }
    }
  },
  "listings": {
    "title": "Featured Properties",
    "foundTitle": "Properties Found",
    "description": "Explore our exclusive selection of properties that combine luxury, comfort, and prime location.",
    "noResults": {
      "title": "No Properties Found",
      "description": "It seems there are no properties matching your search. Try changing the filters."
    },
    "viewAll": "View all properties"
  },
  "propertyCard": {
    "bedrooms": "Beds",
    "bathrooms": "Baths",
    "details": "Details"
  },
  "map": {
    "breadcrumbs": {
      "home": "Home",
      "proximitySearch": "Proximity Search",
      "drawOnMap": "Draw on Map"
    },
    "title": {
      "proximity": "Properties near you",
      "draw": "Draw your search in Salvador"
    },
    "drawButton": "Draw your area",
    "clearButton": "Clear Drawing",
    "drawingInProgress": "Drawing...",
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
  "publishJourney": {
    "stepper": {
      "step1": "1. Basic data",
      "step2": "2. Details",
      "step3": "3. Photos"
    },
    "title": "Publish Ad",
    "editTitle": "Edit Ad",
    "adPublishedSuccess": "Ad published successfully!",
    "errors": { "titleTooShort": "The ad title must be at least 10 characters long." },
    "limitExceeded": {
      "title": "File Limit Exceeded",
      "message": "You can upload a maximum of {count} files per ad."
    },
    "form": {
      "propertyType": {
        "label": "Choose the property type"
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
      "submitButton": "Verify address"
    },
    "verifiedAddress": {
      "label": "Property location",
      "edit": "Edit"
    },
     "detailsForm": {
      "title": "Ad Details",
      "adTitle": "Ad Title",
      "adTitlePlaceholder": "e.g., Amazing apartment with sea view in Barra",
      "aiTitlePrompt": "Based on the following real estate ad title, create a more attractive and compelling one. Keep it concise and professional, with a maximum of 10 words. Original title: '{title}'. Return only the new title, without quotes or additional text.",
      "aiTitleButtonLabel": "Enhance with AI",
      "aiTitleError": "Could not generate a title. Please check your connection or try again.",
      "aiDescriptionPrompt": "You are an expert real estate marketing agent. Your task is to create an irresistible property listing description in English. Use the detailed information provided below to write a flowing, professional, and inviting text. Naturally incorporate the details into the description, turning the list of features into a compelling narrative. Do not just list the features. The goal is to make the reader imagine themselves in the property. Be creative and focus on the benefits each feature offers.\n\n**Important Rules:**\n- **Incorporate all provided details.** Mention the number of bedrooms, bathrooms, area, and special features.\n- **Do not list features.** Describe them as part of a story (e.g., 'relax on the spacious balcony' instead of 'feature: balcony').\n- **Do not include the price.**\n- **Do not repeat the ad title.**\n- The final text should be between 2 and 4 paragraphs.\n\n**Property Information:**\n{details}",
      "aiDescriptionButtonLabel": "Enhance description with AI",
      "aiDescriptionError": "Could not generate a description. Please check your connection or try again.",
      "apartmentCharacteristics": "Property characteristics",
      "landCharacteristics": "Land Characteristics",
      "topography": "Topography",
      "flat": "Flat",
      "uphill": "Uphill",
      "downhill": "Downhill",
      "irregular": "Irregular",
      "zoning": "Zoning",
      "residential": "Residential",
      "commercial": "Commercial",
      "mixedUse": "Mixed-Use",
      "industrial": "Industrial",
      "walled": "Is it Walled?",
      "gatedCommunity": "Is it in a Gated Community?",
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
      "yes": "Yes",
      "no": "No",
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
      "adDescription": "Ad description",
      "descriptionPlaceholder": "Write the description in English here.",
      "continueToPhotosButton": "Continue and import photos",
      "sellTitle": "Details for Sale",
      "rentTitle": "Details for Rent",
      "seasonTitle": "Details for Seasonal Rent",
      "salePrice": "Sale Price",
      "iptuAnnual": "Property Tax (annual, optional)",
      "acceptsFinancing": "Accepts financing?",
      "occupationSituation": "Property occupation status",
      "rented": "Rented (with tenants)",
      "vacant": "Vacant (no tenants)",
      "monthlyRent": "Monthly Rent",
      "condoFee": "Condo fee (optional)",
      "iptuMonthly": "Property Tax (monthly, optional)",
      "rentalConditions": "Rental conditions",
      "deposit": "Deposit",
      "guarantor": "Guarantor",
      "insurance": "Rental Insurance",
      "petsAllowed": "Pets allowed?",
      "dailyRate": "Daily Rate",
      "minStay": "Minimum stay (days)",
      "maxGuests": "Maximum guests",
      "cleaningFee": "Cleaning fee (optional)",
      "availability": "Availability"
    },
    "photosForm": {
      "title": "Add photos, floor plans, and videos to your ad",
      "dragAndDrop": "Drag and drop your photos here or select them from your device",
      "addButton": "Add photos and videos",
      "limitsInfo": "Upload up to 10 files (photos and videos). Max 32MB per photo and 600MB per video.",
      "rememberTitle": "Remember that...",
      "tip1": "Photos, floor plans, and videos: attract more people to your ad",
      "tip2": "If you have a floor plan of the property, you can take a photo of it or draw it by hand and take a photograph of the drawing",
      "tip3": "When you take your photographs, make sure that each room is tidy, clean, and well-lit",
      "backButton": "Back",
      "publishButton": "Publish Ad",
      "updateButton": "Update Ad",
      "publishingButton": "Publishing...",
      "updatingButton": "Updating...",
      "removeFile": "Remove file"
    },
    "mediaValidation": {
      "dangerousFile": "File type not allowed for security reasons",
      "unsupportedType": "Unsupported file type. Use only images (JPG, PNG, WebP, GIF) or videos (MP4, MOV, AVI, WebM)",
      "imageTooLarge": "Image too large. Maximum size: 32MB",
      "videoTooLarge": "Video too large. Maximum size: 600MB",
      "tooManyFiles": "Maximum of 10 files allowed",
      "unreadableFile": "Could not read the file",
      "invalidImage": "File is not a valid image",
      "invalidVideo": "File is not a valid video",
      "readError": "Error reading the file",
      "validationFailed": "File validation failed",
      "someFilesRejected": "Some files were rejected due to validation issues"
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
  "myAdsPage": {
    "title": "Ads Dashboard",
    "breadcrumb": "Ads Dashboard",
    "noAds": {
      "title": "No ads published yet",
      "description": "Get started now and publish Quallity Home's properties."
    },
    "newAdButton": "Publish New Ad",
    "viewButton": "View",
    "editButton": "Edit",
    "deleteButton": "Delete",
    "deleteConfirm": "Are you sure you want to delete this ad? This action cannot be undone.",
    "adDeletedSuccess": "Ad deleted successfully!",
    "adDeletedError": "Error deleting ad.",
    "inactiveStatus": "Inactive",
    "publishSuccessTitle": "Success!",
    "publishSuccessMessage": "Your ad has been published successfully and is now visible to everyone.",
    "updateSuccessMessage": "Your ad has been updated successfully.",
    "shareButton": "Share"
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
    "linkCopiedTitle": "Link Copied!",
    "linkCopiedMessage": "The property link has been copied to your clipboard.",
    "linkCopyErrorTitle": "Copy Error",
    "linkCopyErrorMessage": "Could not copy the link. Please try again.",
    "networkError": "Connection error. Check your internet and try again.",
    "dataError": "Error processing data. Please try again in a few moments.",
    "authError": "Authentication error. Please log in again.",
    "generalError": "An unexpected error occurred. Please try again.",
    "loadMoreError": "Error loading more properties. Please try again."
  },
  "loading": {
    "general": "Loading...",
    "initialLoad": "Loading properties...",
    "loadingMore": "Loading more properties...",
    "refreshing": "Refreshing data...",
    "searching": "Searching properties..."
  },
  "documentsForSalePage": {
    "title": "Necessary Documents for Sale",
    "intro": "The sale of a property involves a series of documents to ensure the legal security of the transaction. Here is a general list of the documents typically required:",
    "seller": {
      "title": "Seller's Documents (and spouse, if any)",
      "doc1": "Identity document (ID and Taxpayer Number)",
      "doc2": "Proof of marital status (Birth or Marriage Certificate)",
      "doc3": "Proof of address",
      "doc4": "Certificates of no debt (federal, state, municipal, and labor)",
      "doc5": "Prenuptial agreement, if any"
    },
    "buyer": {
      "title": "Buyer's Documents (and spouse, if any)",
      "doc1": "Identity document (ID and Taxpayer Number)",
      "doc2": "Proof of marital status",
      "doc3": "Proof of address"
    },
    "property": {
      "title": "Property Documents",
      "doc1": "Updated property registration (issued by the Property Registry Office)",
      "doc2": "Certificate of Liens (to check for issues like mortgages or liens)",
      "doc3": "Certificate of no property tax debt (issued by the city hall)",
      "doc4": "Declaration of condominium fee payment (if applicable)",
      "doc5": "City-approved floor plan (optional, but recommended)"
    },
    "disclaimer": {
      "title": "Important Notice",
      "text": "This is a reference list. The exact documentation may vary depending on the property's location and the specifics of the negotiation. We always recommend consulting a lawyer or real estate agent."
    }
  },
  "footer": {
    "text": "Quallity Home Real Estate Portal. All rights reserved."
  },
  "explorePage": {
    "showMap": "Show Map",
    "hideMap": "Hide Map"
  }
};
const esTranslations = {
  // This is a placeholder. For a real app, you'd fill this out.
  ...enTranslations // Fallback to English
};

const translations = {
  pt: ptTranslations,
  en: enTranslations,
  es: esTranslations,
};

type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  const changeLanguage = useCallback((lang: Language) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  }, []);

  const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    let result: any = translations[language];

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        // Fallback to English if translation not found in current language
        let fallbackResult: any = translations['en'];
        for (const fk of keys) {
            if (fallbackResult && typeof fallbackResult === 'object' && fk in fallbackResult) {
                fallbackResult = fallbackResult[fk];
            } else {
                return key; // Return key if not found in fallback either
            }
        }
        result = fallbackResult;
        break;
      }
    }

    if (typeof result !== 'string') {
      return key;
    }

    let finalString = result;
    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            finalString = finalString.replace(`{${rKey}}`, String(replacements[rKey]));
        });
    }

    return finalString;
  }, [language]);

  const value = { language, changeLanguage, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};