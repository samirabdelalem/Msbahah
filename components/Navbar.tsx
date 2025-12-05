
import React from 'react';
import { Home, Fingerprint, BookOpen } from 'lucide-react';
import { TabView } from '../types';

interface NavbarProps {
  currentTab: TabView;
  onTabChange: (tab: TabView) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { id: TabView.HOME, icon: Home, label: 'الرئيسية' },
    { id: TabView.TASBIH, icon: Fingerprint, label: 'السبحة' },
    { id: TabView.HISN_MUSLIM, icon: BookOpen, label: 'حصن المسلم' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 min-h-[80px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-white/10 pb-safe z-50 transition-colors duration-300">
      <div className="flex justify-around items-center h-[80px] px-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 group ${
                isActive 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-emerald-100 dark:bg-emerald-400/10 -translate-y-1' : 'group-hover:bg-slate-50 dark:group-hover:bg-white/5'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] mt-1 font-medium transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navbar;
