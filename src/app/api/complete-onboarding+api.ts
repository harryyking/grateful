import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { OnboardingAnswers } from '@/types/promiseTypes'; // adjust path if needed

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
      query: { disableCookieCache: true },
    });

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const answers: OnboardingAnswers = await request.json();

    // Validate required fields
    if (!answers.name || !answers.current_state || !answers.desire) {
      return Response.json({ 
        error: 'Missing required onboarding fields' 
      }, { status: 400 });
    }

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        name: answers.name.trim(),
        currentState: answers.current_state,
        primaryDesire: answers.desire,
        biggestChallenge: answers.struggle || [],
        encouragementTime: answers.reminder_time,
        finalMotivation: answers.final_word,

        // Mark onboarding as completed
        hasCompletedOnboarding: true,

        // Optional: update timestamp
        updatedAt: new Date(),
      },
      create: {
        userId,
        name: answers.name.trim(),
        currentState: answers.current_state,
        primaryDesire: answers.desire,
        biggestChallenge: answers.struggle || [],
        encouragementTime: answers.reminder_time,
        finalMotivation: answers.final_word,
        hasCompletedOnboarding: true,

        // Default values for other fields
        streakCount: 0,
        widgetsUnlocked: false,
      },
    });

    // Optional: Schedule personalized daily notification after successful onboarding
    // await schedulePersonalizedDailyPromiseNotification(); // Uncomment when ready

    return Response.json({
      success: true,
      message: "Onboarding completed successfully",
      profile: {
        name: profile.name,
        hasCompletedOnboarding: profile.hasCompletedOnboarding,
      },
    });

  } catch (error: any) {
    console.error("Onboarding save error:", error);

    if (error.code === 'P2025') {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ 
      error: "Failed to save onboarding data" 
    }, { status: 500 });
  }
}

// Handle OPTIONS for CORS (if needed)
export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}