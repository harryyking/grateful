// src/store/dailyPromisesStore.ts (or just a hook)
import { create } from 'zustand';
import { useProfileStore } from './ProfileStore';
import promises from '@/data/promise'; // your local promises array

// Same simple hash from your old API
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

interface DailyPromise {
  id: string;
  reference: string;
  finalText: string;
  rawTemplate: string;
  desire: string;
  challenge: string;
  currentState?: string;
}

export const useDailyPromises = () => {
  const profile = useProfileStore()

  const today = new Date().toDateString();
  const userId = 'local-user'; // or get from Better Auth session if you want

  // Deterministic shuffle (same as your old API)
  const seed = today + userId;
  const shuffled = [...promises].sort((a, b) => {
    const hashA = simpleHash(seed + a.id);
    const hashB = simpleHash(seed + b.id);
    return hashA - hashB;
  });

  const dailyPromises: DailyPromise[] = shuffled.slice(0, 4).map((p) => ({
    id: p.id,
    reference: p.reference,
    finalText: p.personalizedTemplate.replace('{name}', profile.name || 'Beloved'),
    rawTemplate: p.personalizedTemplate,
    desire: p.desire,
    challenge: p.challenge,
    currentState: p.currentState,
  }));

  return {
    date: today,
    userName: profile.name || 'Beloved',
    promises: dailyPromises,
    count: dailyPromises.length,
    isReady: profile.hasCompletedOnboarding,
  };
};



export const getTodaysDailyPromises = () => {
  const profile = useProfileStore.getState();   // ← Use .getState() instead of hook

  if (!profile.hasCompletedOnboarding) {
    return { userName: '', promises: [], isReady: false };
  }

  const today = new Date().toDateString();
  const userId = 'local-user';

  const seed = today + userId;

  const shuffled = [...promises].sort((a, b) => {
    const hashA = simpleHash(seed + a.id);
    const hashB = simpleHash(seed + b.id);
    return hashA - hashB;
  });

  const dailyPromises: DailyPromise[] = shuffled.slice(0, 4).map((p) => ({
    id: p.id,
    reference: p.reference,
    finalText: p.personalizedTemplate.replace('{name}', profile.name || 'Beloved'),
    rawTemplate: p.personalizedTemplate,
    desire: p.desire,
    challenge: p.challenge,
    currentState: p.currentState,
  }));

  return {
    date: today,
    userName: profile.name || 'Beloved',
    promises: dailyPromises,
    count: dailyPromises.length,
    isReady: true,
  };
};