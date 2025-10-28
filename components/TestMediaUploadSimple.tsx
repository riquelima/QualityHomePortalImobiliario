import React, { useState, useEffect } from 'react';
import MediaUpload from './admin/MediaUpload';
import type { MediaFile } from './admin/types';

const TestMediaUploadSimple: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [errorLog, setErrorLog] = useState<string[]>([]);
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [lastError, setLastError] = useState<string>('');
  const [testInput, setTestInput] = useState<string>('');

  const addToActivityLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setActivityLog(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  const addToErrorLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ❌ ${message}`;
    setErrorLog(prev => [...prev, logEntry]);
    setLastError(message);
    console.error(logEntry);
  };

  const handleMediaFilesChange = (files: MediaFile[]) => {
    setMediaFiles(files);
    addToActivityLog(`✅ ${files.length} arquivo(s) carregado(s) com sucesso`);
    
    // Log detalhado dos arquivos
    files.forEach((file, index) => {
      addToActivityLog(`   ${index + 1}. ${file.file.name} (${file.type}, ${(file.file.size / 1024 / 1024).toFixed(2)}MB)`);
    });
  };

  const handleMediaError = (message: string) => {
    addToErrorLog(message);
  };

  const clearLogs = () => {
    setErrorLog([]);
    setActivityLog([]);
    setLastError('');
    addToActivityLog('🗑️ Logs limpos');
  };

  const clearFiles = () => {
    setMediaFiles([]);
    addToActivityLog('🗑️ Arquivos removidos');
  };

  const handleTestInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTestInput(value);
    addToActivityLog(`📝 Input de teste alterado: "${value}"`);
  };

  const testWithDifferentFiles = () => {
    addToActivityLog('🧪 Iniciando teste com diferentes tipos de arquivo...');
    addToActivityLog('   Teste 1: Tente carregar uma imagem JPEG/PNG');
    addToActivityLog('   Teste 2: Tente carregar um arquivo muito grande (>32MB)');
    addToActivityLog('   Teste 3: Tente carregar mais de 10 arquivos');
    addToActivityLog('   Teste 4: Tente carregar um arquivo não suportado (.txt, .exe)');
  };

  useEffect(() => {
    addToActivityLog('🚀 Componente de teste inicializado');
    addToActivityLog('📝 Abra o console do navegador (F12) para logs detalhados');
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          🧪 Teste Avançado do MediaUpload
        </h1>
        
        {/* Área de Upload */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            📁 Upload de Mídias
          </h2>
          
          <MediaUpload
            files={mediaFiles}
            onFilesChange={handleMediaFilesChange}
            onError={handleMediaError}
            maxFiles={10}
          />
        </div>

        {/* Status e Controles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Status Atual */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">📊 Status Atual</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Arquivos carregados:</span>
                <span className="text-blue-600 font-bold">{mediaFiles.length}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Último erro:</span>
                <span className={`text-sm ${lastError ? 'text-red-600' : 'text-green-600'}`}>
                  {lastError || 'Nenhum'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total de erros:</span>
                <span className="text-red-600 font-bold">{errorLog.length}</span>
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">🎮 Controles</h3>
            <div className="space-y-3">
              <button
                onClick={clearLogs}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                🗑️ Limpar Logs
              </button>
              <button
                onClick={clearFiles}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                🗑️ Limpar Arquivos
              </button>
              <button
                onClick={testWithDifferentFiles}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                🧪 Guia de Testes
              </button>
            </div>
          </div>

          {/* Input de Teste */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">🔍 Teste de Input</h3>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Digite algo para testar o bloqueio do teclado:
              </label>
              <input
                type="text"
                value={testInput}
                onChange={handleTestInputChange}
                placeholder="Digite aqui para testar..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-600">
                Valor atual: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{testInput || '(vazio)'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Log de Atividades */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">📝 Log de Atividades</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {activityLog.length === 0 ? (
                <p className="text-gray-500">Nenhuma atividade registrada...</p>
              ) : (
                activityLog.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </div>

          {/* Log de Erros */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">❌ Log de Erros</h3>
            <div className="bg-gray-900 text-red-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {errorLog.length === 0 ? (
                <p className="text-gray-500">Nenhum erro registrado... 🎉</p>
              ) : (
                errorLog.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Arquivos Carregados */}
        {mediaFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              📁 Arquivos Carregados ({mediaFiles.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mediaFiles.map((file, index) => (
                <div key={file.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                    {file.type === 'image' ? (
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <span className="text-3xl">🎥</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate" title={file.file.name}>
                    {file.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 Instruções de Teste</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">✅ Testes Válidos:</h4>
              <ul className="text-blue-600 space-y-1 text-sm">
                <li>• Imagens: JPEG, PNG, WebP, GIF</li>
                <li>• Vídeos: MP4, AVI, MOV, WebM</li>
                <li>• Tamanho: Imagens ≤32MB, Vídeos ≤600MB</li>
                <li>• Quantidade: Máximo 10 arquivos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">❌ Testes de Erro:</h4>
              <ul className="text-blue-600 space-y-1 text-sm">
                <li>• Arquivos muito grandes</li>
                <li>• Tipos não suportados (.txt, .exe)</li>
                <li>• Mais de 10 arquivos</li>
                <li>• Arquivos corrompidos</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-100 rounded">
            <p className="text-blue-800 text-sm">
              💡 <strong>Dica:</strong> Abra o console do navegador (F12) para ver logs detalhados e informações de debug.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestMediaUploadSimple;