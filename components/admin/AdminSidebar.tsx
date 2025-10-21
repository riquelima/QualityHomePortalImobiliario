import React from 'react';
import AdsIcon from '../icons/AdsIcon';
import PlusIcon from '../icons/PlusIcon';
import LogoutIcon from '../icons/LogoutIcon';

interface AdminSidebarProps {
  activeSection: 'dashboard' | 'properties' | 'publish';
  onSectionChange: (section: 'dashboard' | 'properties' | 'publish') => void;
  onLogout: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSectionChange,
  onLogout,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      )
    },
    {
      id: 'properties' as const,
      label: 'Gerenciar Anúncios',
      icon: <AdsIcon className="w-5 h-5" />
    },
    {
      id: 'publish' as const,
      label: 'Publicar Anúncio',
      icon: <PlusIcon className="w-5 h-5" />
    }
  ];

  return (
    <div className="h-full w-64 lg:w-64 md:w-20 bg-white shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">QH</span>
            </div>
            {!isCollapsed && (
              <div className="hidden lg:block">
                <h2 className="text-lg font-bold text-gray-900">Quality Home</h2>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center justify-center lg:justify-start space-x-0 lg:space-x-3 px-2 lg:px-4 py-3 rounded-lg text-left transition-colors ${
              activeSection === item.id
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="hidden lg:block font-medium">{item.label}</span>
            {/* Mobile tooltip */}
            <div className="lg:hidden absolute left-16 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
              {item.label}
            </div>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 lg:p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center lg:justify-start space-x-0 lg:space-x-3 px-2 lg:px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors group relative"
        >
          <LogoutIcon className="w-5 h-5" />
          <span className="hidden lg:block font-medium">Sair</span>
          {/* Mobile tooltip */}
          <div className="lg:hidden absolute left-16 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
            Sair
          </div>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;