import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { validateMediaFiles } from '../../utils/mediaValidation';
import AddressSearchByCEP from '../AddressSearchByCEP';
import { useGoogleMaps } from '../../contexts/GoogleMapsContext';
import MediaUpload from './MediaUpload';
import type { MediaFile } from './types';
import type { Property, User, Media } from '../../types';

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

// Admin-specific extension for Property used in admin publish/edit contexts
type AdminProperty = Property & {
  operacao?: string;
  preco_venda?: number;
  preco_aluguel?: number;
  preco_temporada?: number;
  vagas_garagem?: number;
  condominio?: number;
  iptu?: number;
  aceita_fgts?: boolean;
  mobiliado?: boolean;
  pet_friendly?: boolean;
  coordinates?: { lat: number; lng: number };
  cep?: string;
  bairro?: string;
  estado?: string;
  complemento?: string;
  media?: Media[];
};

interface PublishFormAdminProps {
  onBack: () => void;
  onSuccess: (status: 'published' | 'updated') => void;
  onError: (message: string) => void;
  propertyToEdit?: AdminProperty | null;
  adminUser: User | null;
}

const PublishFormAdmin: React.FC<PublishFormAdminProps> = ({
  onBack,
  onSuccess,
  onError,
  propertyToEdit,
  adminUser
}) => {
  const { t } = useLanguage();
  const { isLoaded } = useGoogleMaps();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  
  const [formData, setFormData] = useState<PropertyFormData>({
    titulo: propertyToEdit?.titulo || '',
    descricao: propertyToEdit?.descricao || '',
    endereco_completo: propertyToEdit?.endereco_completo || '',
    cidade: propertyToEdit?.cidade || '',
    rua: propertyToEdit?.rua || '',
    numero: propertyToEdit?.numero || '',
    cep: propertyToEdit?.cep || '',
    preco: propertyToEdit?.preco || 0,
    tipo_operacao: propertyToEdit?.tipo_operacao || 'venda',
    tipo_imovel: propertyToEdit?.tipo_imovel || '',
    quartos: propertyToEdit?.quartos || 0,
    banheiros: propertyToEdit?.banheiros || 0,
    area_bruta: propertyToEdit?.area_bruta || 0,
    area_util: propertyToEdit?.area_util || 0,
    possui_elevador: propertyToEdit?.possui_elevador || false,
    taxa_condominio: propertyToEdit?.taxa_condominio || 0,
    caracteristicas_imovel: propertyToEdit?.caracteristicas_imovel || [],
    caracteristicas_condominio: propertyToEdit?.caracteristicas_condominio || [],
    situacao_ocupacao: propertyToEdit?.situacao_ocupacao || '',
    valor_iptu: propertyToEdit?.valor_iptu || 0,
    aceita_financiamento: propertyToEdit?.aceita_financiamento || false,
    condicoes_aluguel: propertyToEdit?.condicoes_aluguel || [],
    permite_animais: propertyToEdit?.permite_animais || false,
    minimo_diarias: propertyToEdit?.minimo_diarias || 1,
    maximo_hospedes: propertyToEdit?.maximo_hospedes || 1,
    taxa_limpeza: propertyToEdit?.taxa_limpeza || 0,
    datas_disponiveis: propertyToEdit?.datas_disponiveis || [],
    topografia: propertyToEdit?.topografia || '',
    zoneamento: propertyToEdit?.zoneamento || '',
    murado: propertyToEdit?.murado || false,
    em_condominio: propertyToEdit?.em_condominio || false,
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
      endereco_completo: address.fullAddress || `${address.street || ''}, ${address.number || ''}, ${address.neighborhood || ''}, ${address.city || ''} - ${address.state || ''}`.replace(/^,\\s*|,\\s*,/g, '').trim(),
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
    }
  };

  const handleMediaFilesChange = (files: MediaFile[]) => {
    setMediaFiles(files);
  };

  const handleMediaError = (error: string) => {
    onError(error);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const uploadMediaFiles = async (propertyId: number): Promise<{ url: string; type: 'image' | 'video' }[]> => {
    const uploaded: { url: string; type: 'image' | 'video' }[] = [];

    for (const mediaFile of mediaFiles) {
      try {
        const fileExt = mediaFile.file.name.split('.').pop();
        const fileName = `${propertyId}/${Date.now()}.${fileExt}`;
        const bucket = 'midia';

        const { error } = await supabase.storage
          .from(bucket)
          .upload(fileName, mediaFile.file);

        if (error) {
          console.error('Erro no upload:', error);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        uploaded.push({
          url: publicUrl,
          type: mediaFile.type === 'image' ? 'image' : 'video'
        });
      } catch (error) {
        console.error('Erro no upload do arquivo:', error);
      }
    }

    return uploaded;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Endereço é opcional; exigir apenas campos essenciais
    if (!formData.titulo || !formData.preco) {
      onError('Por favor, preencha título e preço.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Garantir que temos sessão do Supabase Auth para cumprir RLS
      const { data: authData } = await supabase.auth.getUser();
      const authUserId = authData?.user?.id || null;

      let propertyId: number;

      if (propertyToEdit) {
        // Atualizar imóvel existente
        const { data, error } = await supabase
          .from('imoveis')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', propertyToEdit.id)
          .select()
          .single();

        if (error) throw error;
        propertyId = data.id;
      } else {
        // Criar novo imóvel
        const { QUALLITY_HOME_USER_ID } = await import('../../config');
        const { data, error } = await supabase
          .from('imoveis')
          .insert([{ 
            ...formData,
            // Preferir o usuário autenticado do Supabase Auth para respeitar políticas RLS
            anunciante_id: authUserId || QUALLITY_HOME_USER_ID || (typeof adminUser?.id === 'string' ? adminUser.id : undefined),
            status: 'ativo',
            data_publicacao: new Date().toISOString(),
            data_atualizacao: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        propertyId = data.id;
      }

      // Upload de mídias se houver
      if (mediaFiles.length > 0) {
        const uploadedMedia = await uploadMediaFiles(propertyId);

        if (uploadedMedia.length > 0) {
          // Inserir mídias na tabela midias_imovel com ordem preservada
          const mediaInserts = uploadedMedia.map((m, index) => ({
            imovel_id: propertyId,
            url: m.url,
            tipo: m.type === 'image' ? 'imagem' : 'video',
            ordem: index
          }));

          const { error: insertMidiaError } = await supabase
            .from('midias_imovel')
            .insert(mediaInserts);

          if (insertMidiaError) {
            console.error('Erro ao inserir mídias em midias_imovel:', insertMidiaError);
          }

          // Atualizar colunas images/videos em imoveis para sincronização
          const images = uploadedMedia.filter(m => m.type === 'image').map(m => m.url);
          const videos = uploadedMedia.filter(m => m.type === 'video').map(m => m.url);

          const { error: updateError } = await supabase
            .from('imoveis')
            .update({
              images: images.length > 0 ? images : null,
              videos: videos.length > 0 ? videos : null
            })
            .eq('id', propertyId);

          if (updateError) {
            console.error('Erro ao atualizar mídias em imoveis:', updateError);
          }
        }
      }

      onSuccess(propertyToEdit ? 'updated' : 'published');
      
    } catch (error) {
      console.error('Erro ao salvar imóvel:', error);
      onError(propertyToEdit ? 'Erro ao atualizar imóvel' : 'Erro ao publicar imóvel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Informações Básicas</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título do Anúncio *
        </label>
        <input
          type="text"
          value={formData.titulo}
          onChange={(e) => handleInputChange('titulo', e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: Apartamento 3 quartos no centro"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Operação *
        </label>
        <select
          value={formData.tipo_operacao}
          onChange={(e) => handleInputChange('tipo_operacao', e.target.value as 'venda' | 'aluguel' | 'temporada')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="venda">Venda</option>
          <option value="aluguel">Aluguel</option>
          <option value="temporada">Temporada</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Imóvel
        </label>
        <select
          value={formData.tipo_imovel}
          onChange={(e) => handleInputChange('tipo_imovel', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Selecione o tipo</option>
          {tiposImovel.map(tipo => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preço *
        </label>
        <input
          type="number"
          value={formData.preco}
          onChange={(e) => handleInputChange('preco', parseFloat(e.target.value) || 0)}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0"
          min="0"
          required
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Descreva as características do imóvel..."
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Endereço</h3>
      
      <AddressSearchByCEP
        onAddressChange={handleAddressChange}
        isLoaded={isLoaded}
        initialAddress={{
          cep: formData.cep,
          street: formData.rua,
          number: formData.numero,
          city: formData.cidade,
          fullAddress: formData.endereco_completo
        }}
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Características</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quartos
          </label>
          <input
            type="number"
            value={formData.quartos}
            onChange={(e) => handleInputChange('quartos', parseInt(e.target.value) || 0)}
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
            value={formData.banheiros}
            onChange={(e) => handleInputChange('banheiros', parseInt(e.target.value) || 0)}
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
            value={formData.area_bruta}
            onChange={(e) => handleInputChange('area_bruta', parseFloat(e.target.value) || 0)}
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
            value={formData.area_util}
            onChange={(e) => handleInputChange('area_util', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Taxa de Condomínio (R$)
        </label>
        <input
          type="number"
          value={formData.taxa_condominio}
          onChange={(e) => handleInputChange('taxa_condominio', parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="0"
        />
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.possui_elevador}
            onChange={(e) => handleInputChange('possui_elevador', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-700">Possui Elevador</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Características do Imóvel
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {caracteristicasImovelOptions.map(caracteristica => (
            <label key={caracteristica} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.caracteristicas_imovel.includes(caracteristica)}
                onChange={(e) => handleArrayChange('caracteristicas_imovel', caracteristica, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">{caracteristica}</span>
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
            <label key={caracteristica} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.caracteristicas_condominio.includes(caracteristica)}
                onChange={(e) => handleArrayChange('caracteristicas_condominio', caracteristica, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">{caracteristica}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Mídias</h3>
      
      <MediaUpload
        files={mediaFiles}
        onFilesChange={handleMediaFilesChange}
        onError={handleMediaError}
        maxFiles={20}
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {propertyToEdit ? 'Editar Imóvel' : 'Publicar Novo Imóvel'}
        </h2>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-500">
          <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>Básico</span>
          <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>Endereço</span>
          <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : ''}>Características</span>
          <span className={currentStep >= 4 ? 'text-blue-600 font-medium' : ''}>Mídias</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        {submitMessage && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {submitMessage}
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
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

export default PublishFormAdmin;