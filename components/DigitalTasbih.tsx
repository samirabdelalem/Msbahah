import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  RotateCcw, 
  Target,
  X,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  Lock,
  Fingerprint,
  Settings,
  ArrowRight,
  Trash2,
  Edit2
} from 'lucide-react';

interface DigitalTasbihProps {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

interface TasbihItem {
  id: string;
  name: string;
  count: number;
  target: number;
  totalAllTime: number;
  completions: number;
}

const DigitalTasbih: React.FC<DigitalTasbihProps> = ({ soundEnabled, hapticsEnabled }) => {
  const [items, setItems] = useState<TasbihItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  
  const [isManaging, setIsManaging] = useState(false); 
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TasbihItem | null>(null);

  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState('');

  const [isCooldown, setIsCooldown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const COOLDOWN_MS = 1500;

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on first click to comply with browser policies
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
    const saved = localStorage.getItem('smart_tasbih_items');
    if (saved) {
      try {
        const parsedItems = JSON.parse(saved);
        setItems(parsedItems);
        if (parsedItems.length > 0) {
          setActiveItemId(prev => parsedItems.find((i: TasbihItem) => i.id === prev) ? prev : parsedItems[0].id);
        }
      } catch (e) {
        console.error("Failed to parse saved items", e);
      }
    } else {
      const defaults = [
        { id: '1', name: 'استغفار', count: 0, target: 100, totalAllTime: 0, completions: 0 },
        { id: '2', name: 'الصلاة على النبي', count: 0, target: 1000, totalAllTime: 0, completions: 0 },
        { id: '3', name: 'سبحان الله وبحمده', count: 0, target: 100, totalAllTime: 0, completions: 0 },
      ];
      setItems(defaults);
      setActiveItemId(defaults[0].id);
    }
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('smart_tasbih_items', JSON.stringify(items));
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
      const newItem: TasbihItem = {
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
    if (window.confirm("هل أنت متأكد من حذف هذا الذكر؟")) {
      const newItems = items.filter(i => i.id !== id);
      setItems(newItems);
      if (newItems.length > 0) {
        setActiveItemId(newItems[0].id);
      } else {
        setActiveItemId(null);
      }
    }
  };

  const openEditModal = (item?: TasbihItem) => {
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

  const handleIncrement = () => {
    if (!activeItem) return;
    if (isCooldown) return;

    if (hapticsEnabled && navigator.vibrate) {
        navigator.vibrate(15);
    }
    
    playSound();
    
    // Determine if target reached based on projected count
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

    // Auto advance and reset logic
    if (isTargetReached) {
      setTimeout(() => {
        // Reset current item count to 0
        setItems(prevItems => prevItems.map(i => i.id === activeItem.id ? { ...i, count: 0 } : i));
        
        // Explicitly calculate next index based on current state to ensure correct transition
        const currentIdx = items.findIndex(i => i.id === activeItem.id);
        if (currentIdx !== -1 && items.length > 0) {
           const nextIdx = (currentIdx + 1) % items.length;
           setActiveItemId(items[nextIdx].id);
        }

        setIsCooldown(false);
        setTimeLeft(0);
      }, COOLDOWN_MS);
    }
  };

  const handleReset = (e: React.MouseEvent | React.PointerEvent | any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (e && e.preventDefault) e.preventDefault();
    
    if (!activeItem) return;
    if (window.confirm("تصفير العداد الحالي؟")) {
      setItems(prev => prev.map(item => item.id === activeItem.id ? { ...item, count: 0 } : item));
      setIsCooldown(false);
      setTimeLeft(0);
    }
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
                        {editingItem ? 'تعديل الذكر' : 'إضافة ذكر جديد'}
                    </h3>
                    <button onClick={closeModal} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-slate-500 block">اسم الذكر</label>
                            <span className={`text-xs font-mono ${formName.length >= 300 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                                {formName.length}/300
                            </span>
                        </div>
                        <input 
                            type="text" 
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveItem()}
                            autoFocus
                            maxLength={300}
                            placeholder="مثلاً: استغفار"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 mb-1 block">العدد المستهدف (اختياري)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={formTarget}
                                onChange={(e) => setFormTarget(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveItem()}
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
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">إدارة الأذكار</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
            <button 
                onClick={() => openEditModal()}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 font-bold mb-4"
            >
                <Plus size={20} /> إضافة ذكر جديد
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
              <LayoutGrid size={20} /> مسبحتي
           </h2>
           <button 
              onClick={() => setIsManaging(true)}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent dark:border-white/5"
           >
              <Settings size={20} />
           </button>
      </div>

      {/* Main Content Area - Split Layout using Flexbox */}
      {/* Top Part: Flexible Card Area - FIXED CONTAINER */}
      <div className="flex-1 w-full relative overflow-hidden flex items-center justify-center">
         <div className="px-4 w-full h-full flex flex-col justify-center relative">
            
            {/* Navigation Arrows (Absolute centered) */}
            <button 
                onClick={handlePrev}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-20 flex items-center justify-center text-slate-400 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-90 transition-all outline-none"
            >
                <ChevronRight size={36} />
            </button>

            <button 
                onClick={handleNext}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-20 flex items-center justify-center text-slate-400 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-90 transition-all outline-none"
            >
                <ChevronLeft size={36} />
            </button>

            {/* Card */}
            <div className="px-[10px] w-full relative z-10">
                <div 
                    className="w-full min-h-[250px] max-h-[50vh] rounded-[2rem] bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-emerald-500/30 shadow-xl dark:shadow-2xl relative overflow-hidden flex flex-col justify-center items-center text-center p-6 touch-pan-y transition-colors duration-300"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <div className="w-full px-2 z-10 max-h-[35vh] overflow-y-auto no-scrollbar flex flex-col items-center justify-center">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed font-cairo text-center break-words whitespace-pre-wrap transition-colors">
                            {activeItem ? activeItem.name : 'قائمة الأذكار فارغة'}
                        </h3>
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* Bottom Part: Fixed Button Area */}
      {/* Fixed height container at the bottom to hold the button securely */}
      <div className="shrink-0 h-[350px] relative w-full pointer-events-none">
          {/* Button positioned absolutely within this bottom container */}
          {/* Raised to 110px as requested */}
          <div className="absolute bottom-[110px] left-0 right-0 flex justify-center z-20 pointer-events-auto">
             <div className="relative">
                
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
                                <Fingerprint size={50} className="text-emerald-100 dark:text-emerald-300 opacity-80" strokeWidth={1.5} />
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
          
           {/* Reset Button MOVED UP to clear navbar overlap */}
           <button 
                onClick={handleReset}
                onMouseDown={(e) => { e.stopPropagation(); }}
                className="absolute bottom-[110px] left-6 z-[100] p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 shadow-lg border border-slate-200 dark:border-white/10 transition-all active:scale-90 cursor-pointer touch-manipulation pointer-events-auto"
                aria-label="تصفير العداد"
            >
                <RotateCcw size={24} />
            </button>
      </div>
      
      {showEditModal && renderEditModal()}
    </div>
  );
};

export default DigitalTasbih;