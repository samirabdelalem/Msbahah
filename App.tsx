
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GlobalDashboard from './components/GlobalDashboard';
import DigitalTasbih from './components/DigitalTasbih';
import HisnMuslim from './components/HisnMuslim';
import { TabView, ThemeMode } from './types';
import { getDailyHadithOrWisdom } from './services/geminiService';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabView>(TabView.HOME);
  const [personalTotal, setPersonalTotal] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);
  
  // --- Settings State (Global) ---
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('setting_sound');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('setting_haptics');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('setting_sound', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('setting_haptics', JSON.stringify(hapticsEnabled));
  }, [hapticsEnabled]);

  // Theme State
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme_mode');
    return (saved as ThemeMode) || ThemeMode.SYSTEM;
  });

  // --- Theme Logic ---
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    const applySystemTheme = () => {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
    };

    if (themeMode === ThemeMode.SYSTEM) {
        applySystemTheme();
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
             root.classList.remove('light', 'dark');
             applySystemTheme();
        };
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    } else {
        root.classList.add(themeMode);
    }
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('theme_mode', themeMode);
  }, [themeMode]);


  // Load data from localStorage
  useEffect(() => {
    const savedTotal = localStorage.getItem('billion_salawat_total');
    if (savedTotal) setPersonalTotal(parseInt(savedTotal));
    
    // Fetch daily inspirational message
    fetchDailyInspiration();
  }, []);

  const fetchDailyInspiration = async () => {
    const hasSeenToday = sessionStorage.getItem('daily_msg_seen');
    if (!hasSeenToday && process.env.API_KEY) {
        try {
             const msg = await getDailyHadithOrWisdom();
             setNotification(msg);
             sessionStorage.setItem('daily_msg_seen', 'true');
        } catch (e) {
            console.log("Skipping AI daily msg due to error or missing key");
        }
    }
  };

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('billion_salawat_total', personalTotal.toString());
  }, [personalTotal]);

  const handleCampaignIncrement = (amount: number) => {
    setPersonalTotal(prev => prev + amount);
  };

  const renderContent = () => {
    switch (currentTab) {
      case TabView.HOME:
        return (
            <GlobalDashboard 
                personalTotal={personalTotal} 
                onIncrement={handleCampaignIncrement}
                themeMode={themeMode}
                setThemeMode={setThemeMode}
                soundEnabled={soundEnabled}
                setSoundEnabled={setSoundEnabled}
                hapticsEnabled={hapticsEnabled}
                setHapticsEnabled={setHapticsEnabled}
            />
        );
      case TabView.TASBIH:
        return (
          <DigitalTasbih 
            soundEnabled={soundEnabled}
            hapticsEnabled={hapticsEnabled}
          />
        );
      case TabView.HISN_MUSLIM:
        return (
          <HisnMuslim 
            soundEnabled={soundEnabled}
            hapticsEnabled={hapticsEnabled}
          />
        );
      default:
        return (
            <GlobalDashboard 
                personalTotal={personalTotal} 
                onIncrement={handleCampaignIncrement}
                themeMode={themeMode}
                setThemeMode={setThemeMode}
                soundEnabled={soundEnabled}
                setSoundEnabled={setSoundEnabled}
                hapticsEnabled={hapticsEnabled}
                setHapticsEnabled={setHapticsEnabled}
            />
        );
    }
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300">
      {/* Dynamic Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100 via-gray-50 to-white dark:from-emerald-900/40 dark:via-slate-900 dark:to-slate-950 -z-10 transition-colors duration-500" />

      {/* Daily Notification Toast */}
      {notification && (
        <div className="fixed top-4 left-4 right-4 z-[60] animate-fade-in-down">
          <div className="bg-emerald-800/90 backdrop-blur border border-emerald-500/30 p-4 rounded-2xl shadow-2xl flex justify-between items-start">
            <div className="text-sm text-white leading-relaxed">{notification}</div>
            <button 
                onClick={() => setNotification(null)}
                className="text-emerald-200 hover:text-white mr-4"
            >
                ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto relative overflow-hidden flex flex-col">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <div className="max-w-md mx-auto w-full shrink-0">
         <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />
      </div>
    </div>
  );
};

export default App;
