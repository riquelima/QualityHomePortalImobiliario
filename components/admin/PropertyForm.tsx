import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { PropertyService } from '../../services/supabaseService';
import type { Property, User } from '../../types';

export interface PropertyFormData {
  // Campos obrigatórios
  titulo: string;
  preco: number;
  tipo_operacao: 'venda' | 'aluguel' | 'temporada';
  
  // Campos opcionais - Informações básicas
  descricao?: string;
  endereco_completo?: string;
  cidade?: string;
  rua?: string;
  numero?: string;
  cep?: string;
  tipo_imovel?: string;
  
  // Características do imóvel
  quartos?: number;
  banheiros?: number;
  area_bruta?: number;
  area_util?: number;
  possui_elevador?: boolean;
  taxa_condominio?: number;
  
  // Características específicas
  caracteristicas_imovel?: string[];
  caracteristicas_condominio?: string[];
  situacao_ocupacao?: string;
  valor_iptu?: number;
  aceita_financiamento?: boolean;
  
  // Para aluguel
  condicoes_aluguel?: string[];
  permite_animais?: boolean;
  
  // Para temporada
  minimo_diarias?: number;
  maximo_hospedes?: number;
  taxa_limpeza?: number;
  datas_disponiveis?: string[];
  
  // Para terrenos
  topografia?: string;
  zoneamento?: string;
  murado?: boolean;
  em_condominio?: boolean;
  
  // Mídias
  images?: any;
  videos?: any;
}

interface PropertyFormProps {
  onBack: () => void;
  onSuccess: (status: 'published' | 'updated') => void;
  onError: (message: string) => void;
  propertyToEdit?: Property | null;
  adminUser: User | null;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  onBack,
  onSuccess,
  onError,
  propertyToEdit,
  adminUser
}) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>({
    titulo: propertyToEdit?.titulo || '',
    preco: propertyToEdit?.preco || 0,
    tipo_operacao: propertyToEdit?.tipo_operacao || 'venda',
    quartos: propertyToEdit?.quartos || 0,
    banheiros: propertyToEdit?.banheiros || 0,
    descricao: propertyToEdit?.descricao || '',
    endereco_completo: propertyToEdit?.endereco_completo || '',
    cidade: propertyToEdit?.cidade || '',
    tipo_imovel: propertyToEdit?.tipo_imovel || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const updateFormData = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Formatação de preço brasileiro
  const formatPrice = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const parsePriceFromString = (value: string): number => {
    const numericValue = value.replace(/[^\d]/g, '');
    return parseInt(numericValue) || 0;
  };

  // Função para gerar título com IA
  const generateTitleWithAI = async () => {
    setIsGeneratingTitle(true);
    try {
      // Simular chamada de IA - aqui você integraria com uma API real
      const baseInfo = `${formData.tipo_imovel || 'Imóvel'} ${formData.quartos ? formData.quartos + ' quartos' : ''} ${formData.cidade || ''}`;
      const suggestions = [
        `${baseInfo} - Oportunidade Única!`,
        `Lindo ${baseInfo} - Pronto para Morar`,
        `${baseInfo} - Localização Privilegiada`,
        `Excelente ${baseInfo} - Não Perca!`,
        `${baseInfo} - Acabamento de Primeira`
      ];
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      updateFormData('titulo', randomSuggestion);
    } catch (error) {
      console.error('Erro ao gerar título:', error);
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  // Função para gerar descrição com IA
  const generateDescriptionWithAI = async () => {
    setIsGeneratingDescription(true);
    try {
      // Simular chamada de IA - aqui você integraria com uma API real
      const baseDescription = `Este ${formData.tipo_imovel || 'imóvel'} oferece ${formData.quartos || 'múltiplos'} quartos e ${formData.banheiros || 'múltiplos'} banheiros, localizado em ${formData.cidade || 'excelente região'}. `;
      const features = [
        'Acabamento de primeira qualidade',
        'Localização privilegiada',
        'Fácil acesso ao transporte público',
        'Próximo a comércios e serviços',
        'Ambiente familiar e seguro'
      ];
      
      const randomFeatures = features.sort(() => 0.5 - Math.random()).slice(0, 3);
      const description = baseDescription + randomFeatures.join(', ') + '. Agende sua visita!';
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      updateFormData('descricao', description);
    } catch (error) {
      console.error('Erro ao gerar descrição:', error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Função para buscar CEP
  const searchCEP = async (cep: string) => {
    if (cep.length !== 8) return;
    
    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        updateFormData('endereco_completo', `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
        updateFormData('cidade', data.localidade);
        updateFormData('rua', data.logradouro);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setCepLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.titulo.trim()) {
        newErrors.titulo = 'Título é obrigatório';
      }
      if (!formData.tipo_operacao) {
        newErrors.tipo_operacao = 'Tipo de operação é obrigatório';
      }
      if (formData.preco <= 0) {
        newErrors.preco = 'Preço deve ser maior que zero';
      }
    }

    // Etapa 2 (endereço) opcional: não adicionar erros se campos estiverem vazios

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      if (propertyToEdit) {
        // Atualizar imóvel existente
        await PropertyService.updateProperty(propertyToEdit.id, formData);
        onSuccess('updated');
      } else {
        // Criar novo imóvel
        await PropertyService.createProperty(formData);
        onSuccess('published');
      }
    } catch (error) {
      console.error('Erro ao salvar imóvel:', error);
      onError(propertyToEdit ? 'Erro ao atualizar imóvel' : 'Erro ao publicar imóvel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Informações Básicas
      </h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título do Anúncio *
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.titulo}
            onChange={(e) => updateFormData('titulo', e.target.value)}
            className={`w-full px-3 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.titulo ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Apartamento 3 quartos no centro"
          />
          <button
            type="button"
            onClick={generateTitleWithAI}
            disabled={isGeneratingTitle}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            title="Gerar título com IA"
          >
            {isGeneratingTitle ? (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Operação *
        </label>
        <select
          value={formData.tipo_operacao}
          onChange={(e) => updateFormData('tipo_operacao', e.target.value as 'venda' | 'aluguel' | 'temporada')}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.tipo_operacao ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="venda">Venda</option>
          <option value="aluguel">Aluguel</option>
          <option value="temporada">Temporada</option>
        </select>
        {errors.tipo_operacao && <p className="text-red-500 text-sm mt-1">{errors.tipo_operacao}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preço *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
            R$
          </span>
          <input
            type="text"
            value={formData.preco ? formatPrice(formData.preco).replace('R$', '').trim() : ''}
            onChange={(e) => {
              const numericValue = parsePriceFromString(e.target.value);
              updateFormData('preco', numericValue);
            }}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.preco ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
          />
        </div>
        {errors.preco && <p className="text-red-500 text-sm mt-1">{errors.preco}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Imóvel
        </label>
        <select
          value={formData.tipo_imovel || ''}
          onChange={(e) => updateFormData('tipo_imovel', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Selecione o tipo</option>
          <option value="apartamento">Apartamento</option>
          <option value="casa">Casa</option>
          <option value="terreno">Terreno</option>
          <option value="comercial">Comercial</option>
          <option value="rural">Rural</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <div className="relative">
          <textarea
            value={formData.descricao || ''}
            onChange={(e) => updateFormData('descricao', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descreva as características do imóvel..."
          />
          <button
            type="button"
            onClick={generateDescriptionWithAI}
            disabled={isGeneratingDescription}
            className="absolute right-2 top-2 p-1 text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            title="Gerar descrição com IA"
          >
            {isGeneratingDescription ? (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Localização
      </h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CEP
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.cep || ''}
            onChange={(e) => {
              const cep = e.target.value.replace(/\D/g, '');
              updateFormData('cep', cep);
              if (cep.length === 8) {
                searchCEP(cep);
              }
            }}
            className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="00000-000"
            maxLength={8}
          />
          {cepLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">Digite o CEP para preenchimento automático</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Endereço Completo *
        </label>
        <input
          type="text"
          value={formData.endereco_completo || ''}
          onChange={(e) => updateFormData('endereco_completo', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.endereco_completo ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Rua, número, bairro"
        />
        {errors.endereco_completo && <p className="text-red-500 text-sm mt-1">{errors.endereco_completo}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rua
          </label>
          <input
            type="text"
            value={formData.rua || ''}
            onChange={(e) => updateFormData('rua', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número
          </label>
          <input
            type="text"
            value={formData.numero || ''}
            onChange={(e) => updateFormData('numero', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cidade *
        </label>
        <input
          type="text"
          value={formData.cidade || ''}
          onChange={(e) => updateFormData('cidade', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.cidade ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.cidade && <p className="text-red-500 text-sm mt-1">{errors.cidade}</p>}
      </div>


    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Características do Imóvel
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quartos
          </label>
          <input
            type="number"
            value={formData.quartos || 0}
            onChange={(e) => updateFormData('quartos', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Banheiros
          </label>
          <input
            type="number"
            value={formData.banheiros || 0}
            onChange={(e) => updateFormData('banheiros', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Área Bruta (m²)
          </label>
          <input
            type="number"
            value={formData.area_bruta || ''}
            onChange={(e) => updateFormData('area_bruta', parseInt(e.target.value) || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Área Útil (m²)
          </label>
          <input
            type="number"
            value={formData.area_util || ''}
            onChange={(e) => updateFormData('area_util', parseInt(e.target.value) || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Taxa de Condomínio (R$)
          </label>
          <input
            type="number"
            value={formData.taxa_condominio || ''}
            onChange={(e) => updateFormData('taxa_condominio', parseFloat(e.target.value) || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor IPTU (R$)
          </label>
          <input
            type="number"
            value={formData.valor_iptu || ''}
            onChange={(e) => updateFormData('valor_iptu', parseFloat(e.target.value) || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="possui_elevador"
            checked={formData.possui_elevador || false}
            onChange={(e) => updateFormData('possui_elevador', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="possui_elevador" className="ml-2 block text-sm text-gray-700">
            Possui Elevador
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="aceita_financiamento"
            checked={formData.aceita_financiamento || false}
            onChange={(e) => updateFormData('aceita_financiamento', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="aceita_financiamento" className="ml-2 block text-sm text-gray-700">
            Aceita Financiamento
          </label>
        </div>

        {formData.tipo_operacao === 'aluguel' && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="permite_animais"
              checked={formData.permite_animais || false}
              onChange={(e) => updateFormData('permite_animais', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="permite_animais" className="ml-2 block text-sm text-gray-700">
              Permite Animais
            </label>
          </div>
        )}
      </div>

      {formData.tipo_operacao === 'temporada' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mínimo de Diárias
            </label>
            <input
              type="number"
              value={formData.minimo_diarias || ''}
              onChange={(e) => updateFormData('minimo_diarias', parseInt(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Máximo de Hóspedes
            </label>
            <input
              type="number"
              value={formData.maximo_hospedes || ''}
              onChange={(e) => updateFormData('maximo_hospedes', parseInt(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taxa de Limpeza (R$)
            </label>
            <input
              type="number"
              value={formData.taxa_limpeza || ''}
              onChange={(e) => updateFormData('taxa_limpeza', parseFloat(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      )}
    </div>
  );

  const totalSteps = 3;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Passo {currentStep} de {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / totalSteps) * 100)}% completo
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                Anterior
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              Voltar
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {propertyToEdit ? 'Atualizando...' : 'Publicando...'}
                  </>
                ) : (
                  propertyToEdit ? 'Atualizar Imóvel' : 'Publicar Imóvel'
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;