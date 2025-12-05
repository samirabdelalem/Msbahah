
export enum TabView {
  HOME = 'HOME',
  TASBIH = 'TASBIH', // Free Custom Tasbih
  HISN_MUSLIM = 'HISN_MUSLIM' // Replaces AI_GUIDE
}

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

export interface TasbihPreset {
  id: string;
  label: string;
  target?: number;
  count: number;
}

export interface DailyStat {
  date: string; // ISO date string YYYY-MM-DD
  count: number;
}

export interface GlobalCampaignStats {
  totalGlobal: number;
  activeUsers: number;
  dailyGoal: number;
  progress: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
