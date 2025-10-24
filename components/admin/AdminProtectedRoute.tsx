import React, { useEffect, useState } from 'react';
import { adminAuthService } from '../../services/adminAuth';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  onUnauthorized: () => void;
  requiredRole?: string;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children, 
  onUnauthorized, 
  requiredRole = 'admin' 
}) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = adminAuthService.isAuthenticated();
        const hasPermission = adminAuthService.hasPermission(requiredRole);

        if (isAuthenticated && hasPermission) {
          setIsAuthorized(true);
          // Atualizar último acesso
          await adminAuthService.updateLastAccess();
        } else {
          setIsAuthorized(false);
          onUnauthorized();
        }
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        setIsAuthorized(false);
        onUnauthorized();
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [onUnauthorized, requiredRole]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta área.</p>
          <button
            onClick={onUnauthorized}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;