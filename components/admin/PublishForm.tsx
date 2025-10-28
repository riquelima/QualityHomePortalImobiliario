import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { validateMediaFiles } from '../../utils/mediaValidation';
import AddressSearchByCEP from '../AddressSearchByCEP';
import MediaUpload from './MediaUpload';
import type { MediaFile } from './types';

interface PropertyFormData {
  titulo: string;
  descricao: string;
  endereco_completo: string;
  cidade: string;
  rua: string;
  numero: string;
  cep: string;
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
  datas_disponiveis: string[];
  topografia: string;
  zoneamento: string;
  murado: boolean;
  em_condominio: boolean;
  images: any[];
  videos: any[];
}

const PublishForm: React.FC = () => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  
  const [formData, setFormData] = useState<PropertyFormData>({
    titulo: '',
    descricao: '',
    endereco_completo: '',
    cidade: '',
    rua: '',
    numero: '',
    cep: '',
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
    datas_disponiveis: [],
    topografia: '',
    zoneamento: '',
    murado: false,
    em_condominio: false,
    images: [],
    videos: []
  });

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
    'Sauna', 'Spa', 'Cinema', 'Brinquedoteca', 'Coworking',
    'Pet place', 'Bike place', 'Portaria 24h', 'Segurança'
  ];

  const condicoesAluguelOptions = [
    'Sem fiador', 'Com fiador', 'Seguro fiança', 'Depósito caução',
    'Renda comprovada', 'Sem comprovação de renda'
  ];

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (address: {
    cep?: string;
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    number?: string;
    complement?: string;
    latitude?: string;
    longitude?: string;
    fullAddress?: string;
  }, isComplete: boolean) => {
    setFormData(prev => ({
      ...prev,
      cep: address.cep || '',
      endereco_completo: address.fullAddress || `${address.street || ''}, ${address.number || ''}, ${address.neighborhood || ''}, ${address.city || ''} - ${address.state || ''}`.replace(/^,\s*|,\s*,/g, '').trim(),
      cidade: address.city || '',
      rua: address.street || '',
      numero: address.number || ''
    }));
  };

  const handleArrayChange = (field: keyof PropertyFormData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Só permite submissão se estivermos no último passo
      if (currentStep === 5) {
        handleSubmit();
      } else {
        nextStep();
      }
    }
  };

  const handleMediaFilesChange = (files: MediaFile[]) => {
    setMediaFiles(files);
  };

  const handleMediaError = (message: string) => {
    console.error('Erro de mídia:', message);
    // Aqui você pode adicionar uma notificação toast ou modal de erro
  };

  const uploadMediaFiles = async (files: MediaFile[]) => {
    const uploadedMedia = [];
    
    for (const mediaFile of files) {
      if (mediaFile.file) {
        const fileExtension = mediaFile.file.name.split('.').pop();
        const fileName = `${mediaFile.type}s/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
        
        const { data, error } = await supabase.storage
          .from('midia')
          .upload(fileName, mediaFile.file);
        
        if (error) {
          console.error('Erro no upload:', error);
          continue;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('midia')
          .getPublicUrl(fileName);
        
        uploadedMedia.push({
          url: publicUrl,
          type: mediaFile.type,
          fileName: fileName
        });
      }
    }
    
    return uploadedMedia;
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.titulo && formData.tipo_operacao && formData.tipo_imovel);
      case 2:
        return !!(formData.preco > 0);
      case 3:
        return !!(formData.endereco_completo && formData.cidade);
      case 4:
        return true; // Características são opcionais
      case 5:
        return true; // Mídias são opcionais
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      setSubmitMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Upload de mídias
      const uploadedMedia = await uploadMediaFiles(mediaFiles);

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Separar URLs por tipo
      const imageUrls = uploadedMedia.filter(media => media.type === 'image').map(media => media.url);
      const videoUrls = uploadedMedia.filter(media => media.type === 'video').map(media => media.url);

      // Preparar dados para inserção
      const propertyData = {
        ...formData,
        anunciante_id: user.id,
        images: imageUrls.length > 0 ? imageUrls : null,
        videos: videoUrls.length > 0 ? videoUrls : null,
        status: 'ativo'
      };

      // Inserir propriedade
      const { data, error } = await supabase
        .from('imoveis')
        .insert([propertyData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Inserir mídias na tabela midias_imovel
      if (uploadedMedia.length > 0) {
        const mediaInserts = uploadedMedia.map((media, index) => ({
          imovel_id: data.id,
          url: media.url,
          tipo: media.type === 'image' ? 'imagem' : 'video',
          ordem: index
        }));

        await supabase
          .from('midias_imovel')
          .insert(mediaInserts);
      }

      setSubmitMessage('Anúncio publicado com sucesso!');
      
      // Reset form
      setFormData({
        titulo: '',
        descricao: '',
        endereco_completo: '',
        cidade: '',
        rua: '',
        numero: '',
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
        datas_disponiveis: [],
        topografia: '',
        zoneamento: '',
        murado: false,
        em_condominio: false,
        images: [],
        videos: []
      });
      setMediaFiles([]);
      setCurrentStep(1);

    } catch (error) {
      console.error('Erro ao publicar anúncio:', error);
      setSubmitMessage('Erro ao publicar anúncio. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      setSubmitMessage('');
    } else {
      setSubmitMessage('Por favor, preencha todos os campos obrigatórios antes de continuar.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setSubmitMessage('');
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Informações Básicas</h3>
      
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
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Operação *
        </label>
        <select
          value={formData.tipo_operacao}
          onChange={(e) => handleInputChange('tipo_operacao', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        >
          <option value="">Selecione o tipo</option>
          {tiposImovel.map(tipo => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
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
          placeholder="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          value={formData.descricao}
          onChange={(e) => handleInputChange('descricao', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Descreva as principais características do imóvel..."
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Características Básicas do Imóvel</h3>
      
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
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Área Bruta (m²)
          </label>
          <input
            type="number"
            value={formData.area_bruta}
            onChange={(e) => handleInputChange('area_bruta', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Área Útil (m²)
          </label>
          <input
            type="number"
            value={formData.area_util}
            onChange={(e) => handleInputChange('area_util', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            value={formData.taxa_condominio}
            onChange={(e) => handleInputChange('taxa_condominio', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            value={formData.valor_iptu}
            onChange={(e) => handleInputChange('valor_iptu', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            checked={formData.possui_elevador}
            onChange={(e) => handleInputChange('possui_elevador', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="possui_elevador" className="ml-2 block text-sm text-gray-900">
            Possui Elevador
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="aceita_financiamento"
            checked={formData.aceita_financiamento}
            onChange={(e) => handleInputChange('aceita_financiamento', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="aceita_financiamento" className="ml-2 block text-sm text-gray-900">
            Aceita Financiamento
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="permite_animais"
            checked={formData.permite_animais}
            onChange={(e) => handleInputChange('permite_animais', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="permite_animais" className="ml-2 block text-sm text-gray-900">
            Permite Animais
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="murado"
            checked={formData.murado}
            onChange={(e) => handleInputChange('murado', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="murado" className="ml-2 block text-sm text-gray-900">
            Murado
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="em_condominio"
            checked={formData.em_condominio}
            onChange={(e) => handleInputChange('em_condominio', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="em_condominio" className="ml-2 block text-sm text-gray-900">
            Em Condomínio
          </label>
        </div>
      </div>

      {formData.tipo_operacao === 'temporada' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mínimo de Diárias
            </label>
            <input
              type="number"
              value={formData.minimo_diarias}
              onChange={(e) => handleInputChange('minimo_diarias', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Máximo de Hóspedes
            </label>
            <input
              type="number"
              value={formData.maximo_hospedes}
              onChange={(e) => handleInputChange('maximo_hospedes', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taxa de Limpeza (R$)
            </label>
            <input
              type="number"
              value={formData.taxa_limpeza}
              onChange={(e) => handleInputChange('taxa_limpeza', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Localização</h3>
      
      <AddressSearchByCEP 
        onAddressChange={handleAddressChange}
        isLoaded={true}
        initialAddress={{
          cep: formData.cep || '',
          street: formData.rua || '',
          city: formData.cidade || '',
          number: formData.numero || '',
          fullAddress: formData.endereco_completo || '',
          neighborhood: '',
          state: '',
          complement: ''
        }}
      />
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Características e Comodidades</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Características do Imóvel
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {caracteristicasImovelOptions.map(caracteristica => (
            <div key={caracteristica} className="flex items-center">
              <input
                type="checkbox"
                id={`imovel_${caracteristica}`}
                checked={formData.caracteristicas_imovel.includes(caracteristica)}
                onChange={(e) => handleArrayChange('caracteristicas_imovel', caracteristica, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`imovel_${caracteristica}`} className="ml-2 block text-sm text-gray-900">
                {caracteristica}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Características do Condomínio
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {caracteristicasCondominioOptions.map(caracteristica => (
            <div key={caracteristica} className="flex items-center">
              <input
                type="checkbox"
                id={`condominio_${caracteristica}`}
                checked={formData.caracteristicas_condominio.includes(caracteristica)}
                onChange={(e) => handleArrayChange('caracteristicas_condominio', caracteristica, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`condominio_${caracteristica}`} className="ml-2 block text-sm text-gray-900">
                {caracteristica}
              </label>
            </div>
          ))}
        </div>
      </div>

      {formData.tipo_operacao === 'aluguel' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Condições de Aluguel
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {condicoesAluguelOptions.map(condicao => (
              <div key={condicao} className="flex items-center">
                <input
                  type="checkbox"
                  id={`aluguel_${condicao}`}
                  checked={formData.condicoes_aluguel.includes(condicao)}
                  onChange={(e) => handleArrayChange('condicoes_aluguel', condicao, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`aluguel_${condicao}`} className="ml-2 block text-sm text-gray-900">
                  {condicao}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Situação de Ocupação
          </label>
          <select
            value={formData.situacao_ocupacao}
            onChange={(e) => handleInputChange('situacao_ocupacao', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione</option>
            <option value="vago">Vago</option>
            <option value="ocupado">Ocupado</option>
            <option value="em_reforma">Em Reforma</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topografia
          </label>
          <select
            value={formData.topografia}
            onChange={(e) => handleInputChange('topografia', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione</option>
            <option value="plano">Plano</option>
            <option value="aclive">Aclive</option>
            <option value="declive">Declive</option>
            <option value="irregular">Irregular</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Zoneamento
        </label>
        <input
          type="text"
          value={formData.zoneamento}
          onChange={(e) => handleInputChange('zoneamento', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Residencial, Comercial, Misto"
        />
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Fotos e Vídeos</h3>
      
      <MediaUpload
        files={mediaFiles}
        onFilesChange={handleMediaFilesChange}
        onError={handleMediaError}
        maxFiles={20}
      />
    </div>
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Não faz nada - previne submissão automática
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown}>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Publicar Novo Anúncio</h2>
        
        {/* Progress Bar */}
        <div className="flex items-center mb-6">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 5 && (
                <div
                  className={`w-12 h-1 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="grid grid-cols-5 gap-2 text-xs text-center text-gray-600 mb-6">
          <div>Básico</div>
          <div>Características</div>
          <div>Localização</div>
          <div>Comodidades</div>
          <div>Fotos</div>
        </div>
      </div>

      {/* Form Steps */}
      <div className="mb-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-6 py-2 rounded-md font-medium ${
            currentStep === 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          Anterior
        </button>

        <div className="flex space-x-4">
          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
            >
              Próximo
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-md font-medium ${
                isSubmitting
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSubmitting ? 'Publicando...' : 'Publicar Anúncio'}
            </button>
          )}
        </div>
      </div>

      {/* Submit Message */}
      {submitMessage && (
        <div className={`mt-4 p-3 rounded-md text-center ${
          submitMessage.includes('sucesso')
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {submitMessage}
        </div>
      )}
      </form>
    </div>
  );
};

export default PublishForm;