import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import promises from '@/data/promise';


export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user profile with relevant onboarding data
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        name: true,
        currentState: true,
        primaryDesire: true,
        biggestChallenge: true,
        encouragementTime: true,
        finalMotivation: true,
        hasCompletedOnboarding: true,
      },
    });

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (!profile.hasCompletedOnboarding) {
      return Response.json({ 
        error: "Onboarding not completed",
        redirect: "/onboarding" 
      }, { status: 403 });
    }

    const today = new Date().toDateString();
    
    // Simple deterministic shuffle based on date + userId (same promises every day for the user)
    const seed = today + userId;
    const shuffled = [...promises].sort((a, b) => {
      const hashA = simpleHash(seed + a.id);
      const hashB = simpleHash(seed + b.id);
      return hashA - hashB;
    });

    // Take first 4 promises
    const dailyPromises = shuffled.slice(0, 4).map((p) => ({
      id: p.id,
      reference: p.reference,
      finalText: p.personalizedTemplate.replace('{name}', profile.name || 'Beloved'),
      rawTemplate: p.personalizedTemplate,
      // Optional: send metadata for future personalization
      desire: p.desire,
      challenge: p.challenge,
      currentState: p.currentState,
    }));

    return Response.json({
      date: today,
      userName: profile.name || 'Beloved',
      promises: dailyPromises,
      count: dailyPromises.length,
    });

  } catch (error) {
    console.error("Daily promises API error:", error);
    return Response.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// Simple hash function for deterministic shuffling
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}