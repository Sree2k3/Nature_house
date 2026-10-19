import { NextResponse } from 'next/server';
import {
  getPlants,
  getAquariums,
  getPlantCategories,
  getAquariumCategories,
  getStoreSettings,
} from '@/lib/catalogService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Public real-time catalog API.
 * Ensures that whenever new cards (plants or aquariums) are added or updated in /admin,
 * clients can instantaneously fetch the freshest persisted catalog data.
 */
export async function GET() {
  try {
    const [plants, aquariums, plantCategories, aquaCategories, storeInfo] = await Promise.all([
      getPlants(),
      getAquariums(),
      getPlantCategories(),
      getAquariumCategories(),
      getStoreSettings(),
    ]);

    return NextResponse.json(
      {
        plants,
        aquariums,
        plantCategories,
        aquaCategories,
        storeInfo,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch catalog' },
      { status: 500 }
    );
  }
}
