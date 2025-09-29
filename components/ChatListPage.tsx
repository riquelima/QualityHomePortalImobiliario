


import React from 'react';
import Header from './Header';
// FIX: Import Profile type.
import type { User, Property, ChatSession, Profile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import ChatIcon from './icons/ChatIcon';

interface ChatListPageProps {
  onBack: () => void;
  user: User | null;
  // FIX: Added profile prop to be passed to Header.
  profile: Profile | null;
  onLogout: () => void;
  onPublishAdClick: () => void;
  onAccessClick: () => void;
  onNavigateToFavorites: () => void;
  onNavigateToChatList: () => void;
  chatSessions: ChatSession[];
  properties: Property[];
  onNavigateToChat: (sessionId: string) => void;
  // FIX: Add onNavigateToMyAds prop to resolve typing error.
  onNavigateToMyAds: () => void;
  onNavigateToAllListings: () => void;
  unreadCount: number;
  // FIX: Added missing props for Header.
  navigateToGuideToSell: () => void;
  navigateToDocumentsForSale: () => void;
  navigateHome: () => void;
}

const ChatListPage: React.FC<ChatListPageProps> = ({
  onBack, user, profile, onLogout, onPublishAdClick, onAccessClick, onNavigateToFavorites, onNavigateToChatList, chatSessions, properties, onNavigateToChat, onNavigateToMyAds, onNavigateToAllListings, unreadCount, navigateToGuideToSell, navigateToDocumentsForSale, navigateHome
}) => {
  const { t } = useLanguage();

  const getOtherParticipantName = (session: ChatSession) => {
    const otherParticipantId = Object.keys(session.participants).find(id => id !== user?.id);
    return otherParticipantId ? session.participants[otherParticipantId].nome_completo : 'Anunciante';
  };

  const getPropertyForSession = (session: ChatSession) => {
    return properties.find(p => p.id === session.imovel_id);
  };

  const sortedSessions = [...chatSessions].sort((a, b) => {
    const lastMessageA = a.messages[a.messages.length - 1];
    const lastMessageB = b.messages[b.messages.length - 1];
    if (!lastMessageA) return 1;
    if (!lastMessageB) return -1;
    return new Date(lastMessageB.timestamp).getTime() - new Date(lastMessageA.timestamp).getTime();
  });


  return (
    <div className="bg-brand-light-gray min-h-screen flex flex-col">
      <Header
        onPublishAdClick={onPublishAdClick}
        onAccessClick={onAccessClick}
        user={user}
        profile={profile}
        onLogout={onLogout}
        onNavigateToFavorites={onNavigateToFavorites}
        onNavigateToChatList={onNavigateToChatList}
        onNavigateToMyAds={onNavigateToMyAds}
        onNavigateToAllListings={onNavigateToAllListings}
        unreadCount={unreadCount}
        navigateToGuideToSell={navigateToGuideToSell}
        navigateToDocumentsForSale={navigateToDocumentsForSale}
        navigateHome={navigateHome}
      />
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="text-sm mb-6">
            <span onClick={onBack} className="text-brand-red hover:underline cursor-pointer">{t('map.breadcrumbs.home')}</span>
            <span className="text-brand-gray mx-2">&gt;</span>
            <span className="text-brand-dark font-medium">{t('chatList.breadcrumb')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-8">{t('chatList.title')}</h1>
          {sortedSessions.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {sortedSessions.map(session => {
                  const property = getPropertyForSession(session);
                  const lastMessage = session.messages[session.messages.length - 1];
                  const placeholderImage = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
                  const imageSrc = property?.images?.[0] || placeholderImage;
                  
                  return (
                    <li key={session.id} onClick={() => onNavigateToChat(session.id)} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                       <div className="flex items-center gap-4">
                          <img src={imageSrc} alt={property?.title || 'Property'} className="w-16 h-16 rounded-md object-cover flex-shrink-0"/>
                          <div className="flex-grow overflow-hidden">
                               <div className="flex justify-between items-baseline">
                                  <p className="text-lg font-bold text-brand-navy truncate">{getOtherParticipantName(session)}</p>
                                  {lastMessage && (
                                    <p className="text-xs text-brand-gray flex-shrink-0 ml-2">
                                        {new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  )}
                               </div>
                               <p className="text-sm font-semibold text-brand-red truncate">{property?.title || 'Anúncio indisponível'}</p>
                               <p className="text-sm text-brand-gray truncate">
                                  {lastMessage ? lastMessage.text : "Nenhuma mensagem ainda"}
                               </p>
                          </div>
                          {session.unreadCount > 0 && (
                            <div className="flex-shrink-0 ml-2">
                                <span className="w-6 h-6 bg-brand-red rounded-full text-white text-xs font-bold flex items-center justify-center">
                                    {session.unreadCount}
                                </span>
                            </div>
                           )}
                      </div>
                    </li>
                  )
                })}
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