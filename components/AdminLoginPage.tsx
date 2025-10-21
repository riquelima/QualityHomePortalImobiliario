
import React, { useState } from 'react';

interface AdminLoginPageProps {
  onAdminLogin: (success: boolean) => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onAdminLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simular um pequeno delay para mostrar o loading
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verificar credenciais hardcoded
    if (email === 'quallity@admin.com' && password === '1234') {
      setIsLoading(false);
      onAdminLogin(true);
    } else {
      setIsLoading(false);
      setError('Credenciais inválidas. Verifique seu email e senha.');
      onAdminLogin(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light-gray flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <img src="https://i.postimg.cc/QNJ63Www/logo.png" alt="Quallity Home Logo" className="h-24 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-center text-brand-navy mb-6">Acesso Restrito</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-brand-gray mb-1" htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-brand-gray mb-1" htmlFor="password">Senha</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brand-navy hover:bg-brand-dark text-white font-bold py-3 rounded-md transition-colors flex justify-center items-center disabled:opacity-75 disabled:cursor-wait"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;