import { GoogleGenAI } from "@google/genai";

// Local Database of Hadiths and Wisdoms for Offline Mode
const DAILY_CONTENT = [
  "قال رسول الله ﷺ: «من صلى عليَّ صلاة صلى الله عليه بها عشراً». (رواه مسلم)",
  "قال رسول الله ﷺ: «أولى الناس بي يوم القيامة أكثرهم عليَّ صلاة». (رواه الترمذي)",
  "قال رسول الله ﷺ: «البخيل من ذُكرت عنده فلم يصلِّ علي». (رواه الترمذي)",
  "قال رسول الله ﷺ: «ما من أحد يسلم علي إلا رد الله علي روحي حتى أرد عليه السلام». (رواه أبو داود)",
  "«إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا»",
  "قال رسول الله ﷺ: «أكثروا الصلاة علي يوم الجمعة وليلة الجمعة، فمن صلى علي صلاة صلى الله عليه بها عشراً».",
  "الصلاة على النبي ﷺ سبب لكفاية الهموم وغفران الذنوب.",
  "قال أُبي بن كعب: قلت يا رسول الله، إني أكثر الصلاة عليك فكم أجعل لك من صلاتي؟ ... قال: «إذًا تُكْفَى همَّك، ويُغْفَرُ لك ذنبُك».",
  "من أراد انشراح الصدر وذهاب الغم فليكثر من الصلاة على النبي ﷺ.",
  "اللهم صل وسلم على نبينا محمد صلاة تنحل بها العقد وتنفرج بها الكرب.",
  "قال ابن القيم: «الصلاة على النبي ﷺ سبب لغفران الذنوب، وكفاية الهموم، وقضاء الحاجات».",
  "أقربكم مني مجلساً يوم القيامة أكثركم علي صلاة."
];

export const getDailyHadithOrWisdom = async (): Promise<string> => {
  // Use the date to pick a consistent daily message without internet
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = dayOfYear % DAILY_CONTENT.length;
  return DAILY_CONTENT[index];
};

export const getSpiritualAdvice = async (message: string): Promise<string> => {
  // Online Mode: Try Gemini API if API_KEY is available
  if (process.env.API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: {
          systemInstruction: 'أنت مساعد إسلامي ذكي في تطبيق "المليار صلاة على النبي". قدم نصائح مختصرة وروحانية ومريحة للقلب، وركز على فضل الصلاة على النبي والاستغفار.',
        }
      });
      if (response.text) return response.text;
    } catch (e) {
      console.error("Gemini Service Error", e);
    }
  }

  // Offline Mode: Simple keyword matching fallback
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('فضل') || lowerMsg.includes('لماذا')) {
     return "الصلاة على النبي ﷺ تفرج الهموم، وتغفر الذنوب، وترفع الدرجات، وهي سبب لشفاعة النبي ﷺ يوم القيامة.";
  }
  
  if (lowerMsg.includes('مهموم') || lowerMsg.includes('حزين') || lowerMsg.includes('ضيق')) {
     return "عليك بالإكثار من الصلاة على النبي ﷺ، فقد قال للصحابي أبيّ بن كعب حين قال له أجعل لك صلاتي كلها: «إذًا تُكْفَى همَّك، ويُغْفَرُ لك ذنبُك».";
  }

  if (lowerMsg.includes('نصيحة') || lowerMsg.includes('ورد')) {
     return "أنصحك بتخصيص وقت محدد يومياً للصلاة على النبي ﷺ، ولو دقائق معدودة. استعمل السبحة الإلكترونية في التطبيق لضبط العدد.";
  }

  // Default Random Wisdom
  return DAILY_CONTENT[Math.floor(Math.random() * DAILY_CONTENT.length)];
};
