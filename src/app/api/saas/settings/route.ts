import { NextResponse } from 'next/server';
import { authenticateRequest, getActiveSessions, destroySession } from '@/lib/auth';
import { getSettings, updateSettings, logActivity } from '@/lib/db-saas';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [settings, sessions] = await Promise.all([
      getSettings(),
      getActiveSessions(),
    ]);

    return NextResponse.json({
      settings,
      activeSessions: sessions.map((s) => ({
        token: s.token.substring(0, 8) + '...',
        isCurrent: s.token === auth.token,
        ip: s.ip,
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
      })),
    });
  } catch (err: any) {
    console.error('GET /api/saas/settings error:', err);
    return NextResponse.json({ error: 'Failed to retrieve settings' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updated = await updateSettings(body);

    await logActivity({
      type: 'settings_update',
      title: 'Settings Updated',
      description: 'System preferences updated',
      targetType: 'system',
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('PATCH /api/saas/settings error:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // Action 1: Change password
    if (action === 'change_password') {
      const { currentPassword, newPassword } = body;
      const expectedCurrent = process.env.ADMIN_ACCESS_CODE || '6cc4aca9df';

      if (!currentPassword || currentPassword !== expectedCurrent) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
      }

      // Save to MongoDB global_settings / process env
      process.env.ADMIN_ACCESS_CODE = newPassword;

      try {
        const db = await getDb();
        if (db) {
          await db.collection('saas_settings').updateOne(
            { id: 'global_settings' },
            { $set: { adminAccessCode: newPassword, passwordUpdatedAt: new Date().toISOString() } },
            { upsert: true }
          );
        }
      } catch (e) {
        console.error('DB update access code error:', e);
      }

      await logActivity({
        type: 'settings_update',
        title: 'Password Changed',
        description: 'Admin access password was successfully updated',
        targetType: 'system',
      });

      return NextResponse.json({ success: true, message: 'Password updated successfully' });
    }

    // Action 2: Revoke other sessions
    if (action === 'revoke_other_sessions') {
      const sessions = await getActiveSessions();
      for (const s of sessions) {
        if (s.token !== auth.token) {
          await destroySession(s.token);
        }
      }

      await logActivity({
        type: 'settings_update',
        title: 'Sessions Revoked',
        description: 'All other active sessions were revoked',
        targetType: 'system',
      });

      return NextResponse.json({ success: true, message: 'Other sessions revoked' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('POST /api/saas/settings error:', err);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}

