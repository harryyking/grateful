import { prisma } from "@/lib/prisma";
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { streakCount: true, currentState: true },
  });

  if (!profile) return Response.json({ error: "Profile not found" });

  return Response.json({
    streakCount: profile.streakCount,
    status: profile.currentState || "Growing",
  });
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ 
    headers: req.headers, 
    query: { disableCookieCache: true } 
  });

  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) return Response.json({ error: "Profile not found" });

  const today = new Date().toISOString().split('T')[0]; // UTC YYYY-MM-DD

  // === NEW STREAK LOGIC WITH 2-DAY GRACE PERIOD ===
  let newStreak = profile.streakCount;

  const lastDate = profile.lastStreakDate 
    ? new Date(profile.lastStreakDate).toISOString().split('T')[0] 
    : null;

  if (lastDate === today) {
    // Already tapped today → do nothing
    newStreak = profile.streakCount;
  } else {
    // Calculate how many days since last tap
    const lastTap = profile.lastStreakDate ? new Date(profile.lastStreakDate) : new Date(0);
    const diffTime = Math.abs(new Date().getTime() - lastTap.getTime());
    const daysSinceLastTap = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysSinceLastTap > 2) {
      // More than 2 days without tapping → RESET
      newStreak = 1;                    // ← change to 0 if you really want streakCount = 0
    } else {
      // 1 or 2 days gap → continue the streak
      newStreak = profile.streakCount + 1;
    }
  }

  // === Update milestone status ===
  let newStatus = "Growing";
  if (newStreak >= 50) newStatus = "Legendary";
  else if (newStreak >= 30) newStatus = "Devoted";
  else if (newStreak >= 20) newStatus = "Faithful";
  else if (newStreak >= 10) newStatus = "Consistent";
  else if (newStreak >= 5) newStatus = "Growing";

  // Save to database
  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      streakCount: newStreak,
      lastStreakDate: new Date(),        // mark today as the last tap
      currentState: newStatus,
    },
  });

  return Response.json({
    streakCount: newStreak,
    status: newStatus,
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}