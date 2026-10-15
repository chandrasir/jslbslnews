import { Redis } from '@upstash/redis';

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

// In-memory fallback so the site still runs locally without a database.
// (On Vercel this is NOT permanent - connect Upstash Redis for real storage.)
const mem = globalThis.__jucMem || (globalThis.__jucMem = { news: {}, img: {} });

export const hasDb = Boolean(redis);

const NEWS_KEY = 'juc:news';
const imgKey = (id) => `juc:img:${id}`;

const parse = (v) => (typeof v === 'string' ? JSON.parse(v) : v);

export async function listNews() {
  let raw;
  if (redis) {
    const h = await redis.hgetall(NEWS_KEY);
    raw = h ? Object.values(h) : [];
  } else {
    raw = Object.values(mem.news);
  }
  return raw.map(parse).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getNews(id) {
  let v;
  if (redis) v = await redis.hget(NEWS_KEY, id);
  else v = mem.news[id];
  return v ? parse(v) : null;
}

export async function saveNews(item) {
  if (redis) await redis.hset(NEWS_KEY, { [item.id]: JSON.stringify(item) });
  else mem.news[item.id] = item;
  return item;
}

export async function deleteNews(id) {
  if (redis) {
    await redis.hdel(NEWS_KEY, id);
    await redis.del(imgKey(id));
  } else {
    delete mem.news[id];
    delete mem.img[id];
  }
}

export async function saveImage(id, dataUrl) {
  if (redis) await redis.set(imgKey(id), dataUrl);
  else mem.img[id] = dataUrl;
}

export async function getImage(id) {
  if (redis) return (await redis.get(imgKey(id))) || null;
  return mem.img[id] || null;
}

export async function removeImage(id) {
  if (redis) await redis.del(imgKey(id));
  else delete mem.img[id];
}

/* ---------- visitor submissions (waiting for admin approval) ---------- */
const SUB_KEY = 'juc:sub';
mem.subs = mem.subs || {};
mem.rate = mem.rate || {};

export async function listSubs() {
  let raw;
  if (redis) {
    const h = await redis.hgetall(SUB_KEY);
    raw = h ? Object.values(h) : [];
  } else {
    raw = Object.values(mem.subs);
  }
  return raw.map(parse).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getSub(id) {
  const v = redis ? await redis.hget(SUB_KEY, id) : mem.subs[id];
  return v ? parse(v) : null;
}

export async function saveSub(item) {
  if (redis) await redis.hset(SUB_KEY, { [item.id]: JSON.stringify(item) });
  else mem.subs[item.id] = item;
  return item;
}

// keepImage = true when the submission was approved (its image now belongs to the news item)
export async function deleteSub(id, keepImage = false) {
  if (redis) {
    await redis.hdel(SUB_KEY, id);
    if (!keepImage) await redis.del(imgKey(id));
  } else {
    delete mem.subs[id];
    if (!keepImage) delete mem.img[id];
  }
}

// Simple rate limit: returns true if the caller is still under `limit` hits per window.
export async function rateHit(key, limit, windowSec) {
  if (redis) {
    const k = `juc:rate:${key}`;
    const n = await redis.incr(k);
    if (n === 1) await redis.expire(k, windowSec);
    return n <= limit;
  }
  const now = Date.now();
  const rec = mem.rate[key];
  if (!rec || rec.reset < now) {
    mem.rate[key] = { n: 1, reset: now + windowSec * 1000 };
    return true;
  }
  rec.n += 1;
  return rec.n <= limit;
}
