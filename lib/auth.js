import crypto from 'crypto';
import { cookies } from 'next/headers';

export const COOKIE_NAME = 'juc_admin';
const DAY = 24 * 60 * 60 * 1000;

const secret = () =>
  process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'dev-only-secret';

const hmac = (payload) =>
  crypto.createHmac('sha256', secret()).update(payload).digest('hex');

export function createToken(days = 7) {
  const exp = String(Date.now() + days * DAY);
  return `${exp}.${hmac(exp)}`;
}

function verifyToken(token) {
  if (!token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig) return false;
  const expected = hmac(exp);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Number(exp) > Date.now();
}

export function isAdmin() {
  return verifyToken(cookies().get(COOKIE_NAME)?.value);
}

export function checkPassword(input) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real || !input) return false;
  const h = (s) => crypto.createHash('sha256').update(String(s)).digest();
  return crypto.timingSafeEqual(h(input), h(real));
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
};
