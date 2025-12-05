import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const getDailyHadithOrWisdom = async (): Promise<string> => {
  try {
    const ai = getClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'أعطني حديثاً صحيحاً قصيراً أو حكمة مؤثرة جداً عن فضل الصلاة على النبي محمد صلى الله عليه وسلم. اجعلها قصيرة وملهمة وباللغة العربية.',
      config: {
        systemInstruction: "You are a knowledgeable Islamic scholar assistant. Keep responses brief, authentic (Sahih), and spiritually uplifting.",
      }
    });
    return response.text || "اللهم صل وسلم على نبينا محمد";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "من صلى علي صلاة صلى الله عليه بها عشرا.";
  }
};

export const getSpiritualAdvice = async (userQuery: string): Promise<string> => {
  try {
    const ai = getClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: {
        systemInstruction: "أنت مساعد ذكي ومسلم ورع، تساعد المستخدمين في تطبيق أذكار وتسبيح. أجابتك يجب أن تكون مبنية على القرآن والسنة، وسطية، قصيرة، ومشجعة. تكلم باللغة العربية.",
      }
    });
    return response.text || "استمر في الذكر، فذكر الله حياة للقلوب.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "عذراً، حدث خطأ في الاتصال. حاول مرة أخرى لاحقاً.";
  }
};
