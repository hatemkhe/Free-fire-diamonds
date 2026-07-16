export interface User {
  id: string;
  name: string;
  points: number;
  gemsCount: number; // For clicker game internally
  coinsCount: number; // Clicker coins
  autoClickerCount: number; // Clicker autoclicker count
  superClickerCount: number; // Clicker superclicker count
  lastSpinTime: string | null; // Lucky Spin timestamp
}

export interface RedeemItem {
  id: string;
  diamonds: number;
  pointsCost: number;
  imageUrl: string;
  gameName: string;
  badge?: string;
  originalPrice?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: [string, string, string];
  correctIndex: number;
  pointsReward: number;
}

export interface WouldYouRatherQuestion {
  id: number;
  optionA: string;
  optionB: string;
  votesA: number;
  votesB: number;
}

export interface MemoryCard {
  id: number;
  uniqueId: number;
  iconName: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface SafeCrackerState {
  targetCode: string;
  attemptsLeft: number;
  history: Array<{
    guess: string;
    hint: string;
    status: 'high' | 'low' | 'correct';
  }>;
}

export interface MinesTile {
  id: number;
  isMine: boolean;
  isRevealed: boolean;
  pointsValue: number;
}
