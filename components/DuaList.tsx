
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  RotateCcw, 
  Target,
  X,
  Heart,
  ChevronRight,
  ChevronLeft,
  Lock,
  Hand,
  Settings,
  ArrowRight,
  Trash2,
  Edit2,
  BarChart2
} from 'lucide-react';
import StatisticsView from './StatisticsView';

interface DuaListProps {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

interface DuaItem {
  id: string;
  name: string;
  count: number;
  target: number;
  totalAllTime: number;
  completions: number;
}

const DuaList: React.FC<DuaListProps> = ({ soundEnabled, hapticsEnabled }) => {
  const [items, setItems] = useState<DuaItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  
  const [isManaging, setIsManaging] = useState(false); 
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [editingItem, setEditingItem] = useState<DuaItem | null>(null);

  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState('');

  const [isCooldown, setIsCooldown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const COOLDOWN_MS = 1500;

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // New State for Custom Reset Modal
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

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
      osc.frequency.setValueAtTime(600, audioCtxRef.current.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, audioCtxRef.current.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.1);
  };

  useEffect(() => {
    const saved = localStorage.getItem('smart_dua_items');
    if (saved) {
      try {
        const parsedItems = JSON.parse(saved);
        setItems(parsedItems);
        if (parsedItems.length > 0) {
          setActiveItemId(prev => parsedItems.find((i: DuaItem) => i.id === prev) ? prev : parsedItems[0].id);
        }
      } catch (e) {
        console.error("Failed to parse saved items", e);
      }
    } else {
      const defaults = [
        { id: '1', name: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', count: 0, target: 10, totalAllTime: 0, completions: 0 },
        { id: '2', name: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي', count: 0, target: 33, totalAllTime: 0, completions: 0 },
        { id: '3', name: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ', count: 0, target: 100, totalAllTime: 0, completions: 0 },
      ];
      setItems(defaults);
      setActiveItemId(defaults[0].id);
    }
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('smart_dua_items', JSON.stringify(items));
    }
  }, [items]);

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

  const activeIndex = items.findIndex(i => i.id === activeItemId);
  const activeItem = items[activeIndex] || items[0];

  const handleNext = () => {
    if (items.length === 0) return;
    const nextIndex = (activeIndex + 1) % items.length;
    setActiveItemId(items[nextIndex].id);
    setIsCooldown(false);
    setTimeLeft(0);
  };

  const handlePrev = () => {
    if (items.length === 0) return;
    const prevIndex = (activeIndex - 1 + items.length) % items.length;
    setActiveItemId(items[prevIndex].id);
    setIsCooldown(false);
    setTimeLeft(0);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
        handleNext();
    }
    if (isRightSwipe) {
        handlePrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleSaveItem = () => {
    if (!formName.trim()) return;

    const targetVal = parseInt(formTarget);
    const finalTarget = isNaN(targetVal) ? 0 : targetVal;

    if (editingItem) {
      setItems(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, name: formName, target: finalTarget } 
          : item
      ));
    } else {
      const newItem: DuaItem = {
        id: Date.now().toString(),
        name: formName,
        target: finalTarget,
        count: 0,
        totalAllTime: 0,
        completions: 0,
      };
      setItems(prev => [...prev, newItem]);
      setActiveItemId(newItem.id); 
    }
    closeModal();
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الدعاء؟")) {
      const newItems = items.filter(i => i.id !== id);
      setItems(newItems);
      if (newItems.length > 0) {
        setActiveItemId(newItems[0].id);
      } else {
        setActiveItemId(null);
      }
    }
  };

  const openEditModal = (item?: DuaItem) => {
    if (item) {
      setEditingItem(item);
      setFormName(item.name);
      setFormTarget(item.target === 0 ? '' : item.target.toString());
    } else {
      setEditingItem(null);
      setFormName('');
      setFormTarget('');
    }
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
    setFormName('');
    setFormTarget('');
  };

  // Function to log detailed stats specific to Dua
  const logStatistic = () => {
      const now = new Date();
      const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const hour = now.getHours();
      
      let segment = 'night';
      if (hour >= 5 && hour < 11) segment = 'morning';
      else if (hour >= 11 && hour < 16) segment = 'noon';
      else if (hour >= 16 && hour < 21) segment = 'evening';

      const statsStr = localStorage.getItem('dua_stats_history');
      let stats = statsStr ? JSON.parse(statsStr) : {};

      if (!stats[dateKey]) {
          stats[dateKey] = { total: 0, segments: { morning: 0, noon: 0, evening: 0, night: 0 } };
      }

      stats[dateKey].total += 1;
      if (!stats[dateKey].segments) stats[dateKey].segments = { morning: 0, noon: 0, evening: 0, night: 0 };
      stats[dateKey].segments[segment] = (stats[dateKey].segments[segment] || 0) + 1;

      localStorage.setItem('dua_stats_history', JSON.stringify(stats));
  };

  const handleIncrement = () => {
    if (!activeItem) return;
    if (isCooldown) return;

    if (hapticsEnabled && navigator.vibrate) {
        navigator.vibrate(15);
    }
    
    playSound();
    logStatistic(); // Log Dua specific stats
    
    const nextCount = activeItem.count + 1;
    const isTargetReached = activeItem.target > 0 && nextCount >= activeItem.target;

    setItems(prev => prev.map(item => {
      if (item.id !== activeItem.id) return item;

      const newCount = item.count + 1;
      const newTotal = item.totalAllTime + 1;
      let newCompletions = item.completions;

      if (isTargetReached) {
        if (hapticsEnabled && navigator.vibrate) navigator.vibrate([50, 50, 50]);
        newCompletions += 1;
      }

      return { ...item, count: newCount, totalAllTime: newTotal, completions: newCompletions };
    }));

    setIsCooldown(true);
    setTimeLeft(COOLDOWN_MS);

    if (isTargetReached) {
      setTimeout(() => {
        setItems(prevItems => prevItems.map(i => i.id === activeItem.id ? { ...i, count: 0 } : i));
        setIsCooldown(false);
        setTimeLeft(0);
      }, COOLDOWN_MS);
    }
  };

  // Trigger Reset Logic (Opens Modal)
  const handleResetClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!activeItem) return;
    setShowResetConfirm(true);
  };

  // Perform Actual Reset
  const confirmReset = () => {
      setItems(prev => prev.map(item => item.id === activeItem?.id ? { ...item, count: 0 } : item));
      setIsCooldown(false);
      setTimeLeft(0);
      setShowResetConfirm(false);
  };

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const cooldownProgress = (timeLeft / COOLDOWN_MS) * 100;
  const strokeDashoffset = circumference - ((100 - cooldownProgress) / 100) * circumference;

  const renderEditModal = () => {
      return (
        <div className="fixed inset-0 z-[70] bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={closeModal}>
            <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 sm:rounded-3xl rounded-t-3xl border-t sm:border border-slate-200 dark:border-white/10 p-6 shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        {editingItem ? 'تعديل الدعاء' : 'إضافة دعاء جديد'}
                    </h3>
                    <button onClick={closeModal} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-slate-500 block">نص الدعاء</label>
                            <span className={`text-xs font-mono ${formName.length >= 300 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                                {formName.length}/300
                            </span>
                        </div>
                        <textarea 
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            // Remove onKeyDown enter to submit for TextArea to allow multiline if needed, or keep it
                            autoFocus
                            maxLength={300}
                            placeholder="اكتب الدعاء هنا..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors h-24 resize-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 mb-1 block">العدد المستهدف (اختياري)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={formTarget}
                                onChange={(e) => setFormTarget(e.target.value)}
                                placeholder="اتركه فارغاً للعد المفتوح"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors"
                            />
                            <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600" size={18} />
                        </div>
                    </div>
                    <button 
                        onClick={handleSaveItem}
                        className="w-full py-4 bg-emerald-600 rounded-xl text-white font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-900/20 mt-2"
                    >
                        حفظ التغييرات
                    </button>
                </div>
            </div>
        </div>
      );
  };

  const renderResetConfirmModal = () => (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 px-8">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowResetConfirm(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 mb-4">
                     <RotateCcw size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">تصفير العداد؟</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      هل أنت متأكد من تصفير عداد هذا الدعاء؟
                  </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                  <button 
                      onClick={() => setShowResetConfirm(false)}
                      className="py-3 px-4 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                      إلغاء
                  </button>
                  <button 
                      onClick={confirmReset}
                      className="py-3 px-4 rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-colors"
                  >
                      نعم، صفر
                  </button>
              </div>
          </div>
      </div>
  );

  if (showStats) {
      return (
        <StatisticsView 
          onClose={() => setShowStats(false)} 
          storageKey="dua_stats_history"
          title="إحصائيات الأدعية"
        />
      );
  }

  if (isManaging) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-white/10 flex items-center gap-3 bg-white/95 dark:bg-slate-900/95 sticky top-0 z-20">
            <button 
                onClick={() => setIsManaging(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
                <ArrowRight size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">إدارة الأدعية</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
            <button 
                onClick={() => openEditModal()}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 font-bold mb-4"
            >
                <Plus size={20} /> إضافة دعاء جديد
            </button>

            {items.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex justify-between items-center group shadow-sm">
                    <div className="flex-1 min-w-0 ml-4 text-right">
                        <h3 className="text-slate-800 dark:text-white font-bold truncate">{item.name}</h3>
                        <p className="text-xs text-slate-500">
                            الهدف: {item.target > 0 ? item.target : 'مفتوح'} | المجموع: {item.totalAllTime}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-rose-500 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
        {showEditModal && renderEditModal()}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 relative transition-colors duration-300 overflow-hidden">
      
      {/* Header */}
      <div className="px-5 pt-5 pb-2 flex justify-between items-center z-10 shrink-0 h-[60px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
           <h2 className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2 text-lg">
              <Heart size={20} /> أدعيتي
           </h2>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowStats(true)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent dark:border-white/5 z-20 active:scale-95"
                aria-label="إحصائيات"
              >
                  <BarChart2 size={20} />
              </button>
              <button 
                onClick={handleResetClick}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent dark:border-white/5 z-20 active:scale-95"
                aria-label="تصفير العداد"
              >
                  <RotateCcw size={20} />
              </button>
              <button 
                  onClick={() => setIsManaging(true)}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent dark:border-white/5"
                  aria-label="الإعدادات"
              >
                  <Settings size={20} />
              </button>
           </div>
      </div>

      {/* Main Content Area - Split Layout using Flexbox */}
      {/* Top Part: Flexible Card Area - FIXED CONTAINER */}
      <div className="flex-1 w-full px-2 relative overflow-hidden flex items-center justify-center">
         <div className="w-full h-full flex flex-col justify-center relative">
            
            {/* Card - Arrows inside with VISIBLE GREEN STRIPS */}
            <div className="w-full relative z-10 h-full max-h-[50vh] flex flex-col">
                <div 
                    className="w-full h-full rounded-[2rem] bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-emerald-500/30 shadow-xl dark:shadow-2xl relative overflow-hidden flex flex-col justify-center items-center text-center touch-pan-y transition-colors duration-300"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {/* Navigation Buttons Inside Card - Visible Colored Strips */}
                    <button 
                        onClick={handlePrev}
                        className="absolute right-0 top-0 bottom-0 w-14 flex items-center justify-center text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors outline-none z-20 border-l border-emerald-500/10 dark:border-white/5"
                    >
                        <ChevronRight size={32} />
                    </button>

                    <button 
                        onClick={handleNext}
                        className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors outline-none z-20 border-r border-emerald-500/10 dark:border-white/5"
                    >
                        <ChevronLeft size={32} />
                    </button>

                    <div className="w-full px-16 z-10 max-h-[80%] overflow-y-auto no-scrollbar flex flex-col items-center justify-center">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed font-cairo text-center break-words whitespace-pre-wrap transition-colors">
                            {activeItem ? activeItem.name : 'قائمة الأدعية فارغة'}
                        </h3>
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* Bottom Part: Fixed Button Area */}
      <div className="shrink-0 h-[350px] relative w-full pointer-events-none">
          {/* Button positioned absolutely within this bottom container */}
          <div className="absolute bottom-[110px] left-0 right-0 flex justify-center z-20 pointer-events-none">
             <div className="relative pointer-events-auto">
                <button 
                    onClick={handleIncrement}
                    disabled={isCooldown}
                    className={`
                        relative w-64 h-64 rounded-full flex flex-col items-center justify-center
                        transition-all duration-300 touch-manipulation z-20
                        ${isCooldown 
                            ? 'bg-slate-200 dark:bg-slate-800 cursor-not-allowed scale-95' 
                            : 'bg-gradient-to-b from-emerald-600 to-emerald-800 dark:from-emerald-800 dark:to-emerald-950 active:scale-95 shadow-xl shadow-emerald-500/30 dark:shadow-[0_0_40px_rgba(16,185,129,0.3)]'
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
                                <Hand size={50} className="text-emerald-100 dark:text-emerald-300 opacity-80" strokeWidth={1.5} />
                                <span className="text-6xl font-bold text-white tabular-nums tracking-tighter drop-shadow-lg">
                                    {activeItem ? activeItem.count : 0}
                                </span>
                                {activeItem && activeItem.target > 0 && (
                                    <span className="text-xs text-emerald-100/70 dark:text-slate-500 mt-2 font-medium">
                                        الهدف: {activeItem.target}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </button>
            </div>
          </div>
      </div>
      
      {showEditModal && renderEditModal()}
      {showResetConfirm && renderResetConfirmModal()}
    </div>
  );
};

export default DuaList;
