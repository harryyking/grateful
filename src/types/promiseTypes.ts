// ================================================
// CORE TYPES - ONBOARDING + PERSONALIZATION
// ================================================

export type OnboardingState = 
  | 'overwhelmed'
  | 'anxious'
  | 'distant'
  | 'inconsistent';

export type PrimaryDesire = 
  | 'peace'
  | 'strength'
  | 'direction'
  | 'faith'
  | 'provision';

  export type ChristianTradition = 
  | 'catholic'
  | 'protestant'
  | 'orthodox'
  | 'charismatic'
  | 'nondenominational';

export type EncouragementTime = 
  | 'morning'
  | 'afternoon'
  | 'night';

export type Challenge = 
  | 'anxiety'
  | 'temptation'
  | 'consistency'
  | 'lost';

export type FinalMotivation = string; // one word: "Peace", "Hope", "Strength", etc.

// ================================================
// PROMISE TYPES
// ================================================


export interface Promise {
  id: string;                    
  text: string;
  personalizedTemplate: string;  
  reference: string;
  challenge: Challenge;
  desire: PrimaryDesire;
  currentState: OnboardingState
}

// ================================================
// ONBOARDING ANSWERS (Exact match to your questions)
// ================================================

export interface OnboardingAnswers {
  name: string;
  current_state: OnboardingState;
  desire: PrimaryDesire;                    // from "What do you need most from God"
  struggle: Challenge[];                    // multiselect
  christian_tradition: ChristianTradition;
  reminder_time: EncouragementTime;         // renamed from vulnerable_time
  final_word: FinalMotivation;              // one word motivation
}

// ================================================
// PROFILE DATA (What gets saved in Prisma)
// ================================================

export interface ProfileData {
  id: string;
  userId: string;

  // Basic Info
  name: string;
  avatar?: string;
  bio?: string;

  // Onboarding Data
  currentState: OnboardingState | null;
  primaryDesire: PrimaryDesire | null;
  biggestChallenge: Challenge[];          
  encouragementTime: EncouragementTime | null;
  finalMotivation: FinalMotivation | null;

  // Additional fields
  pushToken?: string;
  preferences?: Record<string, any>;       // flexible future-proof field
  widgetsUnlocked: boolean;
  streakCount: number;
  lastStreakDate?: Date;
  notificationTime?: string;               // e.g. "08:00"
  timezone?: string;
  totalDonated: number;
  hasCompletedOnboarding: boolean;

  createdAt: Date;
  updatedAt: Date;
}

// ================================================
// HELPER TYPES & DEFAULTS
// ================================================

export interface UserSettings {
  hasCompletedOnboarding: boolean;
  currentStreak: number;
  savedPromises: string[];           
  isDarkMode: boolean;
  morningNotification: boolean;
  eveningNotification: boolean;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  hasCompletedOnboarding: false,
  currentStreak: 0,
  savedPromises: [],
  isDarkMode: false,
  morningNotification: true,
  eveningNotification: true,
};

// Label mappings for UI
export const ONBOARDING_STATE_LABELS: Record<OnboardingState, string> = {
  overwhelmed: "Overwhelmed",
  anxious: "Anxious",
  distant: "Disconnected from God",
  inconsistent: "Hopeful but inconsistent",
};

export const PRIMARY_DESIRE_LABELS: Record<PrimaryDesire, string> = {
  peace: "Peace",
  strength: "Strength",
  direction: "Direction",
  faith: "Faith",
  provision: "Provision"
};

export const CHRISTIAN_TRADITION_LABELS: Record<ChristianTradition, string> = {
  protestant: "Protestant",
  charismatic: "Charismatic",
  nondenominational: "Non-Denominational",
  orthodox: "Orthodox",
  catholic: "Catholic"
};

export const CHALLENGE_LABELS: Record<Challenge, string> = {
  anxiety: "Anxiety / Overthinking",
  temptation: "Temptation / Habits",
  consistency: "Lack of consistency",
  lost: "Feeling lost",
};