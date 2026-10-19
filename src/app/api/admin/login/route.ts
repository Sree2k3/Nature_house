import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  generateSignedSessionToken,
  authenticateAdmin,
} from '@/lib/auth';
import { checkThrottle, recordFailedAttempt, clearThrottle } from '@/lib/authService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Both email address and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // Check bounded local rate limiting
    try {
      checkThrottle(cleanEmail);
    } catch (throttleErr) {
      const message = throttleErr instanceof Error ? throttleErr.message : 'Too many failed login attempts.';
      return NextResponse.json(
        { error: message },
        { status: 429 }
      );
    }

    const authResult = await authenticateAdmin(cleanEmail, String(password));

    if (!authResult.success || !authResult.admin) {
      recordFailedAttempt(cleanEmail);
      return NextResponse.json(
        { error: 'Invalid email address or password. Access denied.' },
        { status: 401 }
      );
    }

    // Clear throttle on successful login
    clearThrottle(cleanEmail);

    // Generate cryptographic HMAC-SHA256 signed session token
    const token = generateSignedSessionToken(
      authResult.admin.email,
      authResult.admin.role,
      authResult.admin.name,
      authResult.admin.tokenVersion ?? 1
    );

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful. Welcome to Nature House Studio Admin.',
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 86400, // 7 days in seconds
    });

    return response;
  } catch (err) {
    console.error('[Admin Login Error]:', err);
    return NextResponse.json(
      { error: 'Authentication failed due to internal server error.' },
      { status: 500 }
    );
  }
}
