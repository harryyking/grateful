import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from 'zustand-mmkv-storage';

import type { OnboardingAnswers, Season, PrimaryDesire, Focus, EncouragementTime } from '@/types/promiseTypes';

interface ProfileState {
  name: string;
  createdAt: string;
  season: Season | null;
  primaryDesire: PrimaryDesire | null;
  focus: Focus[];
  encouragementTime: EncouragementTime;
  hasCompletedOnboarding: boolean;

  streakCount: number;
  lastStreakDate: string | null;
  currentStatus: string;
  widgetsUnlocked: boolean;

  hasHydrated: boolean;
  lastReviewPrompt: number;

  // Actions
  setLastReviewPrompt: (timestamp: number) => void;
  completeOnboarding: (answers: OnboardingAnswers) => void;
  finishOnboarding: () => void;
  updateName: (name: string) => void;
  tapStreak: () => { streakCount: number; status: string };
  deleteAccount: () => void;
  resetProfile: () => void;
  setHasHydrated: (value: boolean) => void;
}

const DEFAULT_STATE = {
  name: 'Beloved',
  createdAt: new Date().toISOString(),
  season: null as Season | null,
  primaryDesire: null as PrimaryDesire | null,
  focus: [] as Focus[],
  encouragementTime: 'morning' as EncouragementTime,
  hasCompletedOnboarding: false,
  streakCount: 0,
  lastStreakDate: null as string | null,
  currentStatus: 'Growing',
  widgetsUnlocked: false,
  lastReviewPrompt: 0,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,
      hasHydrated: false,

      setLastReviewPrompt: (timestamp) => set({ lastReviewPrompt: timestamp }),

      completeOnboarding: (answers: OnboardingAnswers) => {
        set({
          name: answers.name.trim() || 'Beloved',
          season: answers.season,
          primaryDesire: answers.desire,
          focus: answers.focus,
          encouragementTime: answers.reminder_time ?? 'morning',
        });
      },

      finishOnboarding: () => set({ hasCompletedOnboarding: true }),

      updateName: (newName) => {
        const trimmed = newName?.trim();
        if (!trimmed) return;
        set({ name: trimmed.slice(0, 100) });
      },

      tapStreak: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const lastDate = state.lastStreakDate
          ? new Date(state.lastStreakDate).toISOString().split('T')[0]
          : null;

        let newStreak = state.streakCount;

        if (lastDate !== today) {
          const lastTap = state.lastStreakDate ? new Date(state.lastStreakDate) : new Date(0);
          const daysSince = Math.ceil(
            Math.abs(new Date().getTime() - lastTap.getTime()) / (1000 * 60 * 60 * 24)
          );
          newStreak = daysSince > 2 ? 1 : state.streakCount + 1;
        }

        let newStatus = 'Growing';
        if (newStreak >= 50) newStatus = 'Legendary';
        else if (newStreak >= 30) newStatus = 'Devoted';
        else if (newStreak >= 20) newStatus = 'Faithful';
        else if (newStreak >= 10) newStatus = 'Consistent';
        else if (newStreak >= 5) newStatus = 'Growing';

        set({
          streakCount: newStreak,
          lastStreakDate: new Date().toISOString(),
        });

        return { streakCount: newStreak, status: newStatus };
      },

      deleteAccount: () => set({ ...DEFAULT_STATE }),
      resetProfile: () => set({ ...DEFAULT_STATE }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),

    {
      name: 'profile-storage',
      storage: createJSONStorage(() => mmkvStorage),

      partialize: (state) => ({
        name: state.name,
        createdAt: state.createdAt,
        season: state.season,
        primaryDesire: state.primaryDesire,
        focus: state.focus,
        encouragementTime: state.encouragementTime,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        streakCount: state.streakCount,
        lastStreakDate: state.lastStreakDate,
        currentStatus: state.currentStatus,
        widgetsUnlocked: state.widgetsUnlocked,
        lastReviewPrompt: state.lastReviewPrompt,
      }),

      version: 3, // bump because shape changed

      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate profile store:', error);
          return;
        }
        if (state) {
          queueMicrotask(() => state.setHasHydrated(true));
        }
      },
    }
  )
);