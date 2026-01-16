
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, WifiOff } from 'lucide-react';
import { getSpiritualAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';

const SmartGuide: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'أهلاً بك. أنا مساعدك في التطبيق. يمكنك سؤالي عن فضل الصلاة على النبي، أو طلب نصائح للورد اليومي. (أعمل بدون إنترنت)',
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      // Offline local logic
      const responseText = await getSpiritualAdvice(userMsg.text);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      // Error handling
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'عذراً، حدث خطأ.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "ما فضل الصلاة على النبي؟",
    "أنا مهموم",
    "نصيحة للورد اليومي"
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 relative transition-colors duration-300">
      {/* Header - Fixed at Top */}
      <div className="shrink-0 p-4 border-b border-slate-100 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 flex items-center justify-between shadow-sm">
        <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Sparkles size={20} />
            المرافق الذكي
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <WifiOff size={10} />
                يعمل بدون إنترنت
            </p>
        </div>
        <div className="bg-emerald-100 dark:bg-emerald-500/10 p-2 rounded-full">
            <Bot size={20} className="text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`flex max-w-[85%] gap-2 ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100 dark:border-white/5 ${
                msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-emerald-100 dark:bg-emerald-700 text-emerald-600 dark:text-white'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div 
                className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-line ${
                  msg.role === 'user' 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-tr-none border border-slate-200 dark:border-slate-700' 
                    : 'bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-900/80 dark:to-teal-900/80 border border-transparent dark:border-emerald-500/20 text-white dark:text-emerald-50 rounded-tl-none shadow-md shadow-emerald-500/10'
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
            <div className="flex justify-end w-full">
                <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 rounded-xl rounded-tl-none border border-emerald-100 dark:border-emerald-500/10">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-200"></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at Bottom of Content (above spacer) */}
      <div className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/10 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-5px_20px_rgba(0,0,0,0.2)]">
        
        {/* Suggestions */}
        {messages.length < 3 && (
            <div className="px-4 pt-3 pb-1 overflow-x-auto no-scrollbar flex gap-2">
            {suggestions.map((s, i) => (
                <button 
                key={i}
                onClick={() => setQuery(s)}
                className="whitespace-nowrap px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-slate-600 dark:text-emerald-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700/50"
                >
                {s}
                </button>
            ))}
            </div>
        )}

        {/* Input Field */}
        <div className="p-4 flex items-center gap-2">
          <div className="flex-1 relative">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اكتب سؤالك هنا..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 px-4 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={!query.trim() || isLoading}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white p-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Send size={20} className={document.dir === 'rtl' ? 'rotate-180' : ''} />
          </button>
        </div>
      </div>

      {/* Spacer for Navbar - Pushes content up so input isn't hidden behind Navbar */}
      <div className="shrink-0 h-[85px] w-full bg-white dark:bg-slate-900 transition-colors duration-300" />
    </div>
  );
};

export default SmartGuide;
