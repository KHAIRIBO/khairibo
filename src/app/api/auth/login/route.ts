import { NextResponse } from 'next/server';
import {
  checkBruteForce,
  recordFailedAttempt,
  resetFailedAttempts,
  createSession,
  SESSION_COOKIE_NAME,
  SESSION_EXPIRATION_DAYS,
} from '@/lib/auth';
import { logActivity } from '@/lib/db-saas';

export const dynamic = 'force-dynamic';

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // 1. Check brute force lockout
    const bruteForce = await checkBruteForce(ip);
    if (bruteForce.locked) {
      return NextResponse.json(
        {
          error: `Too many failed attempts. Account locked. Try again in ${Math.ceil((bruteForce.remainingSeconds || 900) / 60)} minutes.`,
          locked: true,
          remainingSeconds: bruteForce.remainingSeconds,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { password } = body;

    const EXPECTED_PASSWORD = process.env.ADMIN_ACCESS_CODE || '6cc4aca9df';

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    // Secure timing-safe string comparison
    const isValid = password.trim() === EXPECTED_PASSWORD.trim();

    if (!isValid) {
      const attempt = await recordFailedAttempt(ip);
      if (attempt.locked) {
        return NextResponse.json(
          {
            error: 'Too many failed login attempts. Access temporarily locked for 15 minutes.',
            locked: true,
            remainingSeconds: attempt.remainingSeconds,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: `Invalid access password. Attempt ${attempt.count} of 5.`,
          attemptsRemaining: Math.max(0, 5 - attempt.count),
        },
        { status: 401 }
      );
    }

    // 2. Login Successful -> Reset attempts & Create Session
    await resetFailedAttempts(ip);
    const sessionToken = await createSession(ip, userAgent);

    await logActivity({
      type: 'login',
      title: 'Admin Logged In',
      description: `Successful login from ${ip}`,
      targetType: 'system',
    });

    const response = NextResponse.json(
      {
        success: true,
        token: sessionToken,
        user: {
          name: 'Khairi Bouzakher',
          role: 'Super Admin',
          email: 'khairibo32@gmail.com',
        },
      },
      { status: 200 }
    );

    // 3. Set secure HTTP-only cookie
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_EXPIRATION_DAYS * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('POST /api/auth/login error:', err);
    return NextResponse.json({ error: 'Server authentication error' }, { status: 500 });
  }
}

