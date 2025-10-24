import React from 'react';
import type { Property, User } from '../../types';

interface PublishFormProps {
  onBack: () => void;
  onSuccess: (status: 'published' | 'updated') => void;
  onError: (message: string) => void;
  propertyToEdit?: Property | null;
  adminUser: User | null;
}

const PublishForm: React.FC<PublishFormProps> = ({
  onBack,
  onSuccess,
  onError,
  propertyToEdit,
  adminUser
}) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          {propertyToEdit ? 'Editar Anúncio' : 'Publicar Novo Anúncio'}
        </h1>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};

export default PublishForm;