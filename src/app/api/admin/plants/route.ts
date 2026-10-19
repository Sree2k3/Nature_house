import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminSession } from '@/lib/auth';
import {
  getPlants,
  createPlant,
  updatePlant,
  deletePlant,
} from '@/lib/catalogService';
import { validatePlantInput } from '@/lib/validations';
import { handleApiError, UnauthorizedError, ValidationError, NotFoundError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/plants
 */
export async function GET() {
  try {
    const isAuthorized = await verifyAdminSession();
    if (!isAuthorized) {
      throw new UnauthorizedError('Unauthorized');
    }

    const plants = await getPlants();
    return NextResponse.json({ plants });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/admin/plants
 * Create a new plant card
 */
export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminSession();
    if (!isAuthorized) {
      throw new UnauthorizedError('Unauthorized');
    }

    const body = await req.json();
    const validated = validatePlantInput(body);

    const created = await createPlant({
      ...validated,
      imageUrl:
        validated.imageUrl ||
        'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80',
    });

    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({ success: true, plant: created }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * PUT /api/admin/plants
 * Update an existing plant card or toggle stock
 */
export async function PUT(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminSession();
    if (!isAuthorized) {
      throw new UnauthorizedError('Unauthorized');
    }

    const data = await req.json();
    if (!data.id) {
      throw new ValidationError('Plant ID is required');
    }

    const updated = await updatePlant(data.id, data);
    if (!updated) {
      throw new NotFoundError('Plant card not found');
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({ success: true, plant: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/admin/plants
 * Cascade delete a plant card everywhere
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
      throw new ValidationError('Plant ID is required');
    }

    const deleted = await deletePlant(id);

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
