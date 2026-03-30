-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "bibleHabit" TEXT,
ADD COLUMN     "biggestChallenge" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "currentState" TEXT,
ADD COLUMN     "encouragementStyle" TEXT,
ADD COLUMN     "encouragementTime" TEXT,
ADD COLUMN     "finalMotivation" TEXT,
ADD COLUMN     "focusAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "gratitudeLevel" TEXT,
ADD COLUMN     "notificationPreferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "preferredBibleVersion" TEXT,
ADD COLUMN     "seasonGoals" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "streakGoal" TEXT,
ADD COLUMN     "wantsTestimonies" BOOLEAN DEFAULT false;
