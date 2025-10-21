import React, { useState, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Property, User } from '../../types';
import { supabase } from '../../supabaseClient';
import { PRODUCTION_URL } from '../../config';
import PlusIcon from '../icons/PlusIcon';
import MinusIcon from '../icons/MinusIcon';
import PhotoIcon from '../icons/PhotoIcon';
import CloseIcon from '../icons/CloseIcon';
import SpinnerIcon from '../icons/SpinnerIcon';
import AIIcon from '../icons/AIIcon';
import { GoogleGenAI } from '@google/genai';

interface PublishFormProps {
  onBack: () => void;
  onSuccess: (status: 'published' | 'updated') => void;
  onError: (message: string) => void;
  propertyToEdit?: Property | null;
  adminUser: User | null;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'AIzaSyCsX9l10XCu3TtSCU1BSx-qOYrwUKYw2xk' });

const generateContentWithRetry = async (prompt: string, maxRetries = 3) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] },
      });
      return response;
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Failed to generate content after multiple retries.");
};

const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined || isNaN(price)) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
};

const unformatCurrencyForSubmission = (value: string): number | null => {
  if (!value || typeof value !== 'string') return null;
  const numberString = value.replace(/[R$\s.]/g, '').replace(',', '.');
  const numberValue = parseFloat(numberString);
  return isNaN(numberValue) ? null : numberValue;
};

