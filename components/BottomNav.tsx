import React from 'react';
import SearchIcon from './icons/SearchIcon';
import HeartIcon from './icons/HeartIcon';
import AdsIcon from './icons/AdsIcon';
import ChatIcon from './icons/ChatIcon';
import UserIcon from './icons/UserIcon';
import PlusIcon from './icons/PlusIcon';

type MainView = 'home' | 'favorites' | 'myAds' | 'chatList' | 'publish';

interface BottomNavProps {
    activeView: MainView;
    onNavigate: (view: MainView) => void;
    hasUnreadMessages: boolean;
}

const NavItem: React.FC<{
    view: MainView;
    label: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    isActive: boolean;
    onClick: () => void;
    hasNotification?: boolean;
}> = ({ view, label, Icon, isActive, onClick, hasNotification }) => {
    
    if (view === 'publish') {
         return (
            <button
                onClick={onClick}
                className="flex flex-col items-center justify-center text-brand-gray hover:text-brand-red transition-colors -mt-4"
                aria-label={label}
            >
                <div className="bg-brand-red text-white rounded-full p-3 shadow-lg">
                    <PlusIcon className="w-7 h-7" />
                </div>
            </button>
        );
    }
    
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center text-center px-2 py-1.5 w-16"
            aria-label={label}
        >
            <div className="relative">
                <Icon className={`w-6 h-6 mb-0.5 transition-colors ${isActive ? 'text-brand-red' : 'text-brand-gray'}`} />
                 {hasNotification && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-brand-red ring-2 ring-white" />
                )}
            </div>
            <span className={`text-xs transition-colors ${isActive ? 'text-brand-red font-semibold' : 'text-brand-gray'}`}>
                {label}
            </span>
        </button>
    );
};


const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate, hasUnreadMessages }) => {
    const navItems: { view: MainView; label: string; Icon: React.FC<any>; }[] = [
        { view: 'home', label: 'Explorar', Icon: SearchIcon },
        { view: 'favorites', label: 'Favoritos', Icon: HeartIcon },
        { view: 'publish', label: 'Publicar', Icon: PlusIcon },
        { view: 'chatList', label: 'Chat', Icon: ChatIcon },
        { view: 'myAds', label: 'Anúncios', Icon: AdsIcon },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
            <div className="flex justify-around items-center h-16">
                {navItems.map(item => (
                    <NavItem
                        key={item.view}
                        view={item.view}
                        label={item.label}
                        Icon={item.Icon}
                        isActive={activeView === item.view}
                        onClick={() => onNavigate(item.view)}
                        hasNotification={item.view === 'chatList' && hasUnreadMessages}
                    />
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;