
import React, { useEffect, useState, useRef } from 'react';
import { 
  Share2, Fingerprint, Lock, Menu, X, Settings, Info, Volume2, VolumeX, 
  Smartphone, ZapOff, Moon, Sun, Monitor, Target, RotateCcw,
  Footprints, Sparkles, Star, Heart, Zap, Medal, Trophy, Crown, BarChart2, Clock
} from 'lucide-react';
import { ThemeMode } from '../types';
import StatisticsView from './StatisticsView';

interface GlobalDashboardProps {
  personalTotal: number;
  onIncrement: (amount: number) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
}

const COOLDOWN_MS = 800; 

type ChallengePeriod = 'daily' | 'monthly' | 'yearly' | 'open';

interface ChallengeSettings {
  activePeriod: ChallengePeriod;
  targets: Record<ChallengePeriod, number>;
}

const DEFAULT_SETTINGS: ChallengeSettings = {
  activePeriod: 'daily',
  targets: {
    daily: 100,
    monthly: 3000,
    yearly: 36500,
    open: 1000000
  }
};

// Define Ranks
const RANKS = [
  { threshold: 0, label: 'بداية الطريق', icon: Footprints, color: 'text-slate-400' },
  { threshold: 100, label: 'مبادر بالخير', icon: Sparkles, color: 'text-emerald-400' },
  { threshold: 500, label: 'مداوم على الذكر', icon: Star, color: 'text-yellow-400' },
  { threshold: 1000, label: 'محب للصلاة', icon: Heart, color: 'text-rose-400' },
  { threshold: 5000, label: 'سابق بالخيرات', icon: Zap, color: 'text-amber-400' },
  { threshold: 10000, label: 'قلب متعلق', icon: Medal, color: 'text-cyan-400' },
  { threshold: 50000, label: 'ذاكر كثير', icon: Trophy, color: 'text-indigo-400' },
  { threshold: 100000, label: 'من المقربين', icon: Crown, color: 'text-purple-500' },
];

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
  
  // Challenge State (New Structure)
  const [settings, setSettings] = useState<ChallengeSettings>(() => {
    try {
        const saved = localStorage.getItem('challenge_settings_v2');
        if (saved) return JSON.parse(saved);

        // Attempt migration from v1 if v2 doesn't exist
        const oldConfig = localStorage.getItem('challenge_config');
        if (oldConfig) {
            const parsedOld = JSON.parse(oldConfig);
            return {
                ...DEFAULT_SETTINGS,
                activePeriod: parsedOld.period || 'daily',
                targets: {
                    ...DEFAULT_SETTINGS.targets,
                    [parsedOld.period || 'daily']: parsedOld.target || 100
                }
            };
        }
    } catch (e) {
        console.error("Error loading settings", e);
    }
    return DEFAULT_SETTINGS;
  });

  // Period Count State
  const [periodCount, setPeriodCount] = useState<number>(0);

  // Countdown State
  const [timeLeftString, setTimeLeftString] = useState<string>('');

  // Cooldown State
  const [isCooldown, setIsCooldown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);

  // UI States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // Edit Form State
  const [editingTarget, setEditingTarget] = useState<string>('');
  const [editingPeriod, setEditingPeriod] = useState<ChallengePeriod>('daily');

  useEffect(() => {
    localStorage.setItem('challenge_settings_v2', JSON.stringify(settings));
  }, [settings]);

  // Calculate Period Count based on stats history
  useEffect(() => {
    const calculatePeriodCount = () => {
      if (settings.activePeriod === 'open') {
        setPeriodCount(personalTotal);
        return;
      }

      const statsStr = localStorage.getItem('stats_history_v2');
      if (!statsStr) {
        setPeriodCount(0);
        return;
      }

      const stats = JSON.parse(statsStr);
      const now = new Date();
      
      // Local time strings for comparison (matches how logStatistic works)
      const todayKey = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const currentMonthPrefix = todayKey.substring(0, 7); // YYYY-MM
      const currentYearPrefix = todayKey.substring(0, 4); // YYYY

      let count = 0;

      if (settings.activePeriod === 'daily') {
        count = stats[todayKey]?.total || 0;
      } else if (settings.activePeriod === 'monthly') {
        Object.keys(stats).forEach(date => {
          if (date.startsWith(currentMonthPrefix)) {
            count += stats[date].total || 0;
          }
        });
      } else if (settings.activePeriod === 'yearly') {
        Object.keys(stats).forEach(date => {
          if (date.startsWith(currentYearPrefix)) {
            count += stats[date].total || 0;
          }
        });
      }

      setPeriodCount(count);
    };

    calculatePeriodCount();
  }, [personalTotal, settings.activePeriod]);

  // Countdown Logic
  useEffect(() => {
    const updateCountdown = () => {
        if (settings.activePeriod === 'open') {
            setTimeLeftString('');
            return;
        }

        const now = new Date();
        let end: Date | null = null;

        if (settings.activePeriod === 'daily') {
            // End of today: 23:59:59
            end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        } else if (settings.activePeriod === 'monthly') {
            // End of current month: Day 0 of next month gives last day of current month
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (settings.activePeriod === 'yearly') {
            // End of current year: Dec 31
            end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        }

        if (end) {
            const diff = end.getTime() - now.getTime();
            
            if (diff <= 0) {
                setTimeLeftString('انتهى الوقت');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (settings.activePeriod === 'daily') {
                setTimeLeftString(`باقي ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            } else {
                // For monthly/yearly, show days unless less than 1 day remains
                if (days > 0) {
                    setTimeLeftString(`باقي ${days} يوم`);
                } else {
                    setTimeLeftString(`باقي ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                }
            }
        }
    };

    updateCountdown(); // Initial call
    const timer = setInterval(updateCountdown, 1000); // Update every second

    return () => clearInterval(timer);
  }, [settings.activePeriod]);


  useEffect(() => {
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

  const logStatistic = () => {
      const now = new Date();
      const dateKey = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const hour = now.getHours();
      
      let segment = 'night';
      if (hour >= 5 && hour < 11) segment = 'morning';
      else if (hour >= 11 && hour < 16) segment = 'noon';
      else if (hour >= 16 && hour < 21) segment = 'evening';

      const statsStr = localStorage.getItem('stats_history_v2');
      let stats = statsStr ? JSON.parse(statsStr) : {};

      if (!stats[dateKey]) {
          stats[dateKey] = { total: 0, segments: { morning: 0, noon: 0, evening: 0, night: 0 } };
      }

      stats[dateKey].total += 1;
      if (!stats[dateKey].segments) stats[dateKey].segments = { morning: 0, noon: 0, evening: 0, night: 0 };
      stats[dateKey].segments[segment] = (stats[dateKey].segments[segment] || 0) + 1;

      localStorage.setItem('stats_history_v2', JSON.stringify(stats));
  };

  const handleClick = () => {
    if (isCooldown) return;

    if (hapticsEnabled && navigator.vibrate) {
        navigator.vibrate(15);
    }
    
    playSound();
    onIncrement(1);
    logStatistic();
    
    setIsCooldown(true);
    setTimeLeft(COOLDOWN_MS);
  };

  const handleGlobalReset = () => {
      if(window.confirm('هل أنت متأكد من تصفير العداد الكلي؟ هذا سيؤثر على رتبتك.')) {
          onIncrement(-personalTotal); 
          setShowConfigModal(false);
      }
  };

  const openConfig = () => {
      setEditingPeriod(settings.activePeriod);
      setEditingTarget(settings.targets[settings.activePeriod].toString());
      setShowConfigModal(true);
  };

  const handlePeriodChangeInModal = (p: ChallengePeriod) => {
      setEditingPeriod(p);
      setEditingTarget(settings.targets[p].toString());
  };

  const saveConfig = () => {
      const targetVal = parseInt(editingTarget);
      if (!targetVal || targetVal <= 0) return;

      setSettings(prev => ({
          ...prev,
          activePeriod: editingPeriod,
          targets: {
              ...prev.targets,
              [editingPeriod]: targetVal
          }
      }));
      setShowConfigModal(false);
  };

  const getPeriodLabel = (p: ChallengePeriod) => {
      switch(p) {
          case 'daily': return 'تحدي اليوم';
          case 'monthly': return 'تحدي الشهر';
          case 'yearly': return 'تحدي السنة';
          case 'open': return 'تحدي مفتوح';
      }
  };

  // Rank Logic
  const currentRankIndex = RANKS.findIndex((r, i) => {
    const next = RANKS[i+1];
    return personalTotal >= r.threshold && (!next || personalTotal < next.threshold);
  });
  const currentRank = RANKS[currentRankIndex !== -1 ? currentRankIndex : 0];
  const nextRank = RANKS[currentRankIndex + 1];

  // Progress Calculation
  const currentTarget = settings.targets[settings.activePeriod];
  const progressPercentage = Math.min(100, (periodCount / currentTarget) * 100);
  
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const cooldownProgress = (timeLeft / COOLDOWN_MS) * 100;
  const strokeDashoffset = circumference - ((100 - cooldownProgress) / 100) * circumference;

  const RankIcon = currentRank.icon;

  if (showStats) {
      return (
        <StatisticsView 
          onClose={() => setShowStats(false)} 
          storageKey="stats_history_v2"
          title="إحصائيات الصلاة على النبي"
        />
      );
  }

  return (
    <div className="flex flex-col h-full pb-24 overflow-y-auto no-scrollbar relative transition-colors duration-300">
      
      {/* Header Section */}
      <div className="relative pt-6 px-4 mb-2 flex items-center justify-between">
        <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors z-20"
        >
            <Menu size={28} />
        </button>

        <div className="flex items-center gap-2 z-20">
             <button 
                onClick={() => setShowStats(true)}
                className="p-2 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-500/20 transition-colors"
            >
                <BarChart2 size={24} />
            </button>
            <button 
                onClick={openConfig}
                className="p-2 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-500/20 transition-colors"
            >
                <Settings size={24} />
            </button>
        </div>
      </div>

      <div className="text-center mb-2">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
             الرئيسية
        </p>
      </div>

      {/* Challenge Card - Completely Refined to contain elements */}
      <div className="mx-4 mb-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-emerald-500/20 shadow-xl dark:shadow-lg dark:backdrop-blur-sm relative overflow-hidden transition-colors duration-300">
        
        <div className="px-5 py-5 relative z-10">
             
             {/* Header Row: Rank - Total - Challenge Label (Aligned Top) */}
             <div className="relative flex justify-between items-start mb-5 h-[50px]">
                 
                 {/* Left: Rank Badge */}
                 <div className="z-20">
                     <div className="flex items-center gap-1.5 bg-slate-50/90 dark:bg-slate-700/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-100 dark:border-white/5 shadow-sm">
                         <RankIcon size={12} className={currentRank.color} />
                         <span className={`text-[10px] font-bold ${currentRank.color}`}>
                            {currentRank.label}
                         </span>
                     </div>
                 </div>

                 {/* Center: Total Count (Lifted Up to match badges) */}
                 <div className="absolute inset-x-0 top-[-2px] flex flex-col items-center z-10">
                    <span className="text-3xl sm:text-4xl font-mono font-bold text-slate-800 dark:text-white tracking-tighter tabular-nums drop-shadow-sm leading-none">
                        {personalTotal.toLocaleString('en-US')}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold mt-1">
                        مجموع صلواتك
                    </span>
                 </div>

                 {/* Right: Challenge Label & Count */}
                 <div className="z-20 flex flex-col items-end">
                     <div className="flex items-center gap-1.5 bg-slate-50/90 dark:bg-slate-700/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-100 dark:border-white/5 shadow-sm mb-1">
                         <Target size={12} className="text-emerald-500" />
                         <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            {getPeriodLabel(settings.activePeriod)}
                         </span>
                     </div>
                     <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 px-1">
                        {periodCount.toLocaleString('en-US')} <span className="text-slate-400">/ {currentTarget.toLocaleString('en-US')}</span>
                     </span>
                     
                     {/* Countdown Timer Display */}
                     {timeLeftString && (
                        <div className="flex items-center gap-1 mt-0.5 px-1 animate-in fade-in">
                            <Clock size={8} className="text-amber-500" />
                            <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                                {timeLeftString}
                            </span>
                        </div>
                     )}
                 </div>
             </div>

             {/* Bottom: Progress Bar */}
             <div className="w-full">
                 <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden shadow-inner mb-1.5">
                     <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.4)]" style={{ width: `${progressPercentage}%` }}></div>
                 </div>
                 
                 <div className="flex justify-between items-center px-1">
                     <span className="text-[9px] text-slate-400 font-mono">
                        {Math.round(progressPercentage)}%
                     </span>
                     {nextRank ? (
                        <span className="text-[9px] text-amber-600 dark:text-amber-400/80 font-medium flex items-center gap-1">
                             <Crown size={10} />
                             باقي {Math.max(0, nextRank.threshold - personalTotal).toLocaleString('en-US')} لـ {nextRank.label}
                        </span>
                     ) : (
                        <span className="text-[9px] text-purple-500 font-bold">وصلت القمة!</span>
                     )}
                 </div>
             </div>
        </div>
      </div>

      {/* Main Action Button */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] relative">
         <div className="relative">
            {!isCooldown && (
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
            )}

            <button
                onClick={handleClick}
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
                            <span className="text-[10px] text-emerald-100/80">اضغط لزيادة العداد</span>
                        </>
                    )}
                </div>
            </button>
         </div>
      </div>

      <div className="px-8 mt-auto">
        <button className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-emerald-500/10 shadow-lg dark:shadow-none active:scale-95">
            <Share2 size={18} />
            <span className="text-sm">انشر التطبيق واكسب الأجر</span>
        </button>
      </div>

      {/* Config Modal */}
      {showConfigModal && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfigModal(false)} />
              <div className="relative bg-white dark:bg-slate-900 w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 shadow-2xl border-t sm:border border-slate-200 dark:border-white/10">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <Target className="text-emerald-500" /> تخصيص التحدي
                      </h3>
                      <button onClick={() => setShowConfigModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="space-y-6">
                      <div>
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block">اختر الفترة لتعديل هدفها</label>
                          <div className="grid grid-cols-4 gap-2">
                              {(['daily', 'monthly', 'yearly', 'open'] as ChallengePeriod[]).map((p) => (
                                  <button
                                    key={p}
                                    onClick={() => handlePeriodChangeInModal(p)}
                                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                                        editingPeriod === p 
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                  >
                                      {getPeriodLabel(p).replace('تحدي ', '')}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div>
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                             الهدف الخاص بـ {getPeriodLabel(editingPeriod)}
                          </label>
                          <input 
                            type="number"
                            value={editingTarget}
                            onChange={(e) => setEditingTarget(e.target.value)}
                            placeholder="مثلاً: 100"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:border-emerald-500 outline-none font-mono text-lg"
                          />
                      </div>

                      <div className="pt-2 flex gap-3">
                           <button 
                            onClick={handleGlobalReset}
                            className="flex-1 py-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl font-bold hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2"
                          >
                              <RotateCcw size={18} /> تصفير الكلي
                          </button>
                          <button 
                            onClick={saveConfig}
                            className="flex-[2] py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-colors"
                          >
                              حفظ واختيار
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

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
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-slate-600 dark:text-slate-300 text-sm leading-relaxed border border-slate-100 dark:border-transparent">
                            تطبيق يساعدك على الالتزام بورد يومي من الصلاة على النبي (صلى الله عليه وسلم) ومتابعة إنجازك الشخصي.
                        </div>
                    </div>
                </div>

                <div className="text-center text-slate-500 text-xs mt-auto">
                    الإصدار 1.0.3
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default GlobalDashboard;