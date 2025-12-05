
import React, { useEffect, useState, useRef } from 'react';
import { Users, Globe, Share2, Fingerprint, Lock, Menu, X, Settings, Info, Volume2, VolumeX, Smartphone, ZapOff, Moon, Sun, Monitor } from 'lucide-react';
import { ThemeMode } from '../types';

interface GlobalDashboardProps {
  personalTotal: number;
  onIncrement: (amount: number) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  // New props for global settings
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
}

const COOLDOWN_MS = 2000; // 2 Seconds cooldown

const GlobalDashboard: React.FC<GlobalDashboardProps> = ({ 
  personalTotal, 
  onIncrement, 
  themeMode, 
  setThemeMode,
  soundEnabled,
  setSoundEnabled,
  hapticsEnabled,
  setHapticsEnabled
}) => {
  const activeUsers = 1; 
  
  // Cooldown State
  const [isCooldown, setIsCooldown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Audio Context for reliable beep
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Menu States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  useEffect(() => {
    // Initialize AudioContext on first user interaction if possible
    const initAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    };
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  const playSound = () => {
      if (!soundEnabled) return;
      
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
      }

      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtxRef.current.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtxRef.current.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.1);
  };

  useEffect(() => {
    let interval: number;
    if (isCooldown && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 50));
      }, 50);
    } else if (timeLeft <= 0) {
      setIsCooldown(false);
    }
    return () => clearInterval(interval);
  }, [isCooldown, timeLeft]);

  const handleCampaignClick = () => {
    if (isCooldown) return;

    if (hapticsEnabled && navigator.vibrate) {
        navigator.vibrate(15);
    }
    
    playSound();

    onIncrement(1);
    
    setIsCooldown(true);
    setTimeLeft(COOLDOWN_MS);
  };

  const progressPercentage = (personalTotal / 1000000000) * 100;
  
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const cooldownProgress = (timeLeft / COOLDOWN_MS) * 100;
  const strokeDashoffset = circumference - ((100 - cooldownProgress) / 100) * circumference;

  return (
    <div className="flex flex-col h-full pb-24 overflow-y-auto no-scrollbar relative transition-colors duration-300">
      
      {/* Header Section */}
      <div className="relative pt-6 px-4 mb-2 text-center">
        <button 
            onClick={() => setIsMenuOpen(true)}
            className="absolute top-6 right-4 p-2 text-slate-600 dark:text-emerald-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors z-20"
        >
            <Menu size={28} />
        </button>

        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-200">
          حملة المليار صلاة
        </h1>
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 dark:text-emerald-400/80 mt-1 font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          حملة حقيقية - بدون أرقام وهمية
        </div>
      </div>

      {/* Stats Card */}
      <div className="mx-4 mb-4 p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-emerald-500/20 shadow-xl dark:shadow-lg dark:backdrop-blur-sm relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
           <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${Math.max(progressPercentage, 0.5)}%` }}></div>
        </div>
        
        <div className="flex flex-col items-center">
             <div className="text-4xl font-mono font-bold text-slate-800 dark:text-white tracking-widest tabular-nums drop-shadow-sm dark:drop-shadow-lg transition-colors">
                {personalTotal.toLocaleString('en-US')}
             </div>
             <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-bold">إجمالي الصلوات المسجلة</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
             <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Users size={14} />
                    <span className="text-lg font-bold tabular-nums">{activeUsers}</span>
                </div>
                <span className="text-[10px] text-slate-500">المساهمون (أنت)</span>
             </div>
             <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Globe size={14} />
                    <span className="text-lg font-bold tabular-nums">{progressPercentage.toFixed(8)}%</span>
                </div>
                <span className="text-[10px] text-slate-500">اكتمال الحمله</span>
             </div>
        </div>
      </div>

      {/* Main Action Button */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] relative">
         <div className="relative mb-6">
            {!isCooldown && (
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
            )}

            <button
                onClick={handleCampaignClick}
                disabled={isCooldown}
                className={`
                    relative w-64 h-64 rounded-full flex flex-col items-center justify-center
                    transition-all duration-300 touch-manipulation
                    ${isCooldown 
                        ? 'bg-slate-200 dark:bg-slate-800 cursor-not-allowed scale-95' 
                        : 'bg-gradient-to-b from-emerald-600 to-emerald-800 dark:from-emerald-800 dark:to-emerald-950 active:scale-95 shadow-xl shadow-emerald-600/30 dark:shadow-[0_0_40px_rgba(16,185,129,0.3)]'
                    }
                    border-4 border-white dark:border-slate-900 ring-1 ring-black/5 dark:ring-white/10
                `}
            >
                <svg className="absolute top-0 left-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r={radius} stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-100 dark:text-slate-900 transition-colors" />
                    {isCooldown && (
                        <circle 
                            cx="100" cy="100" r={radius} 
                            stroke="#fbbf24" 
                            strokeWidth="8" 
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-75 ease-linear"
                        />
                    )}
                </svg>

                <div className="z-10 flex flex-col items-center gap-2">
                    {isCooldown ? (
                        <>
                            <Lock size={40} className="text-slate-400 dark:text-slate-500" />
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-500 animate-pulse">
                                انتظر {Math.ceil(timeLeft / 1000)} ث...
                            </span>
                        </>
                    ) : (
                        <>
                            <Fingerprint size={60} className="text-emerald-100 dark:text-emerald-300" strokeWidth={1.5} />
                            <span className="text-lg font-bold text-white mt-2">صلى على النبي</span>
                            <span className="text-[10px] text-emerald-100/80">اضغط للمشاركة</span>
                        </>
                    )}
                </div>
            </button>
         </div>

         <div className="text-center space-y-1 z-10">
            <p className="text-slate-500 dark:text-slate-400 text-xs">مساهمتك الفعلية</p>
            <p className="text-3xl font-bold text-emerald-700 dark:text-white tabular-nums">{personalTotal.toLocaleString()}</p>
         </div>
      </div>

      <div className="px-8 mt-auto">
        <button className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-emerald-500/10 shadow-lg dark:shadow-none">
            <Share2 size={18} />
            <span className="text-sm">انشر الحملة لزيادة العداد</span>
        </button>
      </div>

      {/* Sidebar Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div 
                className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setIsMenuOpen(false)}
            />
            <div className="relative w-[80%] max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-100 dark:border-white/10 p-6 animate-in slide-in-from-right duration-300 flex flex-col transition-colors">
                <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="self-end p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-white/5 rounded-full mb-8"
                >
                    <X size={24} />
                </button>

                <div className="space-y-8 flex-1">
                    <div>
                        <h3 className="text-emerald-600 dark:text-emerald-400 font-bold mb-4 flex items-center gap-2">
                            <Settings size={20} /> الإعدادات
                        </h3>
                        <div className="space-y-3">
                            {/* Sound Toggle */}
                            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-transparent">
                                <div className="flex items-center gap-3 text-slate-700 dark:text-white">
                                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                    <span>الأصوات</span>
                                </div>
                                <button 
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${soundEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                >
                                    {/* Left-1 = OFF position (Left), Left-7 = ON position (Right) */}
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${soundEnabled ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            {/* Haptics Toggle */}
                            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-transparent">
                                <div className="flex items-center gap-3 text-slate-700 dark:text-white">
                                    {hapticsEnabled ? <Smartphone size={20} /> : <ZapOff size={20} />}
                                    <span>الاهتزاز</span>
                                </div>
                                <button 
                                    onClick={() => setHapticsEnabled(!hapticsEnabled)}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${hapticsEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${hapticsEnabled ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-transparent">
                                <div className="flex items-center gap-3 text-slate-700 dark:text-white mb-3">
                                    <Moon size={20} />
                                    <span>المظهر</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <button 
                                        onClick={() => setThemeMode(ThemeMode.LIGHT)}
                                        className={`flex flex-col items-center justify-center py-2 rounded-xl text-xs font-bold transition-all ${themeMode === ThemeMode.LIGHT ? 'bg-white shadow-md text-emerald-600 ring-2 ring-emerald-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                                    >
                                        <Sun size={18} className="mb-1" /> فاتح
                                    </button>
                                    <button 
                                        onClick={() => setThemeMode(ThemeMode.DARK)}
                                        className={`flex flex-col items-center justify-center py-2 rounded-xl text-xs font-bold transition-all ${themeMode === ThemeMode.DARK ? 'bg-slate-700 shadow-md text-emerald-400 ring-2 ring-emerald-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                                    >
                                        <Moon size={18} className="mb-1" /> داكن
                                    </button>
                                    <button 
                                        onClick={() => setThemeMode(ThemeMode.SYSTEM)}
                                        className={`flex flex-col items-center justify-center py-2 rounded-xl text-xs font-bold transition-all ${themeMode === ThemeMode.SYSTEM ? 'bg-white dark:bg-slate-700 shadow-md text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                                    >
                                        <Monitor size={18} className="mb-1" /> النظام
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                         <h3 className="text-emerald-600 dark:text-emerald-400 font-bold mb-4 flex items-center gap-2">
                            <Info size={20} /> عن التطبيق
                        </h3>
                        <button 
                            onClick={() => setShowAboutModal(true)}
                            className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-right text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex justify-between items-center border border-slate-100 dark:border-transparent"
                        >
                            <span>ما هي حملة المليار صلاة؟</span>
                            <Share2 size={16} className="text-slate-500" />
                        </button>
                    </div>
                </div>

                <div className="text-center text-slate-500 text-xs mt-auto">
                    الإصدار 1.0.0
                </div>
            </div>
        </div>
      )}

      {showAboutModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 dark:bg-black/60 backdrop-blur-md" onClick={() => setShowAboutModal(false)} />
              <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200 shadow-2xl">
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 text-center">عن الحملة</h3>
                  <div className="space-y-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed text-center">
                      <p>
                          تطبيق <strong>"المليار صلاة"</strong> هو مبادرة عالمية تهدف لجمع قلوب المسلمين.
                      </p>
                      <p>
                           يتميز التطبيق بالشفافية والبعد عن الأرقام الوهمية.
                      </p>
                  </div>
                  <button 
                    onClick={() => setShowAboutModal(false)}
                    className="w-full mt-6 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-500"
                  >
                      إغلاق
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default GlobalDashboard;
