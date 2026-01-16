
import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Dot
} from 'recharts';
import { 
  ArrowRight, Calendar, TrendingUp, Activity, 
  Clock, Sun, Moon, Sunset, Sunrise, 
  BarChart2, Award, Zap, CheckCircle2, XCircle
} from 'lucide-react';

interface StatisticsViewProps {
  onClose: () => void;
  storageKey?: string; // Optional: defaults to main stats
  title?: string;      // Optional: defaults to main title
}

type Period = 'week' | 'month' | '6months' | 'year';

const TIME_SEGMENTS = {
  morning: { label: 'الصباح', color: '#f59e0b', icon: Sunrise }, // 5 - 11
  noon: { label: 'الظهر', color: '#fcd34d', icon: Sun },    // 11 - 16
  evening: { label: 'المساء', color: '#f97316', icon: Sunset },  // 16 - 21
  night: { label: 'الليل', color: '#6366f1', icon: Moon },     // 21 - 5
};

const StatisticsView: React.FC<StatisticsViewProps> = ({ 
  onClose, 
  storageKey = 'stats_history_v2', 
  title = 'مركز الإحصائيات' 
}) => {
  const [period, setPeriod] = useState<Period>('week');
  const [dailyTarget, setDailyTarget] = useState<number>(100);

  // Load Target from Global Config
  useEffect(() => {
      const savedConfig = localStorage.getItem('challenge_settings_v2');
      if (savedConfig) {
          try {
              const parsed = JSON.parse(savedConfig);
              // Use daily target for chart visualization
              if (parsed.targets && parsed.targets.daily) {
                setDailyTarget(parsed.targets.daily);
              }
          } catch (e) {
              console.error("Failed to load target", e);
          }
      }
  }, []);

  // Load and Process Data
  const statsData = useMemo(() => {
    const historyStr = localStorage.getItem(storageKey);
    const history = historyStr ? JSON.parse(historyStr) : {};
    return history;
  }, [storageKey]);

  const metrics = useMemo(() => {
    const today = new Date();
    const dates = Object.keys(statsData).sort();
    
    let totalAll = 0;
    let maxDaily = 0;
    let filteredData: any[] = [];
    
    // Time distribution totals
    let timeDist = { morning: 0, noon: 0, evening: 0, night: 0 };
    // Weekday distribution
    let weekDayDist = [0,0,0,0,0,0,0]; // Sun-Sat

    // Helper to check date range
    const isInPeriod = (dateStr: string) => {
      const d = new Date(dateStr);
      const diffTime = Math.abs(today.getTime() - d.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch(period) {
        case 'week': return diffDays <= 7;
        case 'month': return diffDays <= 30;
        case '6months': return diffDays <= 180;
        case 'year': return diffDays <= 365;
        default: return true;
      }
    };

    dates.forEach(date => {
      const dayData = statsData[date];
      const count = dayData.total || 0;
      
      // Update totals if in period
      if (isInPeriod(date)) {
        totalAll += count;
        if (count > maxDaily) maxDaily = count;
        
        filteredData.push({
          date: date, // Keep full date for sorting
          displayDate: new Date(date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'numeric' }),
          count: count
        });

        // Accumulate segments
        if (dayData.segments) {
            timeDist.morning += dayData.segments.morning || 0;
            timeDist.noon += dayData.segments.noon || 0;
            timeDist.evening += dayData.segments.evening || 0;
            timeDist.night += dayData.segments.night || 0;
        }

        // Weekday
        const dayIdx = new Date(date).getDay();
        weekDayDist[dayIdx] += count;
      }
    });

    // Fill missing days for better charts (especially week view)
    if (period === 'week' || period === 'month') {
        const filledData = [];
        const daysToFill = period === 'week' ? 7 : 30;
        for (let i = daysToFill - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const existing = filteredData.find(item => item.date === dateStr);
            
            filledData.push(existing || {
                date: dateStr,
                displayDate: d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'numeric' }),
                count: 0
            });
        }
        filteredData = filledData;
    }

    const avgDaily = filteredData.length > 0 ? Math.round(totalAll / filteredData.length) : 0;

    // Format Pie Data
    const pieData = [
      { name: 'الصباح', value: timeDist.morning, color: TIME_SEGMENTS.morning.color },
      { name: 'الظهر', value: timeDist.noon, color: TIME_SEGMENTS.noon.color },
      { name: 'المساء', value: timeDist.evening, color: TIME_SEGMENTS.evening.color },
      { name: 'الليل', value: timeDist.night, color: TIME_SEGMENTS.night.color },
    ].filter(i => i.value > 0);

    // Format Weekday Data
    const weekDaysAr = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    const barData = weekDayDist.map((val, idx) => ({
      name: weekDaysAr[idx],
      count: val
    }));

    return {
      total: totalAll,
      max: maxDaily,
      avg: avgDaily,
      chartData: filteredData,
      pieData,
      barData
    };
  }, [statsData, period]);

  // Custom Dot Component for the Chart
  const CustomizedDot = (props: any) => {
    const { cx, cy, value } = props;
    if (!cx || !cy) return null;
    
    // Green if target met, Red if not
    const isTargetMet = value >= dailyTarget;
    const color = isTargetMet ? '#10b981' : '#ef4444'; // Emerald-500 or Red-500

    return (
      <svg x={cx - 4} y={cy - 4} width={8} height={8}>
        <circle cx="4" cy="4" r="4" fill={color} stroke="white" strokeWidth="1" />
      </svg>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
         <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">{title}</span>
         <div className={`p-2 rounded-full ${color} bg-opacity-10 text-opacity-100`}>
            <Icon size={16} className={color.replace('bg-', 'text-')} />
         </div>
      </div>
      <div>
         <h4 className="text-2xl font-bold text-slate-800 dark:text-white font-mono">{value.toLocaleString()}</h4>
         {subtext && <p className="text-[10px] text-slate-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 dark:bg-slate-950 overflow-y-auto no-scrollbar flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 border-b border-slate-200 dark:border-white/10 z-20 flex items-center gap-4">
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <BarChart2 className="text-emerald-500" />
          {title}
        </h2>
      </div>

      <div className="p-4 pb-24 max-w-md mx-auto w-full space-y-6">
        
        {/* Period Filters */}
        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
          {(['week', 'month', '6months', 'year'] as Period[]).map((p) => (
             <button
               key={p}
               onClick={() => setPeriod(p)}
               className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                 period === p 
                 ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-white shadow-sm' 
                 : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
               }`}
             >
               {p === 'week' ? 'أسبوع' : p === 'month' ? 'شهر' : p === '6months' ? '6 أشهر' : 'سنة'}
             </button>
          ))}
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-2 gap-3">
           <StatCard 
             title="الإجمالي للفترة" 
             value={metrics.total} 
             icon={Activity} 
             color="text-emerald-500"
             subtext="مرات الذكر"
           />
           <StatCard 
             title="المتوسط اليومي" 
             value={metrics.avg} 
             icon={TrendingUp} 
             color="text-blue-500"
             subtext="معدل استمرارية"
           />
           <StatCard 
             title="أعلى رقم يومي" 
             value={metrics.max} 
             icon={Award} 
             color="text-amber-500"
             subtext="أفضل إنجاز"
           />
           <StatCard 
             title="إنجاز الفترة" 
             value={metrics.total > 0 ? 'متميز' : 'ابدأ'} 
             icon={Zap} 
             color="text-purple-500"
             subtext={metrics.total > 0 ? "واصل التقدم" : "لا يوجد بيانات"}
           />
        </div>

        {/* Main Chart */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
           <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                 <Calendar size={16} /> النشاط الزمني
               </h3>
               
               {/* Legend */}
               <div className="flex items-center gap-3 text-[10px] font-medium">
                   <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_4px_#10b981]"></span>
                       هدف محقق
                   </div>
                   <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                       <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_4px_#f43f5e]"></span>
                       هدف غير محقق
                   </div>
               </div>
           </div>

           <div className="h-64 w-full" style={{ direction: 'ltr' }}>
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={metrics.chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{fontSize: 10, fill: '#94a3b8'}} 
                    axisLine={false}
                    tickLine={false}
                    interval={'preserveStartEnd'}
                  />
                  <YAxis 
                    tick={{fontSize: 10, fill: '#94a3b8'}} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                    labelStyle={{color: '#64748b', fontSize: '12px', textAlign: 'right'}}
                    itemStyle={{color: '#10b981', fontWeight: 'bold'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#cbd5e1" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                    dot={<CustomizedDot />}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
               </AreaChart>
             </ResponsiveContainer>
           </div>
           
           <div className="mt-2 text-center text-[10px] text-slate-400">
                الهدف اليومي الحالي: {dailyTarget.toLocaleString()}
           </div>
        </div>

        {/* Time of Day Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
           <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
             <Clock size={16} /> فترات النشاط
           </h3>
           <div className="flex flex-row items-center">
              <div className="h-48 w-1/2 relative" style={{ direction: 'ltr' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {metrics.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {metrics.total === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400">
                          لا توجد بيانات
                      </div>
                  )}
              </div>
              <div className="w-1/2 space-y-3 pr-2">
                 {Object.entries(TIME_SEGMENTS).map(([key, info]) => {
                     const SegmentIcon = info.icon;
                     // @ts-ignore
                     const val = metrics.pieData.find(x => x.name === info.label)?.value || 0;
                     const percentage = metrics.total > 0 ? Math.round((val / metrics.total) * 100) : 0;
                     
                     return (
                         <div key={key} className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                 <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                                     <SegmentIcon size={12} style={{ color: info.color }} />
                                 </div>
                                 <span className="text-xs text-slate-600 dark:text-slate-300">{info.label}</span>
                             </div>
                             <span className="text-xs font-bold font-mono text-slate-500">{percentage}%</span>
                         </div>
                     )
                 })}
              </div>
           </div>
        </div>

        {/* Days of Week Activity */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
           <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6 flex items-center gap-2">
             <Calendar size={16} /> أيام الأسبوع
           </h3>
           <div className="h-48 w-full" style={{ direction: 'ltr' }}>
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={metrics.barData}>
                 <XAxis 
                    dataKey="name" 
                    tick={{fontSize: 10, fill: '#94a3b8'}} 
                    axisLine={false} 
                    tickLine={false} 
                 />
                 <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '8px', border: 'none'}}
                 />
                 <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
                    {metrics.barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#10b981' : '#e2e8f0'} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
};

export default StatisticsView;
