import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import PropertyManagement from './PropertyManagement';
import PublishForm from './PublishForm';
import type { Property, User } from '../../types';

interface AdminLayoutProps {
  properties: Property[];
  onViewDetails: (id: number) => void;
  onDeleteProperty: (id: number) => void;
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

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  properties,
  onViewDetails,
  onDeleteProperty,
  onEditProperty,
  onPublishClick,
  onAdminLogout,
  onShareProperty,
  adminUser,
  onAddProperty,
  onUpdateProperty,
  onPublishError,
  onPublishSuccess,
  propertyToEdit,
  onBack
}) => {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'properties' | 'publish'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSectionChange = (section: 'dashboard' | 'properties' | 'publish') => {
    setActiveSection(section);
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
          <PropertyManagement
            properties={properties}
            onViewDetails={onViewDetails}
            onDeleteProperty={onDeleteProperty}
            onEditProperty={(property) => {
              onEditProperty(property);
              setActiveSection('publish');
            }}
            onShareProperty={onShareProperty}
            onPublishNew={() => setActiveSection('publish')}
            onSectionChange={handleSectionChange}
          />
        );
      case 'publish':
        return (
          <PublishForm
            onBack={() => setActiveSection('dashboard')}
            onSuccess={(status) => {
              onPublishSuccess(status);
              setActiveSection('dashboard');
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
          onLogout={onAdminLogout}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
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
              <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">QH</span>
              </div>
              <h1 className="text-lg font-semibold text-gray-900">Admin</h1>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeSection === 'dashboard' && 'Dashboard'}
                {activeSection === 'properties' && 'Gerenciar Anúncios'}
                {activeSection === 'publish' && 'Publicar Anúncio'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.07 2.82l3.12 3.12M7.05 5.84l3.12 3.12M4.03 8.86l3.12 3.12M1.01 11.88l3.12 3.12" />
                </svg>
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>
              
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
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
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="min-h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;