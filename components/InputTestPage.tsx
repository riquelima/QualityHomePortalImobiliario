import React, { useState } from 'react';

const InputTestPage: React.FC = () => {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');
  const [textarea1, setTextarea1] = useState('');

  console.log('InputTestPage renderizou - input1:', input1, 'input2:', input2);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🧪 Teste de Inputs</h1>
        
        <div className="space-y-6">
          {/* Teste 1: Input simples com useState */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teste 1: Input Simples
            </label>
            <input
              type="text"
              value={input1}
              onChange={(e) => setInput1(e.target.value)}
              placeholder="Digite aqui..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-600 mt-1">Valor: "{input1}"</p>
          </div>

          {/* Teste 2: Input com handler inline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teste 2: Handler Inline
            </label>
            <input
              type="text"
              value={input2}
              onChange={(e) => {
                console.log('Input 2 mudou:', e.target.value);
                setInput2(e.target.value);
              }}
              placeholder="Digite aqui..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-600 mt-1">Valor: "{input2}"</p>
          </div>

          {/* Teste 3: Input com handler separado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teste 3: Handler Separado
            </label>
            <input
              type="text"
              value={input3}
              onChange={handleInput3Change}
              placeholder="Digite aqui..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-600 mt-1">Valor: "{input3}"</p>
          </div>

          {/* Teste 4: Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teste 4: Textarea
            </label>
            <textarea
              value={textarea1}
              onChange={(e) => setTextarea1(e.target.value)}
              placeholder="Digite aqui..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-600 mt-1">Valor: "{textarea1}"</p>
          </div>

          {/* Botão para limpar */}
          <button
            onClick={() => {
              setInput1('');
              setInput2('');
              setInput3('');
              setTextarea1('');
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Limpar Todos
          </button>
        </div>
      </div>
    </div>
  );

  function handleInput3Change(e: React.ChangeEvent<HTMLInputElement>) {
    console.log('Input 3 mudou:', e.target.value);
    setInput3(e.target.value);
  }
};

export default InputTestPage;