import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import AddressSearchByCEP from './AddressSearchByCEP';
import LoadingIndicator from './LoadingIndicator';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import PhotoIcon from './icons/PhotoIcon';
import VideoIcon from './icons/VideoIcon';
import CheckIcon from './icons/CheckIcon';
import { validateMediaFiles } from '../utils/mediaValidation';

interface PropertyFormData {
  titulo: string;
  descricao: string;
  endereco_completo: string;
  cidade: string;
  rua: string;
  numero: string;
  latitude: number;
  longitude: number;
  preco: number;
  tipo_operacao: 'venda' | 'aluguel' | 'temporada';
  tipo_imovel: string;
  quartos: number;
  banheiros: number;
  area_bruta: number;
  area_util: number;
  possui_elevador: boolean;
  taxa_condominio: number;
  caracteristicas_imovel: string[];
  caracteristicas_condominio: string[];
  situacao_ocupacao: string;
  valor_iptu: number;
  aceita_financiamento: boolean;
  condicoes_aluguel: string[];
  permite_animais: boolean;
  minimo_diarias: number;
  maximo_hospedes: number;
  taxa_limpeza: number;
  topografia: string;
  zoneamento: string;
  murado: boolean;
  em_condominio: boolean;
}

interface PublishAdPageProps {
  onBack: () => void;
}

