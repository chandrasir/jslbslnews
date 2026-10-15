import { NextResponse } from 'next/server';
import { COOKIE_NAME, checkPassword, cookieOptions, createToken, isAdmin } from '../../../lib/auth';
import { hasDb } from '../../../lib/db';

export const dynamic = 'force-dynamic';

// Who am I? (used by the admin page)
export async function GET() {
  return NextResponse.json({ authed: isAdmin(), db: hasDb });
}

// Login
export async function POST(req) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: 'ADMIN_PASSWORD is not set. Add it in Vercel → Settings → Environment Variables.' },
      { status: 500 }
    );
  }
  const { password } = await req.json().catch(() => ({}));
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 700)); // slow down guessing
    return NextResponse.json({ error: 'पासवर्ड मिलेन (wrong password)' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, createToken(7), cookieOptions);
  return res;
}

// Logout
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, '', { ...cookieOptions, maxAge: 0 });
  return res;
}
