import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { getMediaPath } from '@/lib/mediaStore';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { mediaId: string } }
) {
  try {
    const mediaId = params.mediaId;
    if (!mediaId) {
      return new NextResponse('Media ID is required', { status: 400 });
    }

    const media = getMediaPath(mediaId);
    if (!media) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(media.filePath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': media.mimeType,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err) {
    console.error('[Media Stream Error]:', err);
    return new NextResponse('Error loading image', { status: 500 });
  }
}