const PublishAdPage: React.FC<PublishAdPageProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isAddressLoaded, setIsAddressLoaded] = useState(false);
  
  const [formData, setFormData] = useState<PropertyFormData>({
    titulo: '',
    descricao: '',
    endereco_completo: '',
    cidade: '',
    rua: '',
    numero: '',
    latitude: 0,
    longitude: 0,
    preco: 0,
    tipo_operacao: 'venda',
    tipo_imovel: '',
    quartos: 0,
    banheiros: 0,
    area_bruta: 0,
    area_util: 0,
    possui_elevador: false,
    taxa_condominio: 0,
    caracteristicas_imovel: [],
    caracteristicas_condominio: [],
    situacao_ocupacao: '',
    valor_iptu: 0,
    aceita_financiamento: false,
    condicoes_aluguel: [],
    permite_animais: false,
    minimo_diarias: 1,
    maximo_hospedes: 1,
    taxa_limpeza: 0,
    topografia: '',
    zoneamento: '',
    murado: false,
    em_condominio: false
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);

  const tiposImovel = [
    'Apartamento', 'Casa', 'Sobrado', 'Cobertura', 'Studio', 'Loft',
    'Terreno', 'Chácara', 'Sítio', 'Fazenda', 'Comercial', 'Industrial'
  ];

  const caracteristicasImovelOptions = [
    'Varanda', 'Sacada', 'Churrasqueira', 'Lareira', 'Jardim',
    'Quintal', 'Área de serviço', 'Despensa', 'Closet', 'Suíte',
    'Hidromassagem', 'Ar condicionado', 'Aquecimento', 'Mobiliado'
  ];

  const caracteristicasCondominioOptions = [
    'Piscina', 'Academia', 'Salão de festas', 'Playground', 'Quadra',
    'Portaria 24h', 'Elevador', 'Garagem', 'Jardim', 'Área gourmet'
  ];

  const situacoesOcupacao = [
    'Vago', 'Ocupado pelo proprietário', 'Alugado', 'Em reforma'
  ];

  const condicoesAluguel = [
    'Sem fiador', 'Com fiador', 'Seguro fiança', 'Depósito caução'
  ];

  // Função para lidar com mudança de endereço
  const handleAddressChange = (address: any, isComplete: boolean) => {
    const fullAddress = `${address.street || ''}, ${address.number || ''}, ${address.neighborhood || ''}, ${address.city || ''} - ${address.state || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '');
    
    setFormData(prev => ({
      ...prev,
      endereco_completo: fullAddress,
      cidade: address.city || '',
      rua: address.street || '',
      numero: address.number || '',
      latitude: parseFloat(address.latitude) || 0,
      longitude: parseFloat(address.longitude) || 0
    }));
    setIsAddressLoaded(isComplete);
  };

  // Função para lidar com mudanças nos campos do formulário
  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para lidar com características (checkboxes múltiplos)
  const handleCharacteristicChange = (field: 'caracteristicas_imovel' | 'caracteristicas_condominio', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  // Função para upload de imagens com validação
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validation = await validateMediaFiles(files, imageFiles.length);
      
      if (!validation.isValid) {
        const firstError = validation.errors[0];
        setSubmitMessage(t(`mediaValidation.${firstError.type}`, firstError.context || {}));
        
        if (validation.validFiles.length > 0) {
          setImageFiles(prev => [...prev, ...validation.validFiles]);
        }
        return;
      }
      
      setImageFiles(prev => [...prev, ...validation.validFiles]);
      setSubmitMessage(''); // Limpar mensagem de erro se tudo estiver ok
    }
  };

  // Função para upload de vídeos com validação
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validation = await validateMediaFiles(files, videoFiles.length);
      
      if (!validation.isValid) {
        const firstError = validation.errors[0];
        setSubmitMessage(t(`mediaValidation.${firstError.type}`, firstError.context || {}));
        
        if (validation.validFiles.length > 0) {
          setVideoFiles(prev => [...prev, ...validation.validFiles]);
        }
        return;
      }
      
      setVideoFiles(prev => [...prev, ...validation.validFiles]);
      setSubmitMessage(''); // Limpar mensagem de erro se tudo estiver ok
    }
  };

  // Função para upload de arquivos
  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Função para submeter o formulário
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Upload das imagens
      const imageUrls = await Promise.all(
        imageFiles.map(file => uploadFile(file, 'property-images'))
      );

      // Upload dos vídeos
      const videoUrls = await Promise.all(
        videoFiles.map(file => uploadFile(file, 'property-videos'))
      );

      // Inserir propriedade
      const { data: propertyData, error: propertyError } = await supabase
        .from('imoveis')
        .insert([{
          ...formData,
          status: 'pendente',
          data_publicacao: new Date().toISOString()
        }])
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Inserir mídias
      const mediaInserts = [
        ...imageUrls.map(url => ({
          imovel_id: propertyData.id,
          url,
          tipo: 'imagem'
        })),
        ...videoUrls.map(url => ({
          imovel_id: propertyData.id,
          url,
          tipo: 'video'
        }))
      ];

      if (mediaInserts.length > 0) {
        const { error: mediaError } = await supabase
          .from('midias_imovel')
          .insert(mediaInserts);

        if (mediaError) throw mediaError;
      }

      setSubmitMessage('Imóvel publicado com sucesso! Aguarde aprovação.');
      setTimeout(() => {
        onBack();
      }, 2000);

    } catch (error) {
      console.error('Erro ao publicar imóvel:', error);
      setSubmitMessage('Erro ao publicar imóvel. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para avançar para próximo passo
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Função para voltar ao passo anterior
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Renderizar passo 1: Informações básicas
  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações Básicas</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título do Anúncio *
        </label>
        <input
          type="text"
          value={formData.titulo}
          onChange={(e) => handleInputChange('titulo', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Apartamento 3 quartos com vista para o mar"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição *
        </label>
        <textarea
          value={formData.descricao}
          onChange={(e) => handleInputChange('descricao', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Descreva as principais características do imóvel..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Operação *
          </label>
          <select
            value={formData.tipo_operacao}
            onChange={(e) => handleInputChange('tipo_operacao', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="venda">Venda</option>
            <option value="aluguel">Aluguel</option>
            <option value="temporada">Temporada</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Imóvel *
          </label>
          <select
            value={formData.tipo_imovel}
            onChange={(e) => handleInputChange('tipo_imovel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecione o tipo</option>
            {tiposImovel.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preço (R$) *
        </label>
        <input
          type="number"
          value={formData.preco}
          onChange={(e) => handleInputChange('preco', parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0,00"
          min="0"
          step="0.01"
          required
        />
      </div>
    </div>
  );

  // Renderizar passo 2: Endereço
  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Localização</h2>
      
      <AddressSearchByCEP
        onAddressChange={handleAddressChange}
        isLoaded={isAddressLoaded}
        initialAddress={{
          cep: '',
          street: formData.rua,
          city: formData.cidade,
          number: formData.numero
        }}
      />
    </div>
  );

  // Renderizar passo 3: Detalhes
  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalhes do Imóvel</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quartos
          </label>
          <input
            type="number"
            value={formData.quartos}
            onChange={(e) => handleInputChange('quartos', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Banheiros
          </label>
          <input
            type="number"
            value={formData.banheiros}
            onChange={(e) => handleInputChange('banheiros', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Área Bruta (m²)
          </label>
          <input
            type="number"
            value={formData.area_bruta}
            onChange={(e) => handleInputChange('area_bruta', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            onChange={(e) => handleInputChange('area_util', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Características do Imóvel
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {caracteristicasImovelOptions.map(caracteristica => (
            <label key={caracteristica} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.caracteristicas_imovel.includes(caracteristica)}
                onChange={() => handleCharacteristicChange('caracteristicas_imovel', caracteristica)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{caracteristica}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Características do Condomínio
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {caracteristicasCondominioOptions.map(caracteristica => (
            <label key={caracteristica} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.caracteristicas_condominio.includes(caracteristica)}
                onChange={() => handleCharacteristicChange('caracteristicas_condominio', caracteristica)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{caracteristica}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  // Renderizar passo 4: Mídias
  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Fotos e Vídeos</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fotos do Imóvel
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Selecionar Fotos
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            PNG, JPG até 10MB cada
          </p>
        </div>
        {imageFiles.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">{imageFiles.length} foto(s) selecionada(s)</p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vídeos do Imóvel (Opcional)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <VideoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2">
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Selecionar Vídeos
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            MP4, MOV até 100MB cada
          </p>
        </div>
        {videoFiles.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">{videoFiles.length} vídeo(s) selecionado(s)</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Publicar Imóvel
                </h1>
                <p className="text-gray-600">
                  Passo {currentStep} de 4
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step < currentStep ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-md ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Anterior
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <LoadingIndicator size="sm" />
                    <span>Publicando...</span>
                  </div>
                ) : (
                  'Publicar Imóvel'
                )}
              </button>
            )}
          </div>

          {/* Submit Message */}
          {submitMessage && (
            <div className={`mt-4 p-4 rounded-md ${
              submitMessage.includes('sucesso')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {submitMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublishAdPage;