export const PublishForm: React.FC<PublishFormProps> = ({
  onBack,
  onSuccess,
  onError,
  propertyToEdit,
  adminUser
}) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    propertyType: propertyToEdit?.tipo_imovel || 'Apartamento',
    operation: propertyToEdit?.tipo_operacao || 'venda',
    city: propertyToEdit?.cidade || '',
    street: propertyToEdit?.rua || '',
    number: propertyToEdit?.numero || '',
    title: propertyToEdit?.titulo || '',
    description: propertyToEdit?.descricao || '',
    grossArea: propertyToEdit?.area_bruta ? String(propertyToEdit.area_bruta) : '',
    netArea: propertyToEdit?.area_util ? String(propertyToEdit.area_util) : '',
    bedrooms: propertyToEdit?.quartos || 1,
    bathrooms: propertyToEdit?.banheiros || 1,
    salePrice: propertyToEdit?.tipo_operacao === 'venda' ? formatPrice(propertyToEdit.preco) : '',
    monthlyRent: propertyToEdit?.tipo_operacao === 'aluguel' ? formatPrice(propertyToEdit.preco) : '',
    dailyRate: propertyToEdit?.tipo_operacao === 'temporada' ? formatPrice(propertyToEdit.preco) : '',
    condoFee: propertyToEdit?.taxa_condominio ? formatPrice(propertyToEdit.taxa_condominio) : '',
    iptuAnnual: propertyToEdit?.valor_iptu && propertyToEdit.tipo_operacao === 'venda' ? formatPrice(propertyToEdit.valor_iptu) : '',
    iptuMonthly: propertyToEdit?.valor_iptu && propertyToEdit.tipo_operacao !== 'venda' ? formatPrice(propertyToEdit.valor_iptu) : '',
    homeFeatures: propertyToEdit?.caracteristicas_imovel || [],
    buildingFeatures: propertyToEdit?.caracteristicas_condominio || [],
    hasElevator: propertyToEdit?.possui_elevador ?? null,
    acceptsFinancing: propertyToEdit?.aceita_financiamento ?? null,
    occupationSituation: propertyToEdit?.situacao_ocupacao || 'vacant',
    coordinates: propertyToEdit ? { lat: propertyToEdit.latitude, lng: propertyToEdit.longitude } : null,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureToggle = (feature: string, type: 'home' | 'building') => {
    const field = type === 'home' ? 'homeFeatures' : 'buildingFeatures';
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(feature)
        ? prev[field].filter(f => f !== feature)
        : [...prev[field], feature]
    }));
  };

  const generateAIDescription = useCallback(async () => {
    if (!formData.title) return;
    
    setIsGeneratingDescription(true);
    try {
      const details = `
        Tipo: ${formData.propertyType}
        Operação: ${formData.operation}
        Localização: ${formData.city}, ${formData.street}, ${formData.number}
        Quartos: ${formData.bedrooms}
        Banheiros: ${formData.bathrooms}
        Área Bruta: ${formData.grossArea}m²
        Área Útil: ${formData.netArea}m²
        Características: ${formData.homeFeatures.join(', ')}
        Condomínio: ${formData.buildingFeatures.join(', ')}
      `;
      
      const prompt = `Crie uma descrição atrativa para este imóvel: ${details}. Mantenha profissional e convidativa.`;
      const response = await generateContentWithRetry(prompt);
      
      if (response?.text) {
        handleInputChange('description', response.text.trim());
      }
    } catch (error) {
      console.error("Erro ao gerar descrição:", error);
    } finally {
      setIsGeneratingDescription(false);
    }
  }, [formData]);

  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files).slice(0, 10 - uploadedFiles.length);
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.city) {
      onError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload de imagens
      const uploadedUrls: Array<{ url: string; type: string }> = [];
      
      for (const file of uploadedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `property-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        uploadedUrls.push({
          url: publicUrl,
          type: file.type.startsWith('video/') ? 'video' : 'image'
        });
      }

      // Preparar dados para o banco
      const propertyData = {
        tipo_imovel: formData.propertyType,
        tipo_operacao: formData.operation,
        titulo: formData.title,
        descricao: formData.description,
        cidade: formData.city,
        rua: formData.street,
        numero: formData.number,
        endereco_completo: `${formData.street}, ${formData.number}, ${formData.city}`,
        latitude: formData.coordinates?.lat || 0,
        longitude: formData.coordinates?.lng || 0,
        quartos: formData.bedrooms,
        banheiros: formData.bathrooms,
        area_bruta: formData.grossArea ? Number(formData.grossArea) : null,
        area_util: formData.netArea ? Number(formData.netArea) : null,
        preco: unformatCurrencyForSubmission(
          formData.operation === 'venda' ? formData.salePrice :
          formData.operation === 'aluguel' ? formData.monthlyRent : formData.dailyRate
        ),
        taxa_condominio: unformatCurrencyForSubmission(formData.condoFee),
        valor_iptu: unformatCurrencyForSubmission(formData.iptuAnnual || formData.iptuMonthly),
        caracteristicas_imovel: formData.homeFeatures,
        caracteristicas_condominio: formData.buildingFeatures,
        possui_elevador: formData.hasElevator,
        aceita_financiamento: formData.acceptsFinancing,
        situacao_ocupacao: formData.occupationSituation,
        status: 'ativo',
        usuario_id: adminUser?.id
      };

      if (propertyToEdit) {
        // Atualizar propriedade existente
        const { error } = await supabase
          .from('imoveis')
          .update(propertyData)
          .eq('id', propertyToEdit.id);
        
        if (error) throw error;
        
        // Atualizar mídias se necessário
        if (uploadedUrls.length > 0) {
          const mediaToInsert = uploadedUrls.map(media => ({
            imovel_id: propertyToEdit.id,
            url: media.url,
            tipo: media.type
          }));
          
          const { error: mediaError } = await supabase
            .from('midias_imovel')
            .insert(mediaToInsert);
          
          if (mediaError) throw mediaError;
        }
        
        onSuccess('updated');
      } else {
        // Criar nova propriedade
        const { data: insertedProperty, error } = await supabase
          .from('imoveis')
          .insert(propertyData)
          .select('id')
          .single();
        
        if (error) throw error;

        // Gerar URL de compartilhamento
        const shareUrl = `${PRODUCTION_URL}/?page=propertyDetail&propertyId=${insertedProperty.id}`;
        await supabase
          .from('imoveis')
          .update({ share_url: shareUrl })
          .eq('id', insertedProperty.id);

        // Inserir mídias
        if (uploadedUrls.length > 0) {
          const mediaToInsert = uploadedUrls.map(media => ({
            imovel_id: insertedProperty.id,
            url: media.url,
            tipo: media.type
          }));
          
          const { error: mediaError } = await supabase
            .from('midias_imovel')
            .insert(mediaToInsert);
          
          if (mediaError) throw mediaError;
        }
        
        onSuccess('published');
      }
    } catch (error: any) {
      console.error('Erro ao salvar propriedade:', error);
      onError(error.message || 'Erro ao salvar propriedade');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            {propertyToEdit ? 'Editar Anúncio' : 'Publicar Novo Anúncio'}
          </h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            {propertyToEdit ? 'Atualize as informações do seu anúncio' : 'Crie um anúncio atrativo para seu imóvel'}
          </p>
        </div>
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <CloseIcon className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-6 lg:mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-xs lg:text-sm font-medium ${
                step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`w-8 lg:w-16 h-1 mx-1 lg:mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
        {/* Step 1: Informações Básicas */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações Básicas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Imóvel
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Apartamento">Apartamento</option>
                  <option value="Casa">Casa</option>
                  <option value="Terreno">Terreno</option>
                  <option value="Comercial">Comercial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operação
                </label>
                <select
                  value={formData.operation}
                  onChange={(e) => handleInputChange('operation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="venda">Venda</option>
                  <option value="aluguel">Aluguel</option>
                  <option value="temporada">Temporada</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Anúncio
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ex: Apartamento incrível com vista para o mar"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Salvador"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rua
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="Rua das Flores"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número
                </label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => handleInputChange('number', e.target.value)}
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={nextStep}
                disabled={!formData.title || !formData.city}
                className="px-4 lg:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Detalhes */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Detalhes do Imóvel</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quartos
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('bedrooms', Math.max(0, formData.bedrooms - 1))}
                    className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 border border-gray-300 rounded-md text-center min-w-[50px]">
                    {formData.bedrooms}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInputChange('bedrooms', formData.bedrooms + 1)}
                    className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banheiros
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('bathrooms', Math.max(1, formData.bathrooms - 1))}
                    className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 border border-gray-300 rounded-md text-center min-w-[50px]">
                    {formData.bathrooms}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInputChange('bathrooms', formData.bathrooms + 1)}
                    className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área Bruta (m²)
                </label>
                <input
                  type="number"
                  value={formData.grossArea}
                  onChange={(e) => handleInputChange('grossArea', e.target.value)}
                  placeholder="120"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área Útil (m²)
                </label>
                <input
                  type="number"
                  value={formData.netArea}
                  onChange={(e) => handleInputChange('netArea', e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {formData.operation === 'venda' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço de Venda
                  </label>
                  <input
                    type="text"
                    value={formData.salePrice}
                    onChange={(e) => handleInputChange('salePrice', e.target.value)}
                    placeholder="R$ 500.000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {formData.operation === 'aluguel' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aluguel Mensal
                  </label>
                  <input
                    type="text"
                    value={formData.monthlyRent}
                    onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
                    placeholder="R$ 2.500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {formData.operation === 'temporada' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diária
                  </label>
                  <input
                    type="text"
                    value={formData.dailyRate}
                    onChange={(e) => handleInputChange('dailyRate', e.target.value)}
                    placeholder="R$ 150"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taxa de Condomínio
                </label>
                <input
                  type="text"
                  value={formData.condoFee}
                  onChange={(e) => handleInputChange('condoFee', e.target.value)}
                  placeholder="R$ 300"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva as principais características do imóvel..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={generateAIDescription}
                disabled={isGeneratingDescription || !formData.title}
                className="absolute bottom-2 right-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-md flex items-center hover:bg-blue-200 disabled:opacity-50"
              >
                {isGeneratingDescription ? (
                  <SpinnerIcon className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <AIIcon className="w-4 h-4 mr-1" />
                )}
                Gerar com IA
              </button>
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-4 lg:px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm lg:text-base"
              >
                Anterior
              </button>
              <button
                onClick={nextStep}
                className="px-4 lg:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm lg:text-base"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Fotos */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Fotos do Imóvel</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Arraste e solte suas fotos aqui ou clique para selecionar
              </p>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Selecionar Arquivos
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Máximo 10 arquivos. Formatos: JPG, PNG, MP4
              </p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 lg:gap-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PhotoIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
              <button
                onClick={prevStep}
                className="px-4 lg:px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm lg:text-base order-2 sm:order-1"
              >
                Anterior
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 lg:px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center text-sm lg:text-base order-1 sm:order-2"
              >
                {isSubmitting && <SpinnerIcon className="w-4 h-4 animate-spin mr-2" />}
                {propertyToEdit ? 'Atualizar Anúncio' : 'Publicar Anúncio'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublishForm;