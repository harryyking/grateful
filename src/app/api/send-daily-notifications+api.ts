import { prisma } from '@/lib/prisma';
import promises from '@/data/promise';

export async function GET(req: Request) {
  // Security: only allow from cron
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await prisma.profile.findMany({
    where: { 
      pushToken: { not: null },
      hasCompletedOnboarding: true 
    },
    select: { userId: true, name: true, pushToken: true }
  });

  for (const user of users) {
    if (!user.pushToken) continue;

    const daily = getTodaysPromise(user.userId, user.name || "Beloved");

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user.pushToken,
        sound: 'default',
        title: `Good morning, ${user.name || "Beloved"} ✨`,
        body: daily.finalText,
      })
    });
  }

  return Response.json({ success: true, sent: users.length });
}

function getTodaysPromise(userId: string, name: string) {
  const today = new Date().toDateString();
  const seed = today + userId;

  const shuffled = [...promises].sort((a, b) => {
    const hashA = simpleHash(seed + (a.id || a.reference));
    const hashB = simpleHash(seed + (b.id || b.reference));
    return hashA - hashB;
  });

  const p = shuffled[0];
  return {
    finalText: p.personalizedTemplate.replace('{name}', name)
  };
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}