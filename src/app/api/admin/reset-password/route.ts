import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    {
      error: 'Public password reset over HTTP has been disabled for security. Use the local server command: node scripts/admin-reset.mjs',
      code: 'PUBLIC_RESET_DISABLED',
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Password reset is only available via the local operator CLI (node scripts/admin-reset.mjs).',
      code: 'PUBLIC_RESET_DISABLED',
    },
    { status: 410 }
  );
}
