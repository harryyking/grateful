// src/store/DailyPromisesStore.ts
import { useProfileStore } from './ProfileStore';
import promises from '@/data/promise';
import type { Promise, PrimaryDesire, Focus } from '@/types/promiseTypes';

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
// `forDate` defaults to today but can be any future date, which shifts the
// seed and therefore produces a deterministically different (but stable) set
// of promises for that day — exactly what we need for pre-scheduled widgets.
const buildDailyPromises = (
  name: string,
  desire: PrimaryDesire | null,
  focus: Focus[],
  count = 4,
  forDate: Date = new Date()   // ← the only addition
) => {
  // Seed is date-specific: same day always yields the same order,
  // different days yield different orders — all without a database.
  const dateKey = forDate.toDateString();
  const seed = dateKey + 'local-user';

  // 1. Score every promise against the user's profile
  const scored = promises.map((p) => ({
    promise: p,
    score: scorePromise(p, desire, focus),
  }));

  // 2. Separate into personalised pool (score > 0) and fallback pool
  const personalised = scored.filter((s) => s.score > 0);
  const fallback = scored.filter((s) => s.score === 0);

  // 3. Deterministic shuffle within each pool separately
  interface ScoredPromise {
    promise: (typeof promises)[number];
    score: number;
  }

  const shuffle = (arr: ScoredPromise[]) =>
    [...arr].sort((a, b) => {
      const hashA = simpleHash(seed + a.promise.id);
      const hashB = simpleHash(seed + b.promise.id);
      // Weight by score so higher-relevance promises rise to the top
      return hashA / (a.score + 1) - hashB / (b.score + 1);
    });

  const shuffledPersonalised = shuffle(personalised);
  const shuffledFallback = shuffle(fallback);

  // 4. Fill up to `count` — personalised first, fallback to pad
  const picked = [...shuffledPersonalised, ...shuffledFallback]
    .slice(0, count)
    .map(({ promise: p }) => ({
      id: p.id,
      text: p.text,
      personalizedTemplate: p.personalizedTemplate,
      reference: p.reference,
      focus: p.focus as Focus,
      desire: p.desire as PrimaryDesire,
      season: p.season,
      // Computed display fields
      finalText: p.personalizedTemplate.replace('{name}', name || 'Beloved'),
    }));

  return picked;
};

// ── React hook (use inside components) ────────────────────────────────────
export const useDailyPromises = () => {
  const { name, primaryDesire, focus, hasCompletedOnboarding } = useProfileStore();

  // Hook always resolves to today — no date param needed here
  const today = new Date();
  const dailyPromises = buildDailyPromises(name, primaryDesire, focus, 4, today);

  return {
    date: today.toDateString(),
    userName: name || 'Beloved',
    promises: dailyPromises,
    count: dailyPromises.length,
    isReady: hasCompletedOnboarding,
  };
};

// ── Plain function (use outside components e.g. widgets, background tasks) ─
// `forDate` is optional — omit it for today, pass a future Date for
// pre-rendering widget snapshots via scheduleAllUpcomingWidgets().
export const getTodaysDailyPromises = (forDate: Date = new Date()) => {
  const { name, primaryDesire, focus, hasCompletedOnboarding } =
    useProfileStore.getState();

  if (!hasCompletedOnboarding) {
    return { userName: 'Beloved', promises: [], isReady: false };
  }

  const dailyPromises = buildDailyPromises(name, primaryDesire, focus, 4, forDate);

  return {
    date: forDate.toDateString(),
    userName: name || 'Beloved',
    promises: dailyPromises,
    count: dailyPromises.length,
    isReady: true,
  };
};