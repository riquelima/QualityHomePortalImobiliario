// Utilitários para validação de arquivos de mídia
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  errorKey?: string;
}

// Configurações de validação
export const MEDIA_VALIDATION_CONFIG = {
  // Tipos de arquivo permitidos
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ],
  ALLOWED_VIDEO_TYPES: [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo', // .avi
    'video/webm'
  ],
  
  // Tamanhos máximos (em bytes)
  MAX_IMAGE_SIZE: 32 * 1024 * 1024, // 32MB
  MAX_VIDEO_SIZE: 600 * 1024 * 1024, // 600MB
  
  // Número máximo de arquivos
  MAX_FILES: 10,
  
  // Extensões perigosas que devem ser bloqueadas
  DANGEROUS_EXTENSIONS: [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sh', '.ps1'
  ]
};

/**
 * Valida o tipo de arquivo
 */
export const validateFileType = (file: File): ValidationResult => {
  const { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, DANGEROUS_EXTENSIONS } = MEDIA_VALIDATION_CONFIG;
  
  // Verificar extensões perigosas
  const fileName = file.name.toLowerCase();
  const hasDangerousExtension = DANGEROUS_EXTENSIONS.some(ext => fileName.endsWith(ext));
  
  if (hasDangerousExtension) {
    return {
      isValid: false,
      error: 'Tipo de arquivo não permitido por motivos de segurança',
      errorKey: 'mediaValidation.dangerousFile'
    };
  }
  
  // Verificar se é imagem ou vídeo permitido
  const isValidImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isValidVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  
  if (!isValidImage && !isValidVideo) {
    return {
      isValid: false,
      error: 'Tipo de arquivo não suportado. Use apenas imagens (JPG, PNG, WebP, GIF) ou vídeos (MP4, MOV, AVI, WebM)',
      errorKey: 'mediaValidation.unsupportedType'
    };
  }
  
  return { isValid: true };
};

/**
 * Valida o tamanho do arquivo
 */
export const validateFileSize = (file: File): ValidationResult => {
  const { MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } = MEDIA_VALIDATION_CONFIG;
  
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  
  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: `Imagem muito grande. Tamanho máximo: ${Math.round(MAX_IMAGE_SIZE / (1024 * 1024))}MB`,
      errorKey: 'mediaValidation.imageTooLarge'
    };
  }
  
  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return {
      isValid: false,
      error: `Vídeo muito grande. Tamanho máximo: ${Math.round(MAX_VIDEO_SIZE / (1024 * 1024))}MB`,
      errorKey: 'mediaValidation.videoTooLarge'
    };
  }
  
  return { isValid: true };
};

/**
 * Valida a quantidade total de arquivos
 */
export const validateFileCount = (currentFiles: File[], newFiles: File[]): ValidationResult => {
  const totalFiles = currentFiles.length + newFiles.length;
  
  if (totalFiles > MEDIA_VALIDATION_CONFIG.MAX_FILES) {
    return {
      isValid: false,
      error: `Máximo de ${MEDIA_VALIDATION_CONFIG.MAX_FILES} arquivos permitidos`,
      errorKey: 'mediaValidation.tooManyFiles'
    };
  }
  
  return { isValid: true };
};

/**
 * Validação adicional de segurança para verificar se o arquivo é realmente uma imagem/vídeo
 */
export const validateFileContent = async (file: File): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer) {
        resolve({
          isValid: false,
          error: 'Não foi possível ler o arquivo',
          errorKey: 'mediaValidation.unreadableFile'
        });
        return;
      }
      
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Verificar assinaturas de arquivo (magic numbers)
      if (file.type.startsWith('image/')) {
        const isValidImage = validateImageSignature(uint8Array, file.type);
        if (!isValidImage) {
          resolve({
            isValid: false,
            error: 'Arquivo não é uma imagem válida',
            errorKey: 'mediaValidation.invalidImage'
          });
          return;
        }
      }
      
      if (file.type.startsWith('video/')) {
        const isValidVideo = validateVideoSignature(uint8Array, file.type);
        if (!isValidVideo) {
          resolve({
            isValid: false,
            error: 'Arquivo não é um vídeo válido',
            errorKey: 'mediaValidation.invalidVideo'
          });
          return;
        }
      }
      
      resolve({ isValid: true });
    };
    
    reader.onerror = () => {
      resolve({
        isValid: false,
        error: 'Erro ao ler o arquivo',
        errorKey: 'mediaValidation.readError'
      });
    };
    
    // Ler apenas os primeiros 32 bytes para verificar a assinatura
    reader.readAsArrayBuffer(file.slice(0, 32));
  });
};

