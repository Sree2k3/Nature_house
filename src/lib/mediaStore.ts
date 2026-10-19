import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { query } from './db';
import { MediaError } from './errors';

// Configuration
export const MEDIA_DIR = process.env.NATURE_HOUSE_MEDIA_DIR
  ? path.resolve(process.cwd(), process.env.NATURE_HOUSE_MEDIA_DIR)
  : path.resolve(process.cwd(), 'var/media');

// Ensure directory exists
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

export interface StoredMedia {
  id: string;
  storageKey: string;
  url: string;
  mimeType: string;
  byteSize: number;
  width?: number;
  height?: number;
  checksum: string;
}

/**
 * Validates magic numbers to verify actual image content.
 */
export function detectMimeType(buffer: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' {
  if (buffer.length < 12) {
    throw new MediaError('Image file is corrupted or too small to inspect.');
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WebP: RIFF ... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  throw new MediaError('Unsupported image format. Only JPEG, PNG, and WebP are allowed. SVGs and executables are rejected.');
}

/**
 * Saves binary image buffer atomically to local MediaStore.
 */
export async function saveMedia(buffer: Buffer, originalFilename: string): Promise<StoredMedia> {
  const MAX_BYTES = 12 * 1024 * 1024; // 12 MB max
  if (buffer.length > MAX_BYTES) {
    throw new MediaError(`Image exceeds maximum allowed size of 12MB (received ${(buffer.length / 1024 / 1024).toFixed(1)}MB).`);
  }

  const mimeType = detectMimeType(buffer);
  const ext = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/png' ? 'png' : 'webp';

  const mediaId = crypto.randomUUID();
  const storageKey = `${mediaId}.${ext}`;
  const finalPath = path.join(MEDIA_DIR, storageKey);
  const tempPath = path.join(MEDIA_DIR, `${mediaId}.tmp`);

  const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

  // Atomic write via temporary file
  try {
    fs.writeFileSync(tempPath, buffer);
    fs.renameSync(tempPath, finalPath);
  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    throw new MediaError(`Failed to write media file to disk: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Persist metadata to PostgreSQL media_assets if DB is configured
  try {
    await query(
      `
      INSERT INTO public.media_assets (id, storage_key, file_name, mime_type, byte_size, checksum)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
      [mediaId, storageKey, originalFilename || storageKey, mimeType, buffer.length, checksum]
    );
  } catch (err) {
    // If DB fails, remove written file to prevent orphaned disk leaks
    if (fs.existsSync(finalPath)) {
      try {
        fs.unlinkSync(finalPath);
      } catch (cleanupErr) {
        console.error('[MediaStore] Cleanup failed after DB error:', cleanupErr);
      }
    }
    throw new MediaError(`Failed to register media asset in database: ${err instanceof Error ? err.message : String(err)}`);
  }

  return {
    id: mediaId,
    storageKey,
    url: `/media/${mediaId}`,
    mimeType,
    byteSize: buffer.length,
    checksum,
  };
}

/**
 * Resolves absolute path to a media file with path traversal defense.
 */
export function getMediaPath(mediaId: string): { filePath: string; mimeType: string } | null {
  if (!mediaId || typeof mediaId !== 'string') return null;

  // Clean mediaId to only alphanumeric and hyphen
  const cleanId = mediaId.replace(/[^a-zA-Z0-9-]/g, '');
  if (!cleanId) return null;

  for (const ext of ['jpg', 'png', 'webp', 'jpeg']) {
    const candidate = path.join(MEDIA_DIR, `${cleanId}.${ext}`);
    // Path traversal defense
    const resolved = path.resolve(candidate);
    if (!resolved.startsWith(MEDIA_DIR)) {
      throw new MediaError('Security violation: Attempted path traversal.');
    }

    if (fs.existsSync(resolved)) {
      const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : 'image/webp';
      return { filePath: resolved, mimeType };
    }
  }

  return null;
}

/**
 * Enqueue a media asset for durable deletion.
 */
export async function enqueueMediaCleanup(storageKey: string, mediaId?: string): Promise<void> {
  if (!storageKey) return;

  try {
    await query(
      `
      INSERT INTO public.media_cleanup_queue (media_id, storage_key, status)
      VALUES ($1, $2, 'pending')
    `,
      [mediaId || null, storageKey]
    );
  } catch (err) {
    console.warn('[MediaStore] Could not enqueue media cleanup into DB:', err);
  }

  // Attempt immediate deletion
  const cleanKey = path.basename(storageKey);
  const filePath = path.join(MEDIA_DIR, cleanKey);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      // Mark as completed in DB if possible
      await query(
        `UPDATE public.media_cleanup_queue SET status = 'completed', processed_at = NOW() WHERE storage_key = $1`,
        [storageKey]
      ).catch(() => {});
    } catch (err) {
      console.warn('[MediaStore] Immediate deletion failed, queued for retry:', err);
    }
  }
}
