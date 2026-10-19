import CatalogClient from '@/components/CatalogClient';
import {
  getPlants,
  getAquariums,
  getPlantCategories,
  getAquariumCategories,
  getStoreSettings,
} from '@/lib/catalogService';

// Real-time dynamic rendering so newly added cards (plants & aquariums) appear instantly
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CatalogHomePage() {
  const [plants, aquariums, plantCategories, aquaCategories, storeInfo] = await Promise.all([
    getPlants(),
    getAquariums(),
    getPlantCategories(),
    getAquariumCategories(),
    getStoreSettings(),
  ]);

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
