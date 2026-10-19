import { NextResponse } from 'next/server';
import {
  getPlants,
  getAquariums,
  getPlantCategories,
  getAquariumCategories,
  getStoreSettings,
} from '@/lib/catalogService';
import {
  MOCK_PLANTS,
  MOCK_AQUARIUMS,
  STORE_INFO,
  PLANT_CATEGORIES,
  AQUARIUM_CATEGORIES,
} from '@/data/mockCatalog';

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
      getPlants().catch(() => MOCK_PLANTS),
      getAquariums().catch(() => MOCK_AQUARIUMS),
      getPlantCategories().catch(() => PLANT_CATEGORIES),
      getAquariumCategories().catch(() => AQUARIUM_CATEGORIES),
      getStoreSettings().catch(() => STORE_INFO),
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
  } catch {
    return NextResponse.json(
      {
        plants: MOCK_PLANTS,
        aquariums: MOCK_AQUARIUMS,
        plantCategories: PLANT_CATEGORIES,
        aquaCategories: AQUARIUM_CATEGORIES,
        storeInfo: STORE_INFO,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  }
}
