


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
  onMarkAsRead: (sessionId: string) => void;
}

const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

const ChatPage: React.FC<ChatPageProps> = ({ onBack, user, session, property, onSendMessage, onMarkAsRead }) => {
  const { t } = useLanguage();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const otherParticipantId = Object.keys(session.participants).find(id => id !== user.id);
  const otherParticipant = otherParticipantId ? session.participants[otherParticipantId] : null;
  const otherParticipantName = otherParticipant?.nome_completo || 'Anunciante';
  const otherParticipantInitials = getInitials(otherParticipantName);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages]);
  
  useEffect(() => {
    onMarkAsRead(session.id);
  }, [session.id, onMarkAsRead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(session.id, newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 flex-shrink-0">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center">
          <button onClick={onBack} className="mr-3 text-brand-dark hover:text-brand-red">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-brand-gray text-white font-bold mr-3">
              {otherParticipantInitials}
          </div>
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-brand-navy truncate">{otherParticipantName}</h1>
            <p className="text-sm text-brand-gray truncate">{property.title}</p>
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
                  <p className="text-sm sm:text-base whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 text-right ${isSentByUser ? 'text-gray-300' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
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