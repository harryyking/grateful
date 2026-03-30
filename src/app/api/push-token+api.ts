// app/api/register-push-token/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { expoPushToken } = await req.json();

  await prisma.profile.update({
    where: { userId: session.user.id },
    data: { pushToken: expoPushToken }
  });

  return Response.json({ success: true });
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