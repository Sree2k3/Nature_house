import CatalogClient from '@/components/CatalogClient';
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

// Real-time dynamic rendering so newly added cards (plants & aquariums) appear instantly
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CatalogHomePage() {
  let plants = MOCK_PLANTS;
  let aquariums = MOCK_AQUARIUMS;
  let plantCategories = PLANT_CATEGORIES;
  let aquaCategories = AQUARIUM_CATEGORIES;
  let storeInfo = STORE_INFO;

  try {
    const results = await Promise.allSettled([
      getPlants(),
      getAquariums(),
      getPlantCategories(),
      getAquariumCategories(),
      getStoreSettings(),
    ]);

    if (results[0].status === 'fulfilled') plants = results[0].value;
    if (results[1].status === 'fulfilled') aquariums = results[1].value;
    if (results[2].status === 'fulfilled') plantCategories = results[2].value;
    if (results[3].status === 'fulfilled') aquaCategories = results[3].value;
    if (results[4].status === 'fulfilled') storeInfo = results[4].value;
  } catch (err) {
    console.warn('[CatalogHomePage] Fallback engaged:', err);
  }

  return (
    <CatalogClient
      initialPlants={plants}
      initialAquariums={aquariums}
      plantCategories={plantCategories}
      aquaCategories={aquaCategories}
      storeInfo={storeInfo}
    />
  );
}
