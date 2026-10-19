import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminSession } from '@/lib/auth';
import {
  getAquariums,
  createAquarium,
  updateAquarium,
  deleteAquarium,
} from '@/lib/catalogService';
import { validateAquariumInput } from '@/lib/validations';
import { handleApiError, UnauthorizedError, ValidationError, NotFoundError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/aquariums
 */
export async function GET() {
  try {
    const isAuthorized = await verifyAdminSession();
    if (!isAuthorized) {
      throw new UnauthorizedError('Unauthorized');
    }

    const aquariums = await getAquariums();
    return NextResponse.json({ aquariums });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/admin/aquariums
 * Create a new handcrafted aquarium card
 */
export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminSession();
    if (!isAuthorized) {
      throw new UnauthorizedError('Unauthorized');
    }

    const body = await req.json();
    const validated = validateAquariumInput(body);

    const created = await createAquarium({
      ...validated,
      imageUrl:
        validated.imageUrl ||
        'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=900&q=80',
    });

    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({ success: true, aquarium: created }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * PUT /api/admin/aquariums
 * Update an existing aquarium card or toggle stock
 */
export async function PUT(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminSession();
    if (!isAuthorized) {
      throw new UnauthorizedError('Unauthorized');
    }

    const data = await req.json();
    if (!data.id) {
      throw new ValidationError('Aquarium ID is required');
    }

    const updated = await updateAquarium(data.id, data);
    if (!updated) {
      throw new NotFoundError('Aquarium card not found');
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({ success: true, aquarium: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/admin/aquariums
 * Cascade delete an aquarium card everywhere
 */
export async function DELETE(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminSession();
    if (!isAuthorized) {
      throw new UnauthorizedError('Unauthorized');
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new ValidationError('Aquarium ID is required');
    }

    const deleted = await deleteAquarium(id);

    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({
      success: true,
      deleted,
      message: 'Card permanently purged from catalog and storage.',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
