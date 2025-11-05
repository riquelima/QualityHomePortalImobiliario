import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Property, Media, User } from '../../types';
import BoltIcon from '../icons/BoltIcon';
import BriefcaseIcon from '../icons/BriefcaseIcon';
import VerifiedIcon from '../icons/VerifiedIcon';
import PlusIcon from '../icons/PlusIcon';
import MinusIcon from '../icons/MinusIcon';
import PhotoIcon from '../icons/PhotoIcon';
import { supabase } from '../../supabaseClient';
import CloseIcon from '../icons/CloseIcon';
import { GoogleGenerativeAI } from '@google/generative-ai';
import AIIcon from '../icons/AIIcon';
import SpinnerIcon from '../icons/SpinnerIcon';
import { Autocomplete } from '@react-google-maps/api';
import LocationIcon from '../icons/LocationIcon';
import { PRODUCTION_URL, QUALLITY_HOME_USER_ID } from '../../config';
import { useGoogleMaps } from '../../contexts/GoogleMapsContext';
import AddressSearchByCEP from '../AddressSearchByCEP';
import { validateMediaFiles, type ValidationResult } from '../../utils/mediaValidation';

// Componente Section memoizado para evitar re-renderizações desnecessárias
const Section = React.memo<{ title: string; children: React.ReactNode }>(({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
));

Section.displayName = 'Section';

type MediaItem = File | (Media & { type: 'existing' });

interface PublishJourneyAdminProps {
  onBack: () => void;
  onSuccess?: (property: Property) => void;
  onError?: (error: string) => void;
  propertyToEdit?: Property | null;
  adminUser?: User | null;
}

const PublishJourneyAdmin: React.FC<PublishJourneyAdminProps> = ({
  onBack,
  onSuccess,
  onError,
  propertyToEdit,
  adminUser
}) => {
  const { t } = useLanguage();

  // Função para formatar preço
  const formatPrice = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseInt(numericValue));
  };

  // Função para desformatar preço para submissão
  const unformatCurrencyForSubmission = (formattedValue: string): number => {
    const numericValue = formattedValue.replace(/[^\d]/g, '');
    return parseInt(numericValue) || 0;
  };

  // Estado do formulário
  const [formData, setFormData] = useState({
    tipo_imovel: propertyToEdit?.tipo_imovel || 'Apartamento',
    operacao: propertyToEdit?.operacao || 'Venda',
    titulo: propertyToEdit?.titulo || '',
    descricao: propertyToEdit?.descricao || '',
    preco_venda: propertyToEdit?.preco_venda ? formatPrice(propertyToEdit.preco_venda.toString()) : '',
    preco_aluguel: propertyToEdit?.preco_aluguel ? formatPrice(propertyToEdit.preco_aluguel.toString()) : '',
    preco_temporada: propertyToEdit?.preco_temporada ? formatPrice(propertyToEdit.preco_temporada.toString()) : '',
    area_bruta: propertyToEdit?.area_bruta || '',
    area_util: propertyToEdit?.area_util || '',
    quartos: propertyToEdit?.quartos || 0,
    banheiros: propertyToEdit?.banheiros || 0,
    vagas_garagem: propertyToEdit?.vagas_garagem || 0,
    caracteristicas_imovel: propertyToEdit?.caracteristicas_imovel || [],
    caracteristicas_condominio: propertyToEdit?.caracteristicas_condominio || [],
    condominio: propertyToEdit?.condominio ? formatPrice(propertyToEdit.condominio.toString()) : '',
    iptu: propertyToEdit?.iptu ? formatPrice(propertyToEdit.iptu.toString()) : '',
    aceita_financiamento: propertyToEdit?.aceita_financiamento || false,
    aceita_fgts: propertyToEdit?.aceita_fgts || false,
    mobiliado: propertyToEdit?.mobiliado || false,
    pet_friendly: propertyToEdit?.pet_friendly || false,
    // Campos específicos por tipo
    topografia: propertyToEdit?.topografia || '',
    zoneamento: propertyToEdit?.zoneamento || '',
    coordinates: propertyToEdit?.coordinates || { lat: 0, lng: 0 },
  });

  // Estados de endereço
  const [address, setAddress] = useState({
    cep: propertyToEdit?.cep || '',
    street: propertyToEdit?.rua || '',
    neighborhood: propertyToEdit?.bairro || '',
    city: propertyToEdit?.cidade || '',
    state: propertyToEdit?.estado || '',
    number: propertyToEdit?.numero || '',
    complement: propertyToEdit?.complemento || '',
    latitude: propertyToEdit?.latitude?.toString() || '',
    longitude: propertyToEdit?.longitude?.toString() || '',
    fullAddress: propertyToEdit?.endereco_completo || '',
  });

  // Estados de arquivos
  const [files, setFiles] = useState<MediaItem[]>([]);
  const [existingFiles, setExistingFiles] = useState<Media[]>(propertyToEdit?.media || []);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingAddress, setIsVerifyingAddress] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [cityAutocomplete, setCityAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [streetAutocomplete, setStreetAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [cityBounds, setCityBounds] = useState<google.maps.LatLngBounds | null>(null);

  // Google Maps
  const { isLoaded, loadError } = useGoogleMaps();

  // Tipos de imóveis
  const propertyTypes = [
    'Apartamento',
    'Casa',
    'Quarto',
    'Escritório',
    'Terreno'
  ];

  // Mapeamento de operações para títulos
  const operationTitleKeyMap = {
    'Venda': 'sale',
    'Aluguel': 'rent',
    'Temporada': 'season'
  };

  // Opções de características
  const caracteristicasImovelOptions = [
    'builtInWardrobes',
    'airConditioning', 
    'terrace',
    'balcony',
    'garage',
    'mobiliado',
    'cozinhaEquipada',
    'suite',
    'escritorio'
  ];

  const caracteristicasCondominioOptions = [
    'pool',
    'greenArea',
    'portaria24h',
    'academia',
    'parqueInfantil',
    'salaoDeFestas',
    'quadraEsportiva',
    'hasElevator'
  ];

  // Função de validação
  const validateDetails = () => {
    if (formData.titulo.length < 10) {
      return { isValid: false, message: 'O título deve ter pelo menos 10 caracteres.' };
    }

    const operacao = formData.operacao;
    if (operacao === 'Venda' && !formData.preco_venda) {
      return { isValid: false, message: 'Preço de venda é obrigatório.' };
    }
    if (operacao === 'Aluguel' && !formData.preco_aluguel) {
      return { isValid: false, message: 'Preço de aluguel é obrigatório.' };
    }
    if (operacao === 'Temporada' && !formData.preco_temporada) {
      return { isValid: false, message: 'Preço de temporada é obrigatório.' };
    }

    if (!formData.area_bruta) {
      return { isValid: false, message: 'Área bruta é obrigatória.' };
    }

    return { isValid: true, message: '' };
  };

  // Handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberChange = (field: string, increment: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: Math.max(0, (prev[field as keyof typeof prev] as number) + (increment ? 1 : -1))
    }));
  };

  const handlePropertyTypeChange = (type: string) => {
    setFormData(prev => {
      const newData = { ...prev, tipo_imovel: type };
      
      // Remover campos específicos baseado no tipo
      if (type === 'Terreno') {
        newData.quartos = 0;
        newData.banheiros = 0;
        newData.caracteristicas_imovel = [];
      }
      
      return newData;
    });
  };

  const handleAddressSubmit = async (addressData: any, isComplete: boolean) => {
    if (!isComplete) return;

    setIsVerifyingAddress(true);
    try {
      // Geocodificar usando Nominatim
      const query = `${addressData.number} ${addressData.street}, ${addressData.neighborhood}, ${addressData.city}, ${addressData.state}, Brasil`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const coordinates = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };

        // Aceitar automaticamente o endereço sem modal de confirmação
        setFormData(prev => ({ ...prev, coordinates }));
        setAddress(addressData);
      } else {
        onError?.('Não foi possível encontrar as coordenadas para este endereço.');
      }
    } catch (error) {
      console.error('Erro ao geocodificar:', error);
      onError?.('Erro ao verificar o endereço. Tente novamente.');
    } finally {
      setIsVerifyingAddress(false);
    }
  };



  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (selectedFiles.length === 0) return;

    // Validar arquivos
    const validation = await validateMediaFiles(selectedFiles, files.length + existingFiles.length);
    
    if (!validation.isValid) {
      const errorMessage = validation.errors.length > 0 
        ? `Erro nos arquivos: ${validation.errors.map(e => e.type).join(', ')}`
        : 'Erro na validação dos arquivos';
      onError?.(errorMessage);
      return;
    }

    setFiles(prev => [...prev, ...validation.validFiles]);
  };

  const removeFile = (fileToRemove: MediaItem) => {
    if ('type' in fileToRemove && fileToRemove.type === 'existing') {
      const existingFile = fileToRemove as Media & { type: 'existing' };
      setFilesToRemove(prev => [...prev, existingFile.id]);
      setExistingFiles(prev => prev.filter(f => f.id !== existingFile.id));
    } else {
      setFiles(prev => prev.filter(f => f !== fileToRemove));
    }
  };

  // Função para submeter o formulário
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Endereço é opcional: não bloquear submissão se faltarem campos

    // Validar detalhes
    const validation = validateDetails();
    if (!validation.isValid) {
      onError?.(validation.message);
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar dados para o banco
      // Montar endereço completo de forma resiliente quando houver partes disponíveis
      const addressParts = [address.street, address.number, address.complement, address.neighborhood]
        .filter(Boolean)
        .join(', ');
      const cityState = [address.city, address.state].filter(Boolean).join(' - ');
      const fullAddress = [addressParts, cityState].filter(Boolean).join(', ');

      const propertyDataForDb = {
        anunciante_id: adminUser?.id || QUALLITY_HOME_USER_ID,
        titulo: formData.titulo,
        descricao: formData.descricao,
        tipo_imovel: formData.tipo_imovel,
        tipo_operacao: formData.operacao.toLowerCase(),
        preco: formData.operacao === 'Venda' ? unformatCurrencyForSubmission(formData.preco_venda) : 
               formData.operacao === 'Aluguel' ? unformatCurrencyForSubmission(formData.preco_aluguel) :
               unformatCurrencyForSubmission(formData.preco_temporada),
        area_bruta: parseFloat(formData.area_bruta),
        area_util: formData.area_util ? parseFloat(formData.area_util) : null,
        quartos: formData.quartos,
        banheiros: formData.banheiros,
        caracteristicas_imovel: formData.caracteristicas_imovel,
        caracteristicas_condominio: formData.caracteristicas_condominio,
        taxa_condominio: formData.condominio ? unformatCurrencyForSubmission(formData.condominio) : null,
        valor_iptu: formData.iptu ? unformatCurrencyForSubmission(formData.iptu) : null,
        aceita_financiamento: formData.aceita_financiamento,
        permite_animais: formData.pet_friendly,
        cep: address.cep || null,
        rua: address.street || null,
        numero: address.number || null,
        complemento: address.complement || null,
        bairro: address.neighborhood || null,
        cidade: address.city || null,
        estado: address.state || null,
        endereco_completo: fullAddress || null,
        latitude: formData.coordinates?.lat ?? null,
        longitude: formData.coordinates?.lng ?? null,
        // Campos específicos por tipo
        ...(formData.tipo_imovel === 'Terreno' && {
          topografia: formData.topografia,
          zoneamento: formData.zoneamento,
        }),
        data_atualizacao: new Date().toISOString(),
      };

      let propertyResult;

      if (propertyToEdit) {
        // Atualizar propriedade existente
        const { data, error } = await supabase
          .from('imoveis')
          .update(propertyDataForDb)
          .eq('id', propertyToEdit.id)
          .select()
          .single();

        if (error) throw error;
        propertyResult = data;
      } else {
        // Criar nova propriedade
        const { data, error } = await supabase
          .from('imoveis')
          .insert([{
            ...propertyDataForDb,
            data_publicacao: new Date().toISOString(),
          }])
          .select()
          .single();

        if (error) throw error;
        propertyResult = data;
      }

      // Remover mídias marcadas para remoção
      if (filesToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('midias_imovel')
          .delete()
          .in('id', filesToRemove);

        if (deleteError) {
          console.error('Erro ao remover mídias:', deleteError);
        }
      }

      // Upload de novas mídias
      if (files.length > 0) {
        for (const file of files) {
          if (file instanceof File) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${propertyResult.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('midia')
              .upload(fileName, file);

            if (uploadError) {
              console.error('Erro no upload:', uploadError);
              continue;
            }

            const { data: urlData } = supabase.storage
              .from('midia')
              .getPublicUrl(fileName);

            await supabase
              .from('midias_imovel')
              .insert([{
                imovel_id: propertyResult.id,
                url: urlData.publicUrl,
                tipo: file.type.startsWith('video') ? 'video' : 'imagem',
                data_upload: new Date().toISOString(),
              }]);
          }
        }
      }

      // Atualizar as colunas images e videos na tabela imoveis para sincronização
      const { data: mediasData } = await supabase
        .from('midias_imovel')
        .select('url, tipo')
        .eq('imovel_id', propertyResult.id);

      if (mediasData) {
        const images = mediasData.filter(m => m.tipo === 'imagem').map(m => m.url);
        const videos = mediasData.filter(m => m.tipo === 'video').map(m => m.url);

        await supabase
          .from('imoveis')
          .update({
            images: images.length > 0 ? images : null,
            videos: videos.length > 0 ? videos : null,
          })
          .eq('id', propertyResult.id);
      }

      // Gerar URL de compartilhamento para novas propriedades
      if (!propertyToEdit) {
        const shareUrl = `${PRODUCTION_URL}/#property/${propertyResult.id}`;
        console.log('URL de compartilhamento:', shareUrl);
      }

      onSuccess?.(propertyResult);
    } catch (error) {
      console.error('Erro ao salvar propriedade:', error);
      onError?.('Erro ao salvar a propriedade. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para gerar título com IA
  const generateAITitle = async () => {
    if (!formData.tipo_imovel || !formData.operacao) {
      onError?.('Selecione o tipo de imóvel e operação primeiro.');
      return;
    }

    setIsGeneratingTitle(true);
    try {
const genAI = new GoogleGenerativeAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCsX9l10XCu3TtSCU1BSx-qOYrwUKYw2xk' });
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Gere um título atrativo para um anúncio de ${formData.tipo_imovel.toLowerCase()} para ${formData.operacao.toLowerCase()} com as seguintes características:
      - Tipo: ${formData.tipo_imovel}
      - Operação: ${formData.operacao}
      - Quartos: ${formData.quartos}
      - Banheiros: ${formData.banheiros}
      - Área: ${formData.area_bruta}m²
      - Localização: ${address.neighborhood}, ${address.city}
      
      O título deve ter entre 30-60 caracteres, ser atrativo e incluir informações relevantes. Responda apenas com o título, sem aspas ou formatação adicional.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const title = response.text().trim();

      if (title) {
        handleInputChange('titulo', title);
      }
    } catch (error) {
      console.error('Erro ao gerar título:', error);
      onError?.('Erro ao gerar título. Tente novamente.');
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  // Função para gerar descrição com IA
  const generateAIDescription = async () => {
    if (!formData.tipo_imovel || !formData.operacao) {
      onError?.('Selecione o tipo de imóvel e operação primeiro.');
      return;
    }

    setIsGeneratingDescription(true);
    try {
const genAI = new GoogleGenerativeAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCsX9l10XCu3TtSCU1BSx-qOYrwUKYw2xk' });
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Gere uma descrição atrativa para um anúncio de ${formData.tipo_imovel.toLowerCase()} para ${formData.operacao.toLowerCase()} com as seguintes características:
      - Tipo: ${formData.tipo_imovel}
      - Operação: ${formData.operacao}
      - Quartos: ${formData.quartos}
      - Banheiros: ${formData.banheiros}
      - Área: ${formData.area_bruta}m²
      - Localização: ${address.neighborhood}, ${address.city}
      - Características: ${formData.caracteristicas_imovel.join(', ')}
      
      A descrição deve ter entre 100-300 palavras, ser persuasiva e destacar os pontos fortes do imóvel. Use linguagem profissional mas acessível.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const description = response.text().trim();

      if (description) {
        handleInputChange('descricao', description);
      }
    } catch (error) {
      console.error('Erro ao gerar descrição:', error);
      onError?.('Erro ao gerar descrição. Tente novamente.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Section component foi movido para fora do componente principal

  // Combinar arquivos existentes e novos para exibição
  const allFiles = [
    ...existingFiles.map(file => ({ ...file, type: 'existing' as const })),
    ...files
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={onBack}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-brand-red"
              >
                Administração
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {propertyToEdit ? 'Editar Imóvel' : 'Publicar Imóvel'}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informações Principais */}
              <Section title="Informações Principais">
                {/* Tipo de Operação */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de Operação *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Venda', 'Aluguel', 'Temporada'].map((op) => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => handleInputChange('operacao', op)}
                        className={`p-4 rounded-lg border-2 text-center font-medium transition-all ${
                          formData.operacao === op
                            ? 'border-brand-red !bg-brand-red !text-white font-semibold'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-brand-red'
                        }`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipo de Imóvel */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de Imóvel *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {propertyTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handlePropertyTypeChange(type)}
                        className={`p-3 rounded-lg border-2 text-center font-medium transition-all ${
                          formData.tipo_imovel === type
                            ? 'border-brand-red !bg-brand-red !text-white font-semibold'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-brand-red'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Título */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Título do Anúncio *
                    </label>
                    <button
                      type="button"
                      onClick={generateAITitle}
                      disabled={isGeneratingTitle}
                      className="flex items-center space-x-1 text-sm text-brand-red hover:text-brand-dark disabled:opacity-50"
                    >
                      {isGeneratingTitle ? (
                        <SpinnerIcon className="w-4 h-4 animate-spin" />
                      ) : (
                        <AIIcon className="w-4 h-4" />
                      )}
                      <span>{isGeneratingTitle ? 'Gerando...' : 'Gerar com IA'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    placeholder="Ex: Apartamento 2 quartos no centro da cidade"
                    maxLength={100}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.titulo.length}/100 caracteres
                  </p>
                </div>

                {/* Descrição */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Descrição
                    </label>
                    <button
                      type="button"
                      onClick={generateAIDescription}
                      disabled={isGeneratingDescription}
                      className="flex items-center space-x-1 text-sm text-brand-red hover:text-brand-dark disabled:opacity-50"
                    >
                      {isGeneratingDescription ? (
                        <SpinnerIcon className="w-4 h-4 animate-spin" />
                      ) : (
                        <AIIcon className="w-4 h-4" />
                      )}
                      <span>{isGeneratingDescription ? 'Gerando...' : 'Gerar com IA'}</span>
                    </button>
                  </div>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    rows={4}
                    placeholder="Descreva as principais características do imóvel..."
                    maxLength={1000}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.descricao.length}/1000 caracteres
                  </p>
                </div>

                {/* Preços */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {formData.operacao === 'Venda' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preço de Venda *
                      </label>
                      <input
                        type="text"
                        value={formData.preco_venda}
                        onChange={(e) => handleInputChange('preco_venda', formatPrice(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                        placeholder="R$ 0,00"
                      />
                    </div>
                  )}
                  
                  {formData.operacao === 'Aluguel' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preço de Aluguel *
                      </label>
                      <input
                        type="text"
                        value={formData.preco_aluguel}
                        onChange={(e) => handleInputChange('preco_aluguel', formatPrice(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                        placeholder="R$ 0,00"
                      />
                    </div>
                  )}
                  
                  {formData.operacao === 'Temporada' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preço de Temporada *
                      </label>
                      <input
                        type="text"
                        value={formData.preco_temporada}
                        onChange={(e) => handleInputChange('preco_temporada', formatPrice(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                        placeholder="R$ 0,00"
                      />
                    </div>
                  )}

                  {(formData.operacao === 'Aluguel' || formData.operacao === 'Temporada') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Condomínio
                        </label>
                        <input
                          type="text"
                          value={formData.condominio}
                          onChange={(e) => handleInputChange('condominio', formatPrice(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                          placeholder="R$ 0,00"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          IPTU
                        </label>
                        <input
                          type="text"
                          value={formData.iptu}
                          onChange={(e) => handleInputChange('iptu', formatPrice(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                          placeholder="R$ 0,00"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Áreas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área Bruta (m²) *
                    </label>
                    <input
                      type="number"
                      value={formData.area_bruta}
                      onChange={(e) => handleInputChange('area_bruta', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área Útil (m²)
                    </label>
                    <input
                      type="number"
                      value={formData.area_util}
                      onChange={(e) => handleInputChange('area_util', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Campos específicos para Terreno */}
                {formData.tipo_imovel === 'Terreno' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Topografia
                      </label>
                      <select
                        value={formData.topografia}
                        onChange={(e) => handleInputChange('topografia', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      >
                        <option value="">Selecione</option>
                        <option value="Plano">Plano</option>
                        <option value="Aclive">Aclive</option>
                        <option value="Declive">Declive</option>
                        <option value="Irregular">Irregular</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zoneamento
                      </label>
                      <select
                        value={formData.zoneamento}
                        onChange={(e) => handleInputChange('zoneamento', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      >
                        <option value="">Selecione</option>
                        <option value="Residencial">Residencial</option>
                        <option value="Comercial">Comercial</option>
                        <option value="Industrial">Industrial</option>
                        <option value="Misto">Misto</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Quartos, Banheiros, Vagas (não para Terreno) */}
                {formData.tipo_imovel !== 'Terreno' && (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quartos
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => handleNumberChange('quartos', false)}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-medium w-8 text-center">{formData.quartos}</span>
                        <button
                          type="button"
                          onClick={() => handleNumberChange('quartos', true)}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Banheiros
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => handleNumberChange('banheiros', false)}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-medium w-8 text-center">{formData.banheiros}</span>
                        <button
                          type="button"
                          onClick={() => handleNumberChange('banheiros', true)}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vagas
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => handleNumberChange('vagas_garagem', false)}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-medium w-8 text-center">{formData.vagas_garagem}</span>
                        <button
                          type="button"
                          onClick={() => handleNumberChange('vagas_garagem', true)}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Opções adicionais */}
                <div className="space-y-3">
                  {formData.operacao === 'Venda' && (
                    <>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.aceita_financiamento}
                          onChange={(e) => handleInputChange('aceita_financiamento', e.target.checked)}
                          className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
                        />
                        <span className="ml-2 text-sm text-gray-700">Aceita financiamento</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.aceita_fgts}
                          onChange={(e) => handleInputChange('aceita_fgts', e.target.checked)}
                          className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
                        />
                        <span className="ml-2 text-sm text-gray-700">Aceita FGTS</span>
                      </label>
                    </>
                  )}
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.mobiliado}
                      onChange={(e) => handleInputChange('mobiliado', e.target.checked)}
                      className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
                    />
                    <span className="ml-2 text-sm text-gray-700">Mobiliado</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.pet_friendly}
                      onChange={(e) => handleInputChange('pet_friendly', e.target.checked)}
                      className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
                    />
                    <span className="ml-2 text-sm text-gray-700">Aceita pets</span>
                  </label>
                </div>
              </Section>

              {/* Localização */}
              <Section title="Localização">
                <div className="mb-4">
                  {address.fullAddress ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <VerifiedIcon className="w-5 h-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Endereço verificado</p>
                          <p className="text-sm text-green-600">{address.fullAddress}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <LocationIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <p className="text-sm text-blue-800">Preencha o endereço para verificar a localização</p>
                      </div>
                    </div>
                  )}
                </div>

                <AddressSearchByCEP
                  onAddressChange={handleAddressSubmit}
                  isLoaded={isLoaded}
                  initialAddress={address}
                />
              </Section>

              {/* Características do Imóvel */}
              {formData.tipo_imovel !== 'Terreno' && (
                <Section title="Características do Imóvel">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {caracteristicasImovelOptions.map((feature) => (
                      <label key={feature} className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.caracteristicas_imovel.includes(feature)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleInputChange('caracteristicas_imovel', [...formData.caracteristicas_imovel, feature]);
                            } else {
                              handleInputChange('caracteristicas_imovel', formData.caracteristicas_imovel.filter(f => f !== feature));
                            }
                          }}
                          className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
                        />
                        <span className="text-sm">{t(`publishJourney.detailsForm.${feature}`)}</span>
                      </label>
                    ))}
                  </div>
                </Section>
              )}

              {/* Características do Condomínio */}
              <Section title="Características do Condomínio">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {caracteristicasCondominioOptions.map((feature) => (
                    <label key={feature} className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.caracteristicas_condominio.includes(feature)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange('caracteristicas_condominio', [...formData.caracteristicas_condominio, feature]);
                          } else {
                            handleInputChange('caracteristicas_condominio', formData.caracteristicas_condominio.filter(f => f !== feature));
                          }
                        }}
                        className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
                      />
                      <span className="text-sm">{t(`publishJourney.detailsForm.${feature}`)}</span>
                    </label>
                  ))}
                </div>
              </Section>

              {/* Fotos e Vídeos */}
              <Section title="Fotos e Vídeos">
                <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Arraste e solte ou clique para adicionar fotos e vídeos</p>
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-brand-red text-white font-semibold py-2 px-4 rounded-md hover:bg-brand-dark transition-opacity inline-block mt-4">
                    <span>Adicionar Arquivos</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept="image/*,video/*" />
                  </label>
                  <p className="mt-2 text-xs text-gray-500">PNG, JPG, MP4 até 10MB cada</p>
                </div>

                {allFiles.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {allFiles.map((file, index) => {
                      const isExisting = 'type' in file && file.type === 'existing';
                      const url = isExisting ? (file as { url: string }).url : URL.createObjectURL(file as File);
                      const fileType = isExisting ? (file as { tipo: string }).tipo : (file as File).type;

                      return (
                        <div key={index} className="relative group aspect-w-1 aspect-h-1">
                          {fileType.startsWith('video') ? (
                            <video src={url} className="w-full h-full object-cover rounded-md shadow-sm" controls />
                          ) : (
                            <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-md shadow-sm" />
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                            <button 
                              type="button" 
                              onClick={() => removeFile(file)} 
                              className="absolute top-1 right-1 bg-white/70 text-brand-red rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" 
                              aria-label="Remover arquivo"
                            >
                              <CloseIcon className="w-4 h-4"/>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Section>

              {/* Botões de Ação */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button 
                  type="button" 
                  onClick={onBack}
                  className="flex-1 order-2 sm:order-1 text-center bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 order-1 sm:order-2 bg-brand-red text-white font-bold py-3 px-4 rounded-md hover:bg-brand-dark transition-colors disabled:bg-gray-400 disabled:cursor-wait flex items-center justify-center shadow-md"
                >
                  {isSubmitting && <SpinnerIcon className="w-5 h-5 animate-spin mr-2" />}
                  {isSubmitting
                    ? (propertyToEdit ? 'Atualizando...' : 'Publicando...')
                    : (propertyToEdit ? 'Atualizar Imóvel' : 'Publicar Imóvel')
                  }
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar com informações úteis */}
          <div className="hidden lg:block lg:col-span-1 mt-8 lg:mt-0">
            <div className="sticky top-24 space-y-6">
              {/* Divs removidas conforme solicitado */}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PublishJourneyAdmin;