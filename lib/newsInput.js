import { CATEGORIES } from './site';
import { removeImage, saveImage } from './db';

export const IMG_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
export const MAX_IMG = 900_000; // characters (~650KB)

// Categories a visitor is allowed to choose (official notices stay admin-only)
export const PUBLIC_CATEGORIES = CATEGORIES.filter((c) => c !== 'सूचना');

function checkText(body, maxContent) {
  const title = String(body?.title || '').trim();
  const content = String(body?.content || '').trim();
  const category = CATEGORIES.includes(body?.category) ? body.category : CATEGORIES[0];
  if (title.length < 3 || title.length > 200) return { error: 'शीर्षक ३ देखि २०० अक्षरको हुनुपर्छ।' };
  if (content.length < 3 || content.length > maxContent) {
    return { error: `विवरण लेख्नुहोस् (अधिकतम ${maxContent.toLocaleString('en-US')} अक्षर)।` };
  }
  return { title, content, category };
}

// Admin form -> { error } or { data }
export function validate(body) {
  const t = checkText(body, 20000);
  if (t.error) return t;
  const imageUrl = String(body?.imageUrl || '').trim();
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) return { error: 'फोटोको लिंक http:// वा https:// बाट सुरु हुनुपर्छ।' };
  const imageData = body?.imageData ? String(body.imageData) : '';
  if (imageData && (!IMG_RE.test(imageData) || imageData.length > MAX_IMG)) {
    return { error: 'फोटो मान्य छैन वा धेरै ठूलो छ।' };
  }
  return {
    data: { title: t.title, content: t.content, category: t.category, imageUrl, imageData, removeImage: Boolean(body?.removeImage) },
  };
}

// Edited text sent by the admin when approving a submission -> { error } or { data }
export function validateText(body) {
  const t = checkText(body, 20000);
  if (t.error) return t;
  return { data: { title: t.title, content: t.content, category: t.category } };
}

// Public submission form -> { error } or { data }
export function validateSubmission(body) {
  const t = checkText(body, 5000);
  if (t.error) return t;
  const name = String(body?.name || '').trim();
  if (name.length < 2 || name.length > 80) return { error: 'कृपया आफ्नो नाम लेख्नुहोस्।' };
  const contact = String(body?.contact || '').trim().slice(0, 120);
  const imageData = body?.imageData ? String(body.imageData) : '';
  if (imageData && (!IMG_RE.test(imageData) || imageData.length > MAX_IMG)) {
    return { error: 'फोटो मान्य छैन वा धेरै ठूलो छ।' };
  }
  const category = PUBLIC_CATEGORIES.includes(t.category) ? t.category : PUBLIC_CATEGORIES[0];
  return {
    data: {
      name,
      contact,
      title: t.title,
      content: t.content,
      category,
      imageData,
      showName: body?.showName !== false,
    },
  };
}

// Works out the final `image` field and stores/removes uploaded image data.
export async function applyImage(id, input, previous) {
  if (input.imageData) {
    await saveImage(id, input.imageData);
    return `/api/image/${id}?v=${Date.now()}`;
  }
  if (input.imageUrl) {
    if (previous?.image?.startsWith('/api/image/')) await removeImage(id);
    return input.imageUrl;
  }
  if (input.removeImage) {
    if (previous?.image?.startsWith('/api/image/')) await removeImage(id);
    return '';
  }
  return previous?.image || '';
}
