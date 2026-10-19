import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { saveMedia } from '@/lib/mediaStore';
import { handleApiError, UnauthorizedError, ValidationError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminSession();
    if (!isAuthorized) {
      throw new UnauthorizedError('Unauthorized admin session');
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      throw new ValidationError('A valid image file must be provided in the "file" field.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const originalFilename = file instanceof File ? file.name : 'upload.jpg';

    const result = await saveMedia(buffer, originalFilename);

    return NextResponse.json({
      success: true,
      media: result,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
