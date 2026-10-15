import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { isAdmin } from '../../../lib/auth';
import { listSubs, rateHit, saveImage, saveSub } from '../../../lib/db';
import { validateSubmission } from '../../../lib/newsInput';

export const dynamic = 'force-dynamic';

const MAX_PENDING = 100;

// Admin only: list the submissions waiting for approval
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ items: await listSubs() });
}

// Public: a visitor sends in a news item (stored as "pending", NOT published)
export async function POST(req) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (!(await rateHit(`sub:${ip}`, 5, 3600))) {
    return NextResponse.json(
      { error: 'धेरै पटक पठाइयो। कृपया केही समयपछि फेरि प्रयास गर्नुहोस्।' },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));

  // Honeypot: real people never see/fill this hidden field, bots usually do.
  if (body?.website) return NextResponse.json({ ok: true }, { status: 201 });

  const { error, data } = validateSubmission(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  if ((await listSubs()).length >= MAX_PENDING) {
    return NextResponse.json(
      { error: 'अहिले धेरै समाचार प्रतीक्षामा छन्। कृपया पछि प्रयास गर्नुहोस्।' },
      { status: 503 }
    );
  }

  const id = crypto.randomBytes(5).toString('hex');
  let image = '';
  if (data.imageData) {
    await saveImage(id, data.imageData);
    image = `/api/image/${id}?v=${Date.now()}`;
  }
  await saveSub({
    id,
    name: data.name,
    contact: data.contact,
    showName: data.showName,
    title: data.title,
    category: data.category,
    content: data.content,
    image,
    createdAt: Date.now(),
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
