

import React, { useState, useRef, useEffect } from 'react';
import type { User, Property, ChatSession } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import SendIcon from './icons/SendIcon';

interface ChatPageProps {
  onBack: () => void;
  user: User;
  session: ChatSession;
  property: Property;
  onSendMessage: (sessionId: string, text: string) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ onBack, user, session, property, onSendMessage }) => {
  const { t } = useLanguage();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // FIX: Correctly find the other participant's name.
  // The key in `participantes` is the user ID. We find the participant whose ID is not the current user's.
  const otherParticipantId = Object.keys(session.participantes).find(id => id !== user.id);
  const otherParticipant = otherParticipantId ? session.participantes[otherParticipantId] : null;
  const otherParticipantName = otherParticipant ? otherParticipant.nome_completo : 'Anunciante';


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(session.sessionId, newMessage);
    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 flex-shrink-0">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center">
          <button onClick={onBack} className="mr-4 text-brand-dark hover:text-brand-red">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div>
            {/* FIX: `otherParticipantName` is now a string and can be rendered. */}
            <h1 className="text-lg font-bold text-brand-navy truncate">{otherParticipantName}</h1>
            <p className="text-sm text-brand-gray truncate">{t('chatPage.title', { title: property.title })}</p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-brand-light-gray">
        <div className="max-w-4xl mx-auto space-y-4">
          {session.messages.map((message) => {
            const isSentByUser = message.senderId === user.id;
            return (
              <div key={message.id} className={`flex items-end gap-2 ${isSentByUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${isSentByUser ? 'bg-brand-navy text-white rounded-br-lg' : 'bg-white text-brand-dark border rounded-bl-lg'}`}>
                  <p>{message.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <footer className="bg-white p-4 border-t flex-shrink-0">
        <form onSubmit={handleSubmit} className="container mx-auto flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('chatPage.messagePlaceholder')}
            className="flex-grow w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-red"
            autoComplete="off"
          />
          <button type="submit" disabled={!newMessage.trim()} className="bg-brand-red text-white p-3 rounded-full hover:opacity-90 disabled:bg-gray-300 transition-colors">
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;
