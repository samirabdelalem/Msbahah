import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User } from 'lucide-react';
import { getSpiritualAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';

const SmartGuide: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'أهلاً بك. أنا مساعدك الذكي في حملة المليار صلاة. يمكنك سؤالي عن فضل الصلاة على النبي، أو طلب أدعية، أو نصائح للاستمرار في الورد اليومي.',
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
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "ما فضل الصلاة على النبي؟",
    "أريد ورد يومي سهل",
    "قصة قصيرة عن رحمة النبي"
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 relative">
      {/* Header - Fixed at Top */}
      <div className="shrink-0 p-4 border-b border-white/10 bg-slate-900/90 backdrop-blur-md z-10 flex items-center justify-between shadow-sm">
        <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
            <Sparkles size={20} />
            المرافق الذكي
            </h2>
            <p className="text-xs text-slate-400">إجابات مبنية على القرآن والسنة</p>
        </div>
        <div className="bg-emerald-500/10 p-2 rounded-full">
            <Bot size={20} className="text-emerald-400" />
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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-slate-700' : 'bg-emerald-700'}`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div 
                className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-tr-none border border-slate-700' 
                    : 'bg-gradient-to-br from-emerald-900/80 to-teal-900/80 border border-emerald-500/20 text-emerald-50 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
            <div className="flex justify-end w-full">
                <div className="flex items-center gap-1 bg-emerald-900/20 px-4 py-3 rounded-xl rounded-tl-none border border-emerald-500/10">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-200"></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at Bottom of Content (above spacer) */}
      <div className="shrink-0 bg-slate-900 border-t border-white/10 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.2)]">
        
        {/* Suggestions */}
        {messages.length < 3 && (
            <div className="px-4 pt-3 pb-1 overflow-x-auto no-scrollbar flex gap-2">
            {suggestions.map((s, i) => (
                <button 
                key={i}
                onClick={() => setQuery(s)}
                className="whitespace-nowrap px-3 py-1.5 bg-slate-800 rounded-full text-xs text-emerald-300 hover:bg-slate-700 transition-colors border border-slate-700/50"
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
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 px-4 pr-4 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:outline-none placeholder-slate-500 transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={!query.trim() || isLoading}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white p-3.5 rounded-xl transition-all shadow-lg active:scale-95"
          >
            <Send size={20} className={document.dir === 'rtl' ? 'rotate-180' : ''} />
          </button>
        </div>
      </div>

      {/* Spacer for Navbar - Pushes content up so input isn't hidden behind Navbar */}
      <div className="shrink-0 h-[85px] w-full bg-slate-900" />
    </div>
  );
};

export default SmartGuide;