// ================================================
// CORE TYPES - ONBOARDING + PERSONALIZATION
// ================================================

export type Season =
  | 'peace'
  | 'growth'
  | 'hardship'
  | 'consistency';

export type PrimaryDesire =
  | 'peaceful'
  | 'powerful'
  | 'grounding'
  | 'hopeful';

export type EncouragementTime =
  | 'morning'
  | 'afternoon'
  | 'night';

export type Focus =
  | 'anxiety'
  | 'purpose'
  | 'relationships'
  | 'provision'
  | 'faith';

// ================================================
// PROMISE TYPES
// ================================================

export interface Promise {
  id: string;
  text: string;
  personalizedTemplate: string;
  reference: string;
  focus: Focus;
  desire: PrimaryDesire;
  season: Season;
}

// ================================================
// ONBOARDING ANSWERS — exact match to question IDs
// ================================================

export interface OnboardingAnswers {
  name: string;
  season: Season;
  desire: PrimaryDesire;
  focus: Focus[];
  reminder_time: EncouragementTime;
}

// ================================================
// PROFILE DATA
// ================================================

export interface ProfileData {
  id: string;
  userId: string;

  name: string;
  avatar?: string;

  season: Season | null;
  primaryDesire: PrimaryDesire | null;
  focus: Focus[];
  encouragementTime: EncouragementTime | null;

  pushToken?: string;
  preferences?: Record<string, any>;
  widgetsUnlocked: boolean;
  streakCount: number;
  lastStreakDate?: Date;
  notificationTime?: string;
  timezone?: string;
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
export const SEASON_LABELS: Record<Season, string> = {
  peace: 'I need more peace in my life',
  growth: 'I want to grow closer to God',
  hardship: "I'm going through a hard season",
  consistency: 'I want to build a daily faith habit',
};

export const PRIMARY_DESIRE_LABELS: Record<PrimaryDesire, string> = {
  peaceful: 'Peaceful and still',
  powerful: 'Powerful and encouraging',
  grounding: 'Grounding and steady',
  hopeful: 'Hopeful and uplifting',
};

export const FOCUS_LABELS: Record<Focus, string> = {
  anxiety: 'My mind and anxiety',
  purpose: 'My purpose and direction',
  relationships: 'My relationships',
  provision: 'My finances and provision',
  faith: 'My faith and spiritual growth',
};

export const ENCOURAGEMENT_TIME_LABELS: Record<EncouragementTime, string> = {
  morning: 'Morning — start my day grounded',
  afternoon: 'Afternoon — a midday reset',
  night: 'Night — close the day with peace',
};