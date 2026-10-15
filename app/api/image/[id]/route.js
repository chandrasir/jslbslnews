import { getImage } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  const data = await getImage(params.id);
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(data || '');
  if (!m) return new Response('Not found', { status: 404 });
  return new Response(Buffer.from(m[2], 'base64'), {
    headers: {
      'Content-Type': m[1],
      // URL carries ?v=timestamp, so it is safe to cache for a long time
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
