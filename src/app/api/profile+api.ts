import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: {
        name: true,
        createdAt: true,
      },
    });

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    return Response.json(profile);
  } catch (error) {
    console.error('Profile GET error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers, query: { disableCookieCache: true }, });

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await req.json();

    // Basic validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json({ error: 'Name is required' }, { status: 400 });
    }

    if (name.length > 100) {
      return Response.json({ error: 'Name is too long (max 100 characters)' }, { status: 400 });
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: { name: name.trim() },
      select: {
        name: true,
        createdAt: true,
      },
    });

    return Response.json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Profile PATCH error:', error);

    if (error.code === 'P2025') {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optional: Ask for confirmation in body (e.g. { confirm: true })
    const { confirm } = await req.json().catch(() => ({}));

    if (confirm !== true) {
      return Response.json(
        { error: 'Confirmation required. Send { confirm: true }' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return Response.json({
      message: 'Profile deleted successfully',
    });
  } catch (error: any) {
    console.error('Profile DELETE error:', error);

    if (error.code === 'P2025') {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}