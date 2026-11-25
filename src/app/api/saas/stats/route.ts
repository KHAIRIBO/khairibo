import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getDashboardStats } from '@/lib/db-saas';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (err: any) {
    console.error('GET /api/saas/stats error:', err);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}

