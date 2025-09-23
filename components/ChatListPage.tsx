import React from 'react';
import Header from './Header';
import type { User, Property, ChatSession, Profile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import ChatIcon from './icons/ChatIcon';

interface ChatListPageProps {
  onBack: () => void;
  user: User | null;
  profile: Profile | null;
  onLogout: () => void;
  onPublishAdClick: () => void;
  onAccessClick: () => void;
  onNavigateToFavorites: () => void;
  onNavigateToChatList: () => void;
  chatSessions: ChatSession[];
  properties: Property[];
  onNavigateToChat: (sessionId: string) => void;
  onNavigateToMyAds: () => void;
  onNavigateToAllListings: () => void;
  hasUnreadMessages: boolean;
  navigateToGuideToSell: () => void;
  navigateToDocumentsForSale: () => void;
  navigateHome: () => void;
  // FIX: Added onSearchSubmit prop to pass to Header component.
  onSearchSubmit: (query: string) => void;
}

const ChatListPage: React.FC<ChatListPageProps> = (props) => {
  const { t } = useLanguage();
  const { user, chatSessions, properties, onNavigateToChat } = props;

  const getOtherParticipantName = (session: ChatSession) => {
    const otherParticipantId = Object.keys(session.participantes).find(id => id !== user?.id);
    return otherParticipantId ? session.participantes[otherParticipantId].nome_completo : 'Anunciante';
  };
  
  const getPropertyTitle = (propertyId: number) => {
    return properties.find(p => p.id === propertyId)?.title || 'Imóvel não encontrado';
  };

  return (
    <div className="bg-brand-light-gray min-h-screen flex flex-col">
      <Header {...props} />
      <main className="flex-grow pb-24">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-8">{t('chatList.title')}</h1>
          {chatSessions.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {chatSessions.map(session => (
                  <li key={session.sessionId} onClick={() => onNavigateToChat(session.sessionId)} className="p-4 sm:p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-brand-red">{t('chatPage.title', { title: getPropertyTitle(session.propertyId) })}</p>
                        <p className="text-lg font-bold text-brand-navy">{getOtherParticipantName(session)}</p>
                        <p className="text-sm text-brand-gray truncate">
                          {session.messages.length > 0 ? session.messages[session.messages.length - 1].text : "Nenhuma mensagem ainda"}
                        </p>
                      </div>
                      <div className="text-brand-gray text-xs">
                        {session.messages.length > 0 && new Date(session.messages[session.messages.length - 1].timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-16 sm:py-20 bg-white rounded-lg shadow-md">
              <ChatIcon className="w-12 h-12 sm:w-16 sm:h-16 text-brand-gray mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-2">{t('chatList.noChats.title')}</h2>
              <p className="text-brand-gray max-w-md mx-auto">{t('chatList.noChats.description')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default ChatListPage;
