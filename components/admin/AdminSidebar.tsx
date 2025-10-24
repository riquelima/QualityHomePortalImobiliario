import React from 'react';
import AdsIcon from '../icons/AdsIcon';
import PlusIcon from '../icons/PlusIcon';
import LogoutIcon from '../icons/LogoutIcon';
import CloseIcon from '../icons/CloseIcon';
import { AdminUser } from '../../services/adminAuth';

interface AdminSidebarProps {
  activeSection: 'dashboard' | 'properties' | 'publish';
  onSectionChange: (section: 'dashboard' | 'properties' | 'publish') => void;
  onLogout: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  currentAdmin?: AdminUser | null;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSectionChange,
  onLogout,
  isCollapsed = false,
  onToggleCollapse,
  currentAdmin
}) => {
  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'properties' as const,
      label: 'Gerenciar Anúncios',
      icon: AdsIcon
    },
    {
      id: 'publish' as const,
      label: 'Novo Anúncio',
      icon: PlusIcon
    }
  ];

  return (
    <div className={`h-full bg-gray-900 text-white flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <img 
              src="https://i.postimg.cc/QNJ63Www/logo.png" 
              alt="Quallity Home Logo" 
              className="w-10 h-10 rounded-lg object-cover"
            />
            <h2 className="text-xl font-bold">Admin</h2>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        >
          {isCollapsed ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          ) : (
            <CloseIcon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onSectionChange(item.id);
              // Fechar sidebar em dispositivos móveis
              if (onToggleCollapse && window.innerWidth < 1024) {
                onToggleCollapse();
              }
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group ${
              activeSection === item.id
                ? 'bg-brand-red text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <item.icon className="w-6 h-6" />
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 w-max bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        {currentAdmin && (
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-medium">
                {currentAdmin.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {currentAdmin.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {currentAdmin.email}
                </p>
              </div>
            )}
          </div>
        )}
        
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors group"
        >
          <LogoutIcon className="w-6 h-6" />
          {!isCollapsed && <span className="font-medium">Sair</span>}
          {isCollapsed && (
              <div className="absolute left-full ml-2 w-max bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300">
                Sair
              </div>
            )}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;