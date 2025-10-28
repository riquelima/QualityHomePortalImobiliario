import React, { useState, useRef, useCallback } from 'react';
import { validateMediaFiles, type ValidationResult } from '../../utils/mediaValidation';
import PhotoIcon from '../icons/PhotoIcon';
import VideoIcon from '../icons/VideoIcon';
import CloseIcon from '../icons/CloseIcon';
import SpinnerIcon from '../icons/SpinnerIcon';
import type { MediaFile } from './types';

interface MediaUploadProps {
  files: MediaFile[];
  onFilesChange: (files: MediaFile[]) => void;
  onError: (message: string) => void;
  maxFiles?: number;
  disabled?: boolean;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  files,
  onFilesChange,
  onError,
  maxFiles = 10,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (newFiles: File[]) => {
    if (disabled) return;
    
    setIsProcessing(true);
    
    try {
      // Validar arquivos
      const validation = await validateMediaFiles(newFiles, files.length);
      
      if (!validation.isValid) {
        const firstError = validation.errors[0];
        let errorMessage = 'Erro de validação';
        
        // Mensagens de erro mais específicas
        switch (firstError.type) {
          case 'invalidType':
            errorMessage = `Tipo de arquivo não suportado: ${firstError.context?.fileName || 'arquivo'}. Use apenas imagens (JPEG, PNG, WebP, GIF) ou vídeos (MP4, AVI, MOV, WebM).`;
            break;
          case 'fileTooLarge':
            const sizeMB = firstError.context?.fileSize ? (firstError.context.fileSize / 1024 / 1024).toFixed(1) : 'desconhecido';
            errorMessage = `Arquivo muito grande: ${firstError.context?.fileName || 'arquivo'} (${sizeMB}MB). Imagens até 32MB, vídeos até 600MB.`;
            break;
          case 'tooManyFiles':
            errorMessage = `Muitos arquivos selecionados. Máximo de ${maxFiles} arquivos permitidos.`;
            break;
          case 'dangerousFile':
            errorMessage = `Arquivo perigoso detectado: ${firstError.context?.fileName || 'arquivo'}. Este tipo de arquivo não é permitido por segurança.`;
            break;
          case 'invalidContent':
            errorMessage = `Conteúdo do arquivo inválido: ${firstError.context?.fileName || 'arquivo'}. O arquivo pode estar corrompido ou não ser uma mídia válida.`;
            break;
          default:
            errorMessage = `Erro de validação: ${firstError.type} - ${firstError.context?.fileName || 'arquivo'}`;
        }
        
        console.error('Erro de validação de mídia:', firstError);
        onError(errorMessage);
        
        // Se alguns arquivos são válidos, adicione-os
        if (validation.validFiles.length > 0) {
          const mediaFiles = validation.validFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith('video') ? 'video' as const : 'image' as const,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }));
          
          onFilesChange([...files, ...mediaFiles]);
        }
        return;
      }
      
      // Todos os arquivos são válidos
      const mediaFiles = validation.validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('video') ? 'video' as const : 'image' as const,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));
      
      onFilesChange([...files, ...mediaFiles]);
    } catch (error) {
      console.error('Erro ao processar arquivos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao processar arquivos';
      onError(`Erro ao processar arquivos: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  }, [files, onFilesChange, onError, disabled, maxFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [processFiles, disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && !disabled) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      e.target.value = '';
    }
  }, [processFiles, disabled]);

  const removeFile = useCallback((fileId: string) => {
    const fileToRemove = files.find(f => f.id === fileId);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview);
      onFilesChange(files.filter(f => f.id !== fileId));
    }
  }, [files, onFilesChange]);

  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <SpinnerIcon className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-gray-600">Processando arquivos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex space-x-4 mb-4">
              <PhotoIcon className="w-12 h-12 text-gray-400" />
              <VideoIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Adicione fotos e vídeos ao seu anúncio
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Arraste e solte seus arquivos aqui ou clique para selecionar
            </p>
            <button
              type="button"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={disabled}
            >
              Selecionar Arquivos
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Máximo {maxFiles} arquivos • Fotos até 32MB • Vídeos até 600MB
            </p>
          </div>
        )}
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Arquivos selecionados ({files.length}/{maxFiles})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((mediaFile) => (
              <div key={mediaFile.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {mediaFile.type === 'image' ? (
                    <img
                      src={mediaFile.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <VideoIcon className="w-8 h-8 text-gray-500" />
                      <span className="ml-2 text-xs text-gray-600">Vídeo</span>
                    </div>
                  )}
                </div>
                
                {/* Botão de remover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(mediaFile.id);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  disabled={disabled}
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
                
                {/* Info do arquivo */}
                <div className="mt-1">
                  <p className="text-xs text-gray-600 truncate">
                    {mediaFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(mediaFile.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dicas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Dicas para melhores fotos:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Certifique-se de que cada cômodo esteja limpo e bem iluminado</li>
          <li>• Tire fotos de diferentes ângulos para mostrar o espaço</li>
          <li>• Inclua fotos da fachada, áreas comuns e diferenciais do imóvel</li>
          <li>• Se tiver plantas do imóvel, fotografe-as também</li>
        </ul>
      </div>
    </div>
  );
};

export default MediaUpload;