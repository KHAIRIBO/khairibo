import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: auth.user,
    });
  } catch (err: any) {
    console.error('GET /api/auth/session error:', err);
    return NextResponse.json({ authenticated: false, error: 'Session check failed' }, { status: 500 });
  }
}

