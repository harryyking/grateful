import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function GET(request: Request) {
    const session = await auth.api.getSession({ headers: request.headers});
  
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: {
        hasCompletedOnboarding: true,   // add this field to your Profile model if you want
        name: true,
      },
    });
  
    return Response.json(profile || {});
  }