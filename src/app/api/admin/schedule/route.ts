import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminSession } from '@/lib/auth';
import {
  loadSchedule,
  addNotice,
  updateNotice,
  deleteNotice,
  updateStudioBroadcast,
  get6YearsRange,
} from '@/lib/scheduleService';
import { validateScheduleNoticeInput } from '@/lib/validations';
import { handleApiError, UnauthorizedError, ValidationError, NotFoundError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/schedule
 */
export async function GET() {
  try {
    const isAuthorized = await verifyAdminSession();
    if (!isAuthorized) {
      throw new UnauthorizedError('Unauthorized');
    }

    const schedule = loadSchedule();
    return NextResponse.json({
      schedule,
      availableYears: get6YearsRange(),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/admin/schedule
 * Manually add, update, delete holiday notices or update store-is-closed broadcast
 */
export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminSession();
    if (!isAuthorized) {
      throw new UnauthorizedError('Unauthorized');
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'add_notice') {
      const validated = validateScheduleNoticeInput(body);

      const formattedPeriod =
        validated.startDate !== validated.endDate
          ? `${validated.startDate} to ${validated.endDate}`
          : validated.startDate;

      const created = addNotice({
        title: validated.title,
        dateOrPeriod: formattedPeriod,
        startDate: validated.startDate,
        endDate: validated.endDate,
        status: validated.status,
        hours: validated.hours || (validated.status === 'Closed' ? 'Closed for Walk-ins' : 'Special Hours'),
        details: validated.details || `${validated.title} closure notice.`,
        type: 'holiday',
        reopenMessage: validated.reopenMessage,
      });

      try {
        revalidatePath('/');
        revalidatePath('/admin');
      } catch {}

      return NextResponse.json({ success: true, notice: created });
    }

    if (action === 'update_notice') {
      const { id } = body;
      if (!id) {
        throw new ValidationError('Notice ID is required');
      }

      const updated = updateNotice(id, body);
      if (!updated) {
        throw new NotFoundError('Notice not found');
      }

      try {
        revalidatePath('/');
        revalidatePath('/admin');
      } catch {}

      return NextResponse.json({ success: true, notice: updated });
    }

    if (action === 'delete_notice') {
      const { id } = body;
      if (!id) {
        throw new ValidationError('Notice ID is required');
      }

      const deleted = deleteNotice(id);
      try {
        revalidatePath('/');
        revalidatePath('/admin');
      } catch {}

      return NextResponse.json({ success: deleted });
    }

    if (action === 'update_broadcast') {
      const { headline, message, availabilityStatus, isEmergencyClosed, emergencyClosedMessage } = body;
      const updatedBroadcast = updateStudioBroadcast({
        headline,
        message,
        availabilityStatus,
        isEmergencyClosed,
        emergencyClosedMessage,
      });

      try {
        revalidatePath('/');
        revalidatePath('/admin');
      } catch {}

      return NextResponse.json({ success: true, broadcast: updatedBroadcast });
    }

    throw new ValidationError('Unknown action specified');
  } catch (err) {
    return handleApiError(err);
  }
}
