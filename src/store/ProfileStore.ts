// src/store/profileStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from 'zustand-mmkv-storage';

import type { OnboardingAnswers } from '@/types/promiseTypes';

interface ProfileState {
  name: string;
  createdAt: string;
  currentState: string;
  primaryDesire: string;
  biggestChallenge: string[];
  encouragementTime: string;
  finalMotivation: string;
  hasCompletedOnboarding: boolean;

  streakCount: number;
  lastStreakDate: string | null;
  widgetsUnlocked: boolean;

  hasHydrated: boolean;
  lastReviewPrompt: number;
  // Actions
  setLastReviewPrompt: (timestamp: number) => void;
  finishOnboarding: () => void;  
  completeOnboarding: (answers: OnboardingAnswers) => void;
  updateName: (name: string) => void;
  tapStreak: () => { streakCount: number; status: string };
  deleteAccount: () => void;
  resetProfile: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      name: 'Beloved',
      createdAt: new Date().toISOString(),
      currentState: 'Growing',
      primaryDesire: '',
      biggestChallenge: [],
      encouragementTime: 'morning',
      finalMotivation: '',
      hasCompletedOnboarding: false,

      streakCount: 0,
      lastStreakDate: null,
      widgetsUnlocked: false,

      hasHydrated: false,
      lastReviewPrompt: 0,
      setLastReviewPrompt: (timestamp: number) => set({ lastReviewPrompt: timestamp }),

      completeOnboarding: (answers: OnboardingAnswers) => {
        set((state) => ({
          name: answers.name.trim(),
          currentState: answers.current_state || state.currentState,
          primaryDesire: answers.desire,
          biggestChallenge: answers.struggle || [],
          encouragementTime: answers.reminder_time ?? 'morning',
          finalMotivation: answers.final_word ?? '',
        }));
      },


      finishOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      updateName: (newName: string) => {
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
          const daysSinceLastTap = Math.ceil(
            Math.abs(new Date().getTime() - lastTap.getTime()) / (1000 * 60 * 60 * 24)
          );
          newStreak = daysSinceLastTap > 2 ? 1 : state.streakCount + 1;
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
          currentState: newStatus,
        });

        return { streakCount: newStreak, status: newStatus };
      },

      deleteAccount: () => {
        set({
          name: 'Beloved',
          createdAt: new Date().toISOString(),
          currentState: 'Growing',
          primaryDesire: '',
          biggestChallenge: [],
          encouragementTime: 'morning',
          finalMotivation: '',
          hasCompletedOnboarding: false,
          streakCount: 0,
          lastStreakDate: null,
          widgetsUnlocked: false,
        });
      },

      resetProfile: () => {
        set({
          name: 'Beloved',
          createdAt: new Date().toISOString(),
          currentState: 'Growing',
          primaryDesire: '',
          biggestChallenge: [],
          encouragementTime: 'morning',
          finalMotivation: '',
          hasCompletedOnboarding: false,
          streakCount: 0,
          lastStreakDate: null,
          widgetsUnlocked: false,
        });
      },

      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),
    }),

    {
      name: 'profile-storage',
      storage: createJSONStorage(() => mmkvStorage),

      partialize: (state) => ({
        name: state.name,
        createdAt: state.createdAt,
        currentState: state.currentState,
        primaryDesire: state.primaryDesire,
        biggestChallenge: state.biggestChallenge,
        encouragementTime: state.encouragementTime,
        finalMotivation: state.finalMotivation,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        streakCount: state.streakCount,
        lastStreakDate: state.lastStreakDate,
        widgetsUnlocked: state.widgetsUnlocked,
        lastReviewPrompt: state.lastReviewPrompt,
      }),

      version: 2,

      // Recommended safest pattern for onRehydrateStorage
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate profile store:', error);
          return;
        }

        if (state) {
          // This is the most reliable way in Zustand v5+
          queueMicrotask(() => {
            state.setHasHydrated(true);
          });
        }
      },
    }
  )
);