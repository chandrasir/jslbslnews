import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { isAdmin } from '../../../lib/auth';
import { listNews, saveNews } from '../../../lib/db';
import { applyImage, validate } from '../../../lib/newsInput';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ items: await listNews() });
}

export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { error, data } = validate(await req.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });

  const id = crypto.randomBytes(5).toString('hex');
  const now = Date.now();
  const item = {
    id,
    title: data.title,
    category: data.category,
    content: data.content,
    image: await applyImage(id, data, null),
    createdAt: now,
    updatedAt: now,
  };
  await saveNews(item);
  return NextResponse.json({ item }, { status: 201 });
}