/**
 * Valida assinatura de imagem (magic numbers)
 */
const validateImageSignature = (bytes: Uint8Array, mimeType: string): boolean => {
  // JPEG: FF D8 FF
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
  }
  
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (mimeType === 'image/png') {
    return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
  }
  
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (mimeType === 'image/webp') {
    return bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
           bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  }
  
  // GIF: 47 49 46 38
  if (mimeType === 'image/gif') {
    return bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38;
  }
  
  return true; // Para outros tipos, assumir válido
};

/**
 * Valida assinatura de vídeo (magic numbers)
 */
const validateVideoSignature = (bytes: Uint8Array, mimeType: string): boolean => {
  // MP4: 00 00 00 XX 66 74 79 70 (onde XX pode variar)
  if (mimeType === 'video/mp4') {
    return bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;
  }
  
  // AVI: 52 49 46 46 ... 41 56 49 20
  if (mimeType === 'video/x-msvideo') {
    return bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
  }
  
  // WebM: 1A 45 DF A3
  if (mimeType === 'video/webm') {
    return bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3;
  }
  
  return true; // Para outros tipos, assumir válido
};

/**
 * Função principal de validação que executa todas as verificações
 */
export const validateMediaFile = async (file: File, currentFiles: File[] = []): Promise<ValidationResult> => {
  // 1. Validar tipo de arquivo
  const typeValidation = validateFileType(file);
  if (!typeValidation.isValid) {
    return typeValidation;
  }
  
  // 2. Validar tamanho
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }
  
  // 3. Validar quantidade
  const countValidation = validateFileCount(currentFiles, [file]);
  if (!countValidation.isValid) {
    return countValidation;
  }
  
  // 4. Validar conteúdo do arquivo
  const contentValidation = await validateFileContent(file);
  if (!contentValidation.isValid) {
    return contentValidation;
  }
  
  return { isValid: true };
};

/**
 * Valida múltiplos arquivos
 */
export const validateMultipleFiles = async (files: File[], currentFiles: File[] = []): Promise<{
  validFiles: File[];
  invalidFiles: { file: File; error: string; errorKey?: string }[];
}> => {
  const validFiles: File[] = [];
  const invalidFiles: { file: File; error: string; errorKey?: string }[] = [];
  
  // Primeiro, verificar se o total não excede o limite
  const countValidation = validateFileCount(currentFiles, files);
  if (!countValidation.isValid) {
    // Se exceder o limite, marcar todos como inválidos
    files.forEach(file => {
      invalidFiles.push({
        file,
        error: countValidation.error!,
        errorKey: countValidation.errorKey
      });
    });
    return { validFiles, invalidFiles };
  }
  
  // Validar cada arquivo individualmente
  for (const file of files) {
    const validation = await validateMediaFile(file, [...currentFiles, ...validFiles]);
    
    if (validation.isValid) {
      validFiles.push(file);
    } else {
      invalidFiles.push({
        file,
        error: validation.error!,
        errorKey: validation.errorKey
      });
    }
  }
  
  return { validFiles, invalidFiles };
};

/**
 * Valida arquivos de mídia e retorna resultado formatado para o frontend
 */
export const validateMediaFiles = async (files: File[], currentFileCount: number = 0): Promise<{
  isValid: boolean;
  validFiles: File[];
  errors: Array<{
    type: string;
    context?: any;
  }>;
}> => {
  // Criar array de arquivos atuais fictício baseado na contagem
  const currentFiles: File[] = new Array(currentFileCount).fill(null);
  
  const result = await validateMultipleFiles(files, currentFiles);
  
  const errors = result.invalidFiles.map(invalid => ({
    type: invalid.errorKey || 'unknown',
    context: {
      fileName: invalid.file.name,
      fileSize: invalid.file.size,
      fileType: invalid.file.type
    }
  }));
  
  return {
    isValid: result.invalidFiles.length === 0,
    validFiles: result.validFiles,
    errors
  };
};