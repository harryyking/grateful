import { createMMKV, MMKV } from 'react-native-mmkv';

// ── Storage ────────────────────────────────────────────────────────────────
export const storage = createMMKV({ id: 'seen-promises' });
const SEEN_KEY = 'seen_promises_v1';

// ── Types ──────────────────────────────────────────────────────────────────
export type SeenRecord = {
  promiseId: string;
  seenAt: number; // Unix ms timestamp
};

// ── Constants ──────────────────────────────────────────────────────────────
// 14-day window → users go ~30 days before any repeat on the full 123-promise pool.
// When the pool shrinks below MIN_ELIGIBLE the window halves, restoring 28 promises.
const DEFAULT_WINDOW_DAYS = 14;

// 3× daily count (4) — ensures meaningful variety before falling back.
// Never triggers until day ~32 on the real pool.
const MIN_ELIGIBLE_COUNT = 12;

// ── Read / write helpers ───────────────────────────────────────────────────
export const getSeenRecords = (): SeenRecord[] => {
  const raw = storage.getString(SEEN_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SeenRecord[];
  } catch {
    return [];
  }
};

const saveSeenRecords = (records: SeenRecord[]): void => {
  storage.set(SEEN_KEY, JSON.stringify(records));
};

// ── Core: IDs seen within the window ──────────────────────────────────────
const getRecentlySeenIds = (windowDays: number): Set<string> => {
  const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;
  return new Set(
    getSeenRecords()
      .filter((r) => r.seenAt > cutoff)
      .map((r) => r.promiseId)
  );
};

// ── Eligible promise filter ────────────────────────────────────────────────
// Returns promises not seen within the rolling window.
// Progressively halves the window if the pool is too small.
// Always returns at least `allPromises` (never empty).
export const getEligiblePromises = <T extends { id: string }>(
  allPromises: T[],
  windowDays = DEFAULT_WINDOW_DAYS
): T[] => {
  let currentWindow = windowDays;

  while (currentWindow >= 1) {
    const recentIds = getRecentlySeenIds(currentWindow);
    const eligible = allPromises.filter((p) => !recentIds.has(p.id));
    if (eligible.length >= MIN_ELIGIBLE_COUNT) return eligible;
    currentWindow = Math.floor(currentWindow / 2);
  }

  // Full exhaustion: return everything so the cycle resets cleanly.
  return allPromises;
};

// ── Cycle counter ──────────────────────────────────────────────────────────
// Total promises ever marked seen — used to salt the daily shuffle seed,
// ensuring the hash ordering changes after each cycle reset even if the
// date and profile inputs are identical.
export const getSeenCycleCount = (): number => getSeenRecords().length;

// ── Mark shown ────────────────────────────────────────────────────────────
// Call ONCE per day after promises are rendered. Upserts so re-seen verses
// always get a fresh timestamp.
export const markPromisesAsSeen = (ids: string[]): void => {
  const now = Date.now();
  const existing = getSeenRecords().filter((r) => !ids.includes(r.promiseId));
  saveSeenRecords([
    ...existing,
    ...ids.map((id) => ({ promiseId: id, seenAt: now })),
  ]);
};

// ── Prune stale records ───────────────────────────────────────────────────
// Call once on app launch. Drops records older than 2× the window —
// they're eligible again anyway, so no information is lost.
export const pruneOldSeenRecords = (windowDays = DEFAULT_WINDOW_DAYS): void => {
  const cutoff = Date.now() - windowDays * 2 * 24 * 60 * 60 * 1000;
  saveSeenRecords(getSeenRecords().filter((r) => r.seenAt > cutoff));
};

// ── Dev/debug helper ──────────────────────────────────────────────────────
export const getSeenStats = (totalCount: number, windowDays = DEFAULT_WINDOW_DAYS) => {
  const all = getSeenRecords();
  const recentIds = getRecentlySeenIds(windowDays);
  return {
    totalSeen: all.length,
    seenInWindow: recentIds.size,
    eligibleCount: totalCount - recentIds.size,
    oldestSeenAt: all.length > 0 ? new Date(Math.min(...all.map((r) => r.seenAt))) : null,
    newestSeenAt: all.length > 0 ? new Date(Math.max(...all.map((r) => r.seenAt))) : null,
  };
};

// ── Reset (onboarding redo / testing) ─────────────────────────────────────
export const clearSeenPromises = (): void => {
  storage.remove(SEEN_KEY);
};