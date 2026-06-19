// src/store/DailyPromisesStore.ts
import { useProfileStore } from './ProfileStore';
import promises from '@/data/promise';
import type { Promise, PrimaryDesire, Focus } from '@/types/promiseTypes';
import {
  getEligiblePromises,
  getSeenCycleCount,
  markPromisesAsSeen,
  pruneOldSeenRecords,
} from './SeenPromisesStore';

// ── Deterministic shuffle ──────────────────────────────────────────────────
export const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// ── Scoring: how relevant is a promise to this user's profile ─────────────
const scorePromise = (
  promise: (typeof promises)[number],
  desire: PrimaryDesire | null,
  focus: Focus[]
): number => {
  let score = 0;
  if (desire && promise.desire === desire) score += 3;
  if (focus.length > 0 && focus.includes(promise.focus as Focus)) score += 2;
  return score;
};

// ── Shared builder ─────────────────────────────────────────────────────────
// Receives `eligiblePromises` (pre-filtered by SeenPromisesStore) so the
// builder itself stays pure. The cycle count salts the seed so the shuffle
// order changes even if date + profile are identical after a pool reset.
const buildDailyPromises = (
  eligiblePromises: (typeof promises)[number][],
  name: string,
  desire: PrimaryDesire | null,
  focus: Focus[],
  cycleCount: number,
  count = 4,
  forDate: Date = new Date()
) => {
  const dateKey = forDate.toDateString();

  // Cycle count changes every day (total records written) — breaks seed
  // repetition on pool resets; week number adds extra entropy across weeks.
  const weekOfYear = Math.floor(
    (forDate.getTime() - new Date(forDate.getFullYear(), 0, 0).getTime()) /
      (7 * 24 * 60 * 60 * 1000)
  );

  const seed = `${dateKey}-w${weekOfYear}-c${cycleCount}-${name}-${desire}-${focus.join(',')}`;

  // Score only from the eligible pool
  const scored = eligiblePromises.map((p) => ({
    promise: p,
    score: scorePromise(p, desire, focus),
  }));

  const relevant = scored.filter((s) => s.score > 0);
  const fallback = scored.filter((s) => s.score === 0);

  const deterministicShuffle = <T,>(arr: T[], keyFn: (item: T) => string) =>
    [...arr].sort((a, b) => simpleHash(seed + keyFn(a)) - simpleHash(seed + keyFn(b)));

  const picked = [
    ...deterministicShuffle(relevant, (x) => x.promise.id),
    ...deterministicShuffle(fallback, (x) => x.promise.id),
  ]
    .slice(0, count)
    .map(({ promise: p }) => ({
      id: p.id,
      text: p.text,
      personalizedTemplate: p.personalizedTemplate,
      reference: p.reference,
      focus: p.focus as Focus,
      desire: p.desire as PrimaryDesire,
      season: p.season,
      finalText: p.personalizedTemplate.replace('{name}', name || 'Beloved'),
    }));

  return picked;
};

// ── React hook (use inside components) ────────────────────────────────────
export const useDailyPromises = () => {
  const { name, primaryDesire, focus, hasCompletedOnboarding } = useProfileStore();

  const today = new Date();
  const eligible = getEligiblePromises(promises);
  const cycleCount = getSeenCycleCount();
  const dailyPromises = buildDailyPromises(eligible, name, primaryDesire, focus, cycleCount, 4, today);

  return {
    date: today.toDateString(),
    userName: name || 'Beloved',
    promises: dailyPromises,
    count: dailyPromises.length,
    isReady: hasCompletedOnboarding,
  };
};

// ── Plain function (use outside components e.g. widgets, background tasks) ─
export const getTodaysDailyPromises = (forDate: Date = new Date()) => {
  const { name, primaryDesire, focus, hasCompletedOnboarding } =
    useProfileStore.getState();

  if (!hasCompletedOnboarding) {
    return { userName: 'Beloved', promises: [], isReady: false };
  }

  const eligible = getEligiblePromises(promises);
  const cycleCount = getSeenCycleCount();
  const dailyPromises = buildDailyPromises(eligible, name, primaryDesire, focus, cycleCount, 4, forDate);

  return {
    date: forDate.toDateString(),
    userName: name || 'Beloved',
    promises: dailyPromises,
    count: dailyPromises.length,
    isReady: true,
  };
};

// ── Commit today's promises as seen ───────────────────────────────────────
// Call ONCE after the daily set is shown to the user — NOT during build,
// so widget pre-renders never accidentally poison the exclusion window.
export const commitDailyPromises = (promiseIds: string[]): void => {
  markPromisesAsSeen(promiseIds);
};

// ── App launch maintenance ─────────────────────────────────────────────────
// Drop from your root layout / app entry point (e.g. app/_layout.tsx useEffect).
export const initDailyPromises = (): void => {
  pruneOldSeenRecords();
};