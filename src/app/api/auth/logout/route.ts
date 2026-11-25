import { NextResponse } from 'next/server';
import {
  authenticateRequest,
  destroySession,
  SESSION_COOKIE_NAME,
} from '@/lib/auth';
import { logActivity } from '@/lib/db-saas';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.token) {
      await destroySession(auth.token);
      await logActivity({
        type: 'logout',
        title: 'Admin Logged Out',
        description: 'Session ended successfully',
        targetType: 'system',
      });
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

    // Clear session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (err: any) {
    console.error('POST /api/auth/logout error:', err);
    return NextResponse.json({ error: 'Logout error' }, { status: 500 });
  }
}

