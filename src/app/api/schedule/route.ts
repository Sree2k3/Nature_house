import { NextResponse } from 'next/server';
import { loadSchedule, get6YearsRange, getMonthCalendarForYearAndMonth } from '@/lib/scheduleService';
import { getStoreStatus } from '@/lib/storeHours';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/schedule
 * Public real-time endpoint for holiday schedule, broadcast notices, and 6-year calendar
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const yearParam = url.searchParams.get('year');
    const monthParam = url.searchParams.get('month');

    const availableYears = get6YearsRange();
    let year = new Date().getFullYear();
    let month = new Date().getMonth();

    if (yearParam !== null) {
      const parsedYear = Number(yearParam);
      if (!Number.isInteger(parsedYear) || parsedYear < 2020 || parsedYear > 2040) {
        return NextResponse.json(
          { error: 'Invalid year parameter. Must be an integer between 2020 and 2040.' },
          { status: 400 }
        );
      }
      year = parsedYear;
    }

    if (monthParam !== null) {
      const parsedMonth = Number(monthParam);
      if (!Number.isInteger(parsedMonth) || parsedMonth < 0 || parsedMonth > 11) {
        return NextResponse.json(
          { error: 'Invalid month parameter. Must be an integer between 0 (January) and 11 (December).' },
          { status: 400 }
        );
      }
      month = parsedMonth;
    }

    const schedule = loadSchedule();
    const calendar = getMonthCalendarForYearAndMonth(year, month);
    const storeStatus = getStoreStatus(schedule.notices, schedule.studioNotice);

    return NextResponse.json(
      {
        notices: schedule.notices,
        studioNotice: schedule.studioNotice,
        availableYears,
        calendar,
        storeStatus,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err) {
    console.error('[Public Schedule Error]:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve studio schedule.' },
      { status: 500 }
    );
  }
}
