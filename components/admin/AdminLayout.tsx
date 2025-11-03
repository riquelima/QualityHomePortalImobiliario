import React, { useState, useEffect } from 'react';
import { AdminSidebar, AdminDashboard, PropertyManagementNew } from './index';
import PublishJourneyAdmin from './PublishJourneyAdmin';
import { adminAuthService, AdminUser } from '../../services/adminAuth';
import type { Property, User } from '../../types';
import { supabase } from '../../supabaseClient';

interface AdminLayoutProps {
  onViewDetails: (id: number) => void;
  onEditProperty: (property: Property) => void;
  onPublishClick: () => void;
  onAdminLogout: () => void;
  onShareProperty: (id: number) => void;
  adminUser: User | null;
  onAddProperty: () => Promise<void>;
  onUpdateProperty: () => Promise<void>;
  onPublishError: (message: string) => void;
  onPublishSuccess: (status: 'published' | 'updated') => void;
  propertyToEdit?: Property | null;
  onBack: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  onViewDetails,
  onPublishClick,
  onAdminLogout,
  onShareProperty,
  adminUser,
  onAddProperty,
  onUpdateProperty,
  onPublishError,
  onPublishSuccess,
  onBack
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'properties' | 'publish'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    const admin = adminAuthService.getCurrentAdmin();
    setCurrentAdmin(admin);
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const { data, error } = await supabase.from('imoveis').select('*');
    if (data) {
      setProperties(data);
    }
    if (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleDeleteProperty = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este imóvel?')) {
      const { error } = await supabase.from('imoveis').delete().match({ id });
      if (error) {
        console.error('Error deleting property:', error);
        // Adicionar notificação de erro para o usuário
      } else {
        fetchProperties();
        // Adicionar notificação de sucesso para o usuário
      }
    }
  };

  const handleEditProperty = (property: Property) => {
    setPropertyToEdit(property);
    setActiveSection('publish');
  };

  const handleSectionChange = (section: 'dashboard' | 'properties' | 'publish') => {
    if (section !== 'publish') {
      setPropertyToEdit(null);
    }
    setActiveSection(section);
  };

  const handleLogout = () => {
    adminAuthService.logout();
    onAdminLogout();
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <AdminDashboard 
            properties={properties}
            onNavigateToProperties={() => setActiveSection('properties')}
            onNavigateToPublish={() => setActiveSection('publish')}
            onSectionChange={handleSectionChange}
          />
        );
      case 'properties':
        return (
          <PropertyManagementNew
            onViewDetails={onViewDetails}
            onDeleteProperty={handleDeleteProperty}
            onEditProperty={handleEditProperty}
            onShareProperty={onShareProperty}
            onSectionChange={handleSectionChange}
          />
        );
      case 'publish':
        return (
          <PublishJourneyAdmin
            onBack={() => handleSectionChange('dashboard')}
            onSuccess={(property) => {
              onPublishSuccess(propertyToEdit ? 'updated' : 'published');
              fetchProperties();
              handleSectionChange('dashboard');
            }}
            onError={onPublishError}
            propertyToEdit={propertyToEdit}
            adminUser={adminUser}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0 ${
        isSidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
      }`}>
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          onLogout={handleLogout}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          currentAdmin={currentAdmin}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <img 
                src="https://i.postimg.cc/QNJ63Www/logo.png" 
                alt="Quallity Home Logo" 
                className="h-8 w-auto"
              />
              <h1 className="text-lg font-semibold text-gray-900">Admin</h1>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {activeSection === 'dashboard' && 'Dashboard'}
              {activeSection === 'properties' && 'Gerenciar Anúncios'}
              {activeSection === 'publish' && 'Novo Anúncio'}
            </h2>
            
            <div className="flex items-center space-x-4">
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <img 
                  src="https://i.postimg.cc/QNJ63Www/logo.png" 
                  alt="Quallity Home Logo" 
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-gray-700">Administrador</span>
              </div>
              
              <button
                onClick={onBack}
                className="text-sm text-brand-gray hover:text-brand-dark transition-colors"
              >
                Voltar ao site
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 min-h-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;