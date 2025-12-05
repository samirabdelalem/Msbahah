import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  ChevronLeft,
  ArrowRight, 
  Sun, 
  Moon, 
  BedDouble, 
  Home,
  BookOpen,
  Search,
  Shirt,
  Droplets,
  Volume2,
  Minimize2,
  Fingerprint,
  Lock,
  RotateCcw,
  Heart,
  CloudRain,
  Plane,
  AlertCircle,
  Utensils,
  MapPin,
  Smile,
  Sunset
} from 'lucide-react';

interface HisnMuslimProps {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

type CategoryId = string;

interface DhikrItem {
  id: string;
  text: string;
  target: number; 
  virtue?: string;
  count?: number; // Local state for counter
}

interface AdhkarCategory {
  id: CategoryId;
  title: string;
  icon: React.ElementType;
  color: string;
  items: DhikrItem[];
}

const ADHKAR_DATA: AdhkarCategory[] = [
  {
    id: 'waking',
    title: 'أذكار الاستيقاظ',
    icon: Sun,
    color: 'text-amber-500',
    items: [
      { id: 'w1', text: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ.', target: 1 },
      { id: 'w2', text: 'لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَلِيِّ الْعَظِيمِ.', target: 1, virtue: 'من قالها غُفِرَ له' },
    ]
  },
  {
    id: 'morning',
    title: 'أذكار الصباح',
    icon: Sun,
    color: 'text-sky-500',
    items: [
      { id: 'm0', text: 'أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ (اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ...) [آية الكرسي]', target: 1, virtue: 'من قالها حين يصبح أجير من الجن حتى يمسي' },
      { id: 'm_ikhlas', text: 'سورة الإخلاص', target: 3 },
      { id: 'm_falaq', text: 'سورة الفلق', target: 3 },
      { id: 'm_nas', text: 'سورة الناس', target: 3 },
      { id: 'm1', text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ...', target: 1 },
      { id: 'm2', text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ.', target: 1 },
      { id: 'm3', text: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ.', target: 1, virtue: 'سيد الاستغفار' },
    ]
  },
  {
    id: 'evening',
    title: 'أذكار المساء',
    icon: Moon,
    color: 'text-indigo-600',
    items: [
      { id: 'e0', text: 'أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ (اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ...) [آية الكرسي]', target: 1 },
      { id: 'e_ikhlas', text: 'سورة الإخلاص', target: 3 },
      { id: 'e_falaq', text: 'سورة الفلق', target: 3 },
      { id: 'e_nas', text: 'سورة الناس', target: 3 },
      { id: 'e1', text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ...', target: 1 },
    ]
  },
  {
    id: 'sleep',
    title: 'أذكار النوم',
    icon: BedDouble,
    color: 'text-slate-500',
    items: [
      { id: 's1', text: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.', target: 1 },
      { id: 's4', text: 'سُبْحَانَ اللَّهِ (33)، الْحَمْدُ لِلَّهِ (33)، اللَّهُ أَكْبَرُ (34)', target: 100 },
    ]
  },
  {
    id: 'food',
    title: 'الطعام والشراب',
    icon: Utensils,
    color: 'text-orange-600',
    items: [
      { id: 'f1', text: 'بِسْمِ اللَّهِ.', target: 1, virtue: 'قبل الأكل' },
      { id: 'f2', text: 'اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَأَطْعِمْنَا خَيْراً مِنْهُ.', target: 1 },
      { id: 'f3', text: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ.', target: 1, virtue: 'بعد الفراغ من الطعام' },
    ]
  },
  {
    id: 'clothes',
    title: 'لبس الثوب',
    icon: Shirt,
    color: 'text-cyan-500',
    items: [
      { id: 'c1', text: 'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا (الثَّوْبَ) وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ.', target: 1, virtue: 'غُفر له ما تقدم من ذنبه' },
    ]
  },
  {
    id: 'toilet',
    title: 'الخلاء',
    icon: Minimize2,
    color: 'text-gray-500',
    items: [
      { id: 't1', text: '(بِسْمِ اللَّهِ) اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ.', target: 1, virtue: 'عند الدخول' },
      { id: 't2', text: 'غُفْرَانَكَ.', target: 1, virtue: 'عند الخروج' },
    ]
  },
  {
    id: 'wudu',
    title: 'الوضوء',
    icon: Droplets,
    color: 'text-blue-500',
    items: [
      { id: 'wd1', text: 'بِسْمِ اللَّهِ.', target: 1 },
      { id: 'wd3', text: 'اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ.', target: 1 },
    ]
  },
  {
    id: 'home',
    title: 'المنزل',
    icon: Home,
    color: 'text-green-600',
    items: [
      { id: 'h1', text: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا.', target: 1 },
      { id: 'h2', text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.', target: 1 },
    ]
  },
  {
    id: 'mosque',
    title: 'المسجد',
    icon: Home, 
    color: 'text-emerald-600',
    items: [
      { id: 'mq1', text: 'اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُوراً، وَفِي لِسَانِي نُوراً، وَاجْعَلْ فِي سَمْعِي نُوراً، وَاجْعَلْ فِي بَصَرِي نُوراً...', target: 1, virtue: 'الذهاب للمسجد' },
      { id: 'mq2', text: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ.', target: 1, virtue: 'دخول المسجد' },
    ]
  },
  {
    id: 'adhan',
    title: 'الأذان',
    icon: Volume2,
    color: 'text-purple-600',
    items: [
      { id: 'ad1', text: 'يقول مثل ما يقول المؤذن إلا في "حي على الصلاة وحي على الفلاح" يقول "لا حول ولا قوة إلا بالله".', target: 1 },
      { id: 'ad3', text: 'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلاَةِ الْقَائِمَةِ، آتِ مُحَمَّداً الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَاماً مَحْمُوداً الَّذِي وَعَدْتَهُ، إِنَّكَ لاَ تُخْلِفُ الْمِيعَادَ.', target: 1 },
    ]
  },
  {
    id: 'prayer',
    title: 'الصلاة (الاستفتاح)',
    icon: BookOpen,
    color: 'text-emerald-500',
    items: [
      { id: 'ps1', text: 'اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ، اللَّهُمَّ نَقِّنِي مِنْ خَطَايَايَ كَمَا يُنَقَّى الثَّوْبُ الأَبْيَضُ مِنَ الدَّنَسِ.', target: 1 },
      { id: 'ps2', text: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلاَ إِلَهَ غَيْرُكَ.', target: 1 },
    ]
  },
  {
    id: 'prayer_movements',
    title: 'أذكار الصلاة',
    icon: Minimize2,
    color: 'text-green-700',
    items: [
      { id: 'pm1', text: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ.', target: 3, virtue: 'الركوع' },
      { id: 'pm2', text: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ.', target: 1, virtue: 'الرفع من الركوع' },
      { id: 'pm3', text: 'سُبْحَانَ رَبِّيَ الأَعْلَى.', target: 3, virtue: 'السجود' },
      { id: 'pm4', text: 'رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي.', target: 1, virtue: 'بين السجدتين' },
    ]
  },
  {
    id: 'after_prayer',
    title: 'بعد الصلاة',
    icon: Fingerprint,
    color: 'text-teal-600',
    items: [
      { id: 'ap1', text: 'أَسْتَغْفِرُ اللَّهَ (ثَلاَثاً) اللَّهُمَّ أَنْتَ السَّلاَمُ، وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ.', target: 1 },
      { id: 'ap2', text: 'سُبْحَانَ اللَّهِ (33)، الْحَمْدُ لِلَّهِ (33)، اللَّهُ أَكْبَرُ (33)، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.', target: 1 },
    ]
  },
  {
    id: 'worry',
    title: 'الهم والحزن',
    icon: Heart,
    color: 'text-rose-500',
    items: [
      { id: 'wr1', text: 'اللَّهُمَّ إِنِّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ عَلَّمْتَهُ أَحَداً مِنْ خَلْقِكَ، أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلاَءَ حُزْنِي وَذَهَابَ هَمِّي.', target: 1 },
      { id: 'wr2', text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ.', target: 1 },
    ]
  },
  {
    id: 'hajj',
    title: 'الحج والعمرة',
    icon: MapPin,
    color: 'text-slate-700',
    items: [
      { id: 'hj1', text: 'لَبَّيْكَ اللَّهُمَّ عُمْرَةً.', target: 1, virtue: 'عند الإحرام بالعمرة' },
      { id: 'hj2', text: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ لاَ شَرِيكَ لَكَ.', target: 1, virtue: 'التلبية' },
      { id: 'hj3', text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.', target: 1, virtue: 'بين الركن اليماني والحجر الأسود' },
    ]
  },
  {
    id: 'travel',
    title: 'السفر',
    icon: Plane,
    color: 'text-orange-500',
    items: [
      { id: 'tr1', text: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ...', target: 1 },
    ]
  },
  {
    id: 'rain',
    title: 'المطر والريح',
    icon: CloudRain,
    color: 'text-cyan-600',
    items: [
      { id: 'rn1', text: 'اللَّهُمَّ صَيِّباً نَافِعاً.', target: 1 },
      { id: 'rn2', text: 'مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ.', target: 1 },
    ]
  },
  {
    id: 'sick',
    title: 'عيادة المريض',
    icon: AlertCircle,
    color: 'text-red-500',
    items: [
      { id: 'sk1', text: 'لاَ بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ.', target: 1 },
      { id: 'sk2', text: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ.', target: 7 },
    ]
  },
  {
    id: 'funeral',
    title: 'الجنائز',
    icon: Sunset,
    color: 'text-stone-500',
    items: [
      { id: 'fn1', text: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْراً مِنْهَا.', target: 1 },
      { id: 'fn2', text: 'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ، وَعَافِهِ، وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مُدْخَلَهُ...', target: 1, virtue: 'الدعاء للميت' },
    ]
  },
  {
    id: 'greeting',
    title: 'السلام',
    icon: Smile,
    color: 'text-yellow-500',
    items: [
      { id: 'gr1', text: 'السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ.', target: 1 },
    ]
  }
];

const HisnMuslim: React.FC<HisnMuslimProps> = ({ soundEnabled, hapticsEnabled }) => {
  const [activeCategory, setActiveCategory] = useState<AdhkarCategory | null>(null);
  const [activeDhikrIndex, setActiveDhikrIndex] = useState(0);
  const [currentCounts, setCurrentCounts] = useState<Record<string, number>>({});
  const [isCooldown, setIsCooldown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cooldown Constants
  const COOLDOWN_MS = 1500;
  
  // Touch Handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on first click
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

  const filteredCategories = ADHKAR_DATA.filter(cat => 
    cat.title.includes(searchQuery)
  );

  const activeDhikr = activeCategory?.items[activeDhikrIndex];
  const currentCount = activeDhikr ? (currentCounts[`${activeCategory?.id}_${activeDhikr.id}`] || 0) : 0;
  const isCompleted = activeDhikr ? currentCount >= activeDhikr.target : false;

  const handleIncrement = () => {
    if (!activeDhikr || !activeCategory) return;
    if (isCooldown) return;

    if (hapticsEnabled && navigator.vibrate) {
        navigator.vibrate(15);
    }
    
    playSound();

    if (isCompleted) {
        handleNext();
        return;
    }

    const key = `${activeCategory.id}_${activeDhikr.id}`;
    const newCount = currentCount + 1;
    
    setCurrentCounts(prev => ({ ...prev, [key]: newCount }));
    
    setIsCooldown(true);
    setTimeLeft(COOLDOWN_MS);

    // Auto advance if target reached
    if (newCount >= activeDhikr.target) {
        if (hapticsEnabled && navigator.vibrate) navigator.vibrate([50, 50, 50]);
        setTimeout(() => {
            handleNext();
        }, COOLDOWN_MS);
    }
  };

  const handleNext = () => {
    if (!activeCategory) return;
    if (activeDhikrIndex < activeCategory.items.length - 1) {
      setActiveDhikrIndex(prev => prev + 1);
      setIsCooldown(false);
      setTimeLeft(0);
    } else {
       // Category Finished
       if(window.confirm('أتممت هذا الباب بحمد الله، هل تريد العودة للقائمة؟')) {
           handleBack();
       }
    }
  };

  const handlePrev = () => {
    if (activeDhikrIndex > 0) {
      setActiveDhikrIndex(prev => prev - 1);
      setIsCooldown(false);
      setTimeLeft(0);
    }
  };

  const handleBack = () => {
    setActiveCategory(null);
    setActiveDhikrIndex(0);
    setSearchQuery('');
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

  const handleReset = (e: React.MouseEvent | React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if(window.confirm('تصفير العداد؟')) {
         setCurrentCounts(prev => ({...prev, [`${activeCategory?.id}_${activeDhikr?.id}`]: 0}))
      }
  };

  // Button Visuals
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const cooldownProgress = (timeLeft / COOLDOWN_MS) * 100;
  const strokeDashoffset = circumference - ((100 - cooldownProgress) / 100) * circumference;

  // --- VIEW: CATEGORY LIST ---
  if (!activeCategory) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
        <div className="p-4 bg-white/95 dark:bg-slate-900/95 sticky top-0 z-20 backdrop-blur-md border-b border-slate-100 dark:border-white/5">
             <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl">
                 <Search className="text-slate-400" size={20} />
                 <input 
                    type="text"
                    placeholder="البحث في حصن المسلم..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent w-full outline-none text-slate-800 dark:text-white placeholder-slate-400 text-sm"
                 />
             </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
           {filteredCategories.map((cat, idx) => {
             const Icon = cat.icon;
             return (
               <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat)}
                  className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all shadow-sm group"
               >
                  <div className={`w-12 h-12 rounded-full ${cat.color.replace('text-', 'bg-')}/10 flex items-center justify-center shrink-0`}>
                      <Icon className={cat.color} size={24} />
                  </div>
                  <div className="flex-1 text-right">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {idx + 1}
                        </span>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">{cat.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{cat.items.length} ذكر</p>
                  </div>
                  <ChevronLeft className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
               </button>
             );
           })}
        </div>
      </div>
    );
  }

  // --- VIEW: READER (TASBIH MODE) ---
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 relative transition-colors duration-300 overflow-hidden">
      
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shrink-0 h-[60px]">
          <button 
            onClick={handleBack}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
              <ArrowRight size={20} />
          </button>
          <div className="flex-1 text-center">
              <h2 className="font-bold text-slate-800 dark:text-white text-lg">{activeCategory.title}</h2>
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                  <span>{activeDhikrIndex + 1}</span>
                  <span>من</span>
                  <span>{activeCategory.items.length}</span>
              </div>
          </div>
          <div className="w-10" /> 
      </div>

      {/* Main Content Area - Split Layout using Flexbox */}
      {/* Top Part: Flexible Card Area - FIXED CONTAINER (overflow-hidden) */}
      <div className="flex-1 w-full relative overflow-hidden flex items-center justify-center">
         <div className="px-4 w-full h-full flex flex-col justify-center relative">
            
            {/* Navigation Arrows (Absolute Centered) */}
            <button 
                onClick={handleNext}
                disabled={activeDhikrIndex === activeCategory.items.length - 1}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-20 flex items-center justify-center text-slate-400 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-20 active:scale-90 transition-all outline-none"
            >
                <ChevronLeft size={36} />
            </button>

            <button 
                onClick={handlePrev}
                disabled={activeDhikrIndex === 0}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-20 flex items-center justify-center text-slate-400 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-20 active:scale-90 transition-all outline-none"
            >
                <ChevronRight size={36} />
            </button>

            {/* The Card */}
            <div className="px-[10px] w-full relative z-10">
                <div 
                    className="w-full min-h-[250px] max-h-[50vh] rounded-[2rem] bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-emerald-500/30 shadow-xl dark:shadow-2xl relative overflow-hidden flex flex-col justify-center items-center text-center p-6 touch-pan-y transition-colors duration-300"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <div className="w-full px-2 z-10 max-h-[35vh] overflow-y-auto no-scrollbar flex flex-col items-center justify-center">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed font-cairo text-center break-words whitespace-pre-wrap transition-colors">
                            {activeDhikr?.text}
                        </h3>
                        {activeDhikr?.virtue && (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 w-full">
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                    {activeDhikr.virtue}
                                </p>
                            </div>
                        )}
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
                        ) : isCompleted ? (
                             <>
                                <Fingerprint size={60} className="text-white" />
                                <span className="text-xl font-bold text-white">اكتمل</span>
                             </>
                        ) : (
                            <>
                                <Fingerprint size={50} className="text-emerald-100 dark:text-emerald-300 opacity-80" strokeWidth={1.5} />
                                <span className="text-6xl font-bold text-white tabular-nums tracking-tighter drop-shadow-lg">
                                    {activeDhikr?.target ? `${currentCount}/${activeDhikr.target}` : currentCount}
                                </span>
                                {activeDhikr?.target && (
                                    <span className="text-xs text-emerald-100/70 dark:text-slate-500 mt-2 font-medium">
                                        الهدف: {activeDhikr.target}
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

    </div>
  );
};

export default HisnMuslim;