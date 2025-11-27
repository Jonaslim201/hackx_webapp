import { buildCaseObjectKey, getObjectBuffer, putObjectBuffer } from './s3';

const DATA_URL_REGEX = /^data:(.+);base64,(.*)$/;

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MIME_BY_EXTENSION: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

export async function saveMarkerImageFromDataUrl(caseId: string, markerId: string, dataUrl: string): Promise<string | null> {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return null;
  const filename = `markers/${sanitizeId(markerId)}-${Date.now()}.${parsed.extension}`;
  const key = buildCaseObjectKey(caseId, filename);
  await putObjectBuffer(key, parsed.buffer, parsed.contentType);
  return key;
}

export async function getMarkerImageDataUrl(imageKey: string): Promise<string | null> {
  if (!imageKey) return null;
  try {
    const buffer = await getObjectBuffer(imageKey);
    const mime = mimeFromKey(imageKey);
    return `data:${mime};base64,${buffer.toString('base64')}`;
  } catch (err) {
    console.warn('Failed to read marker image', imageKey, err);
    return null;
  }
}

export async function attachMarkerImageUrls<T extends { imageKey?: string | null }>(items: T[]): Promise<Array<T & { imageUrl: string | null }>> {
  const cache = new Map<string, Promise<string | null>>();
  return Promise.all(
    items.map(async (item) => {
      const key = typeof item.imageKey === 'string' ? item.imageKey.trim() : '';
      if (!key) {
        return { ...item, imageUrl: null };
      }
      if (!cache.has(key)) {
        cache.set(key, getMarkerImageDataUrl(key));
      }
      const imageUrl = await cache.get(key)!;
      return { ...item, imageUrl: imageUrl ?? null };
    })
  );
}

function parseDataUrl(dataUrl: string) {
  if (typeof dataUrl !== 'string') return null;
  const match = dataUrl.match(DATA_URL_REGEX);
  if (!match) return null;
  const [, mime, base64] = match;
  if (!mime || !base64) return null;
  const extension = EXTENSION_BY_MIME[mime.toLowerCase()] ?? 'png';
  try {
    const buffer = Buffer.from(base64, 'base64');
    return { buffer, contentType: mime, extension };
  } catch {
    return null;
  }
}

function mimeFromKey(key: string) {
  const lower = key.toLowerCase();
  const ext = lower.split('.').pop();
  if (ext && MIME_BY_EXTENSION[ext]) {
    return MIME_BY_EXTENSION[ext];
  }
  return 'image/png';
}

function sanitizeId(id: string) {
  return id.replace(/[^a-z0-9_-]/gi, '').slice(0, 48) || 'marker';
}
