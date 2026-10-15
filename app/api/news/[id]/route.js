import { NextResponse } from 'next/server';
import { isAdmin } from '../../../../lib/auth';
import { deleteNews, getNews, saveNews } from '../../../../lib/db';
import { applyImage, validate } from '../../../../lib/newsInput';

export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const prev = await getNews(params.id);
  if (!prev) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { error, data } = validate(await req.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });

  const item = {
    ...prev,
    title: data.title,
    category: data.category,
    content: data.content,
    image: await applyImage(prev.id, data, prev),
    updatedAt: Date.now(),
  };
  await saveNews(item);
  return NextResponse.json({ item });
}

export async function DELETE(_req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await deleteNews(params.id);
  return NextResponse.json({ ok: true });
}
