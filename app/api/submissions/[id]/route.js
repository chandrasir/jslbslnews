import { NextResponse } from 'next/server';
import { isAdmin } from '../../../../lib/auth';
import { deleteSub, getSub, saveNews } from '../../../../lib/db';
import { validateText } from '../../../../lib/newsInput';

export const dynamic = 'force-dynamic';

// Admin: APPROVE -> publishes the submission as news.
// Optional JSON body {title, category, content} lets you edit the text first.
export async function POST(req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sub = await getSub(params.id);
  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const merged = {
    title: body.title ?? sub.title,
    category: body.category ?? sub.category,
    content: body.content ?? sub.content,
  };
  const { error, data } = validateText(merged);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const now = Date.now();
  const item = {
    id: sub.id, // same id, so the already-stored image keeps working
    title: data.title,
    category: data.category,
    content: data.content,
    image: sub.image || '',
    byline: sub.showName ? sub.name : '',
    createdAt: now,
    updatedAt: now,
  };
  await saveNews(item);
  await deleteSub(sub.id, true);
  return NextResponse.json({ item });
}

// Admin: REJECT -> removes the submission (and its photo)
export async function DELETE(_req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await deleteSub(params.id, false);
  return NextResponse.json({ ok: true });
}
