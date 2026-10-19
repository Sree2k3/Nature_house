import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { query } from './db';
import { enqueueMediaCleanup } from './mediaStore';
import { PlantItem, AquariumItem, StoreInfo } from '@/types/catalog';
import {
  MOCK_PLANTS,
  MOCK_AQUARIUMS,
  STORE_INFO,
  PLANT_CATEGORIES,
  AQUARIUM_CATEGORIES,
} from '@/data/mockCatalog';

function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

interface DbPlantRow {
  id: string;
  category_name?: string;
  title: string;
  botanical_name?: string;
  description?: string;
  price: string | number;
  image_url: string;
  light_requirement: string;
  water_frequency: string;
  pot_size: string;
  difficulty_level: string;
  badge?: string;
  is_in_stock: boolean;
  is_featured: boolean;
}

interface DbAquariumRow {
  id: string;
  category_name?: string;
  title: string;
  glass_type: string;
  glass_thickness_mm: string | number;
  dimensions_cm: string;
  volume_liters: string | number;
  description?: string;
  price: string | number;
  image_url: string;
  style: string;
  includes_cabinet: boolean;
  badge?: string;
  is_in_stock: boolean;
  is_featured: boolean;
}

// Persistent disk file for catalog state across hot reloads and offline instances
const RUNTIME_CATALOG_FILE = path.join(process.cwd(), 'src/data/runtimeCatalog.json');

let cachedDiskCatalog: { plants: PlantItem[]; aquariums: AquariumItem[] } | null = null;

function loadPersistedCatalog(): { plants: PlantItem[]; aquariums: AquariumItem[] } | null {
  try {
    if (fs.existsSync(RUNTIME_CATALOG_FILE)) {
      const content = fs.readFileSync(RUNTIME_CATALOG_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.plants) && Array.isArray(parsed.aquariums)) {
        cachedDiskCatalog = parsed;
        return parsed;
      }
    }
  } catch {
    // Ignore fallback
  }
  return cachedDiskCatalog;
}

function persistCatalog(plants: PlantItem[], aquariums: AquariumItem[]) {
  cachedDiskCatalog = { plants, aquariums };

  try {
    const dir = path.dirname(RUNTIME_CATALOG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      RUNTIME_CATALOG_FILE,
      JSON.stringify({ plants, aquariums }, null, 2),
      'utf8'
    );
  } catch (err) {
    console.warn('[CatalogService] Could not persist catalog to disk:', err);
  }
}

// In-memory runtime store shared across hot reloads / offline instances
// Declared on globalThis so Next.js dev server preserves additions/edits across module reloads
const globalStore = globalThis as unknown as {
  __natureHousePlants?: PlantItem[];
  __natureHouseAquariums?: AquariumItem[];
};

const persistedInitial = loadPersistedCatalog();

if (!globalStore.__natureHousePlants) {
  globalStore.__natureHousePlants = persistedInitial?.plants || [...MOCK_PLANTS];
}

if (!globalStore.__natureHouseAquariums) {
  globalStore.__natureHouseAquariums = persistedInitial?.aquariums || [...MOCK_AQUARIUMS];
}

/**
 * Fetch all plants with instant disk sync and DB fallback.
 */
export async function getPlants(): Promise<PlantItem[]> {
  // 1. Prioritize persisted runtime catalog (ensures manual updates and admin edits reflect immediately)
  const disk = loadPersistedCatalog();
  if (disk?.plants && disk.plants.length > 0) {
    globalStore.__natureHousePlants = disk.plants;
    return disk.plants;
  }

  let dbPlants: PlantItem[] = [];
  try {
    const res = await query<DbPlantRow>(`
      SELECT 
        p.id,
        c.name as category_name,
        p.title,
        p.botanical_name,
        p.description,
        p.price,
        p.image_url,
        p.light_requirement,
        p.water_frequency,
        p.pot_size,
        p.difficulty_level,
        p.badge,
        p.is_in_stock,
        p.is_featured
      FROM public.plants p
      LEFT JOIN public.categories c ON p.category_id = c.id
      ORDER BY p.sort_order ASC, p.created_at DESC
    `);

    if (res && res.rows && res.rows.length > 0) {
      dbPlants = res.rows.map((row) => ({
        id: row.id,
        category: row.category_name || 'Indoor Foliage',
        title: row.title,
        botanicalName: row.botanical_name || '',
        description: row.description || '',
        price: Number(row.price),
        imageUrl: row.image_url,
        lightRequirement: row.light_requirement,
        waterFrequency: row.water_frequency,
        potSize: row.pot_size,
        difficultyLevel: (row.difficulty_level as 'Beginner' | 'Moderate' | 'Expert') || 'Beginner',
        badge: row.badge || undefined,
        isInStock: row.is_in_stock,
        isFeatured: row.is_featured,
      }));
    }
  } catch {
    // Database connection absent or idle; fallback to memory/disk store
  }

  if (dbPlants.length > 0) {
    globalStore.__natureHousePlants = dbPlants;
    return dbPlants;
  }

  return globalStore.__natureHousePlants || MOCK_PLANTS;
}

/**
 * Fetch single plant by ID
 */
export async function getPlantById(id: string): Promise<PlantItem | null> {
  const plants = await getPlants();
  return plants.find((p) => p.id === id) || null;
}

/**
 * Create a new plant card
 */
export async function createPlant(
  data: Omit<PlantItem, 'id'> & { id?: string }
): Promise<PlantItem> {
  const newId = (data.id && isValidUuid(data.id)) ? data.id : crypto.randomUUID();
  const newPlant: PlantItem = {
    ...data,
    id: newId,
  };

  try {
    await query(
      `
      INSERT INTO public.plants (
        id, category_id, title, botanical_name, description, price, image_url,
        light_requirement, water_frequency, pot_size, difficulty_level,
        badge, is_in_stock, is_featured
      ) VALUES (
        $1,
        (SELECT id FROM public.categories WHERE LOWER(name) = LOWER($2) AND type = 'plant' LIMIT 1),
        $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
    `,
      [
        newId,
        newPlant.category || 'Indoor Foliage',
        newPlant.title,
        newPlant.botanicalName || '',
        newPlant.description || '',
        newPlant.price,
        newPlant.imageUrl,
        newPlant.lightRequirement || 'Bright Indirect',
        newPlant.waterFrequency || '1-2x Weekly',
        newPlant.potSize || '6-inch Pot',
        newPlant.difficultyLevel || 'Beginner',
        newPlant.badge || null,
        newPlant.isInStock ?? true,
        newPlant.isFeatured || false,
      ]
    );
  } catch (err) {
    console.warn('[CatalogService] Could not insert plant into PostgreSQL:', err);
  }

  // Always update in-memory runtime store & disk persistence
  if (!globalStore.__natureHousePlants) {
    globalStore.__natureHousePlants = [...MOCK_PLANTS];
  }
  globalStore.__natureHousePlants = [newPlant, ...globalStore.__natureHousePlants.filter((p) => p.id !== newId)];
  persistCatalog(
    globalStore.__natureHousePlants,
    globalStore.__natureHouseAquariums || MOCK_AQUARIUMS
  );

  return newPlant;
}

/**
 * Update an existing plant card
 */
export async function updatePlant(
  id: string,
  data: Partial<PlantItem>
): Promise<PlantItem | null> {
  if (isValidUuid(id)) {
    try {
      await query(
        `
        UPDATE public.plants
        SET 
          category_id = COALESCE((SELECT id FROM public.categories WHERE LOWER(name) = LOWER($2) AND type = 'plant' LIMIT 1), category_id),
          title = COALESCE($3, title),
          botanical_name = COALESCE($4, botanical_name),
          description = COALESCE($5, description),
          price = COALESCE($6, price),
          image_url = COALESCE($7, image_url),
          light_requirement = COALESCE($8, light_requirement),
          water_frequency = COALESCE($9, water_frequency),
          pot_size = COALESCE($10, pot_size),
          difficulty_level = COALESCE($11, difficulty_level),
          badge = $12,
          is_in_stock = COALESCE($13, is_in_stock),
          is_featured = COALESCE($14, is_featured),
          updated_at = NOW()
        WHERE id = $1
      `,
        [
          id,
          data.category || null,
          data.title,
          data.botanicalName,
          data.description,
          data.price,
          data.imageUrl,
          data.lightRequirement,
          data.waterFrequency,
          data.potSize,
          data.difficultyLevel,
          data.badge !== undefined ? data.badge : null,
          data.isInStock,
          data.isFeatured,
        ]
      );
    } catch {
      // Database fallback
    }
  }

  if (globalStore.__natureHousePlants) {
    const idx = globalStore.__natureHousePlants.findIndex((p) => p.id === id);
    if (idx !== -1) {
      globalStore.__natureHousePlants[idx] = {
        ...globalStore.__natureHousePlants[idx],
        ...data,
      };
      persistCatalog(
        globalStore.__natureHousePlants,
        globalStore.__natureHouseAquariums || MOCK_AQUARIUMS
      );
      return globalStore.__natureHousePlants[idx];
    }
  }

  return null;
}

/**
 * Delete a plant card ("Deleted everywhere" cascade purge)
 */
export async function deletePlant(id: string): Promise<boolean> {
  if (isValidUuid(id)) {
    try {
      const existing = await query<{ image_url: string; storage_path: string }>(
        'SELECT image_url, storage_path FROM public.plants WHERE id = $1',
        [id]
      );
      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        const key = row.storage_path || (row.image_url?.startsWith('/media/') ? row.image_url.replace('/media/', '') : '');
        await query('DELETE FROM public.plants WHERE id = $1', [id]);
        if (key) {
          await enqueueMediaCleanup(key).catch(() => {});
        }
      } else {
        await query('DELETE FROM public.plants WHERE id = $1', [id]);
      }
    } catch (err) {
      console.warn('[CatalogService] Could not delete plant from PostgreSQL:', err);
    }
  }

  if (globalStore.__natureHousePlants) {
    const beforeCount = globalStore.__natureHousePlants.length;
    globalStore.__natureHousePlants = globalStore.__natureHousePlants.filter((p) => p.id !== id);
    persistCatalog(
      globalStore.__natureHousePlants,
      globalStore.__natureHouseAquariums || MOCK_AQUARIUMS
    );
    return globalStore.__natureHousePlants.length < beforeCount;
  }

  return true;
}

/**
 * Fetch all handcrafted aquariums with instant disk sync and DB fallback.
 */
export async function getAquariums(): Promise<AquariumItem[]> {
  // 1. Prioritize persisted runtime catalog (ensures manual updates and admin edits reflect immediately)
  const disk = loadPersistedCatalog();
  if (disk?.aquariums && disk.aquariums.length > 0) {
    globalStore.__natureHouseAquariums = disk.aquariums;
    return disk.aquariums;
  }

  let dbAquariums: AquariumItem[] = [];
  try {
    const res = await query<DbAquariumRow>(`
      SELECT 
        a.id,
        c.name as category_name,
        a.title,
        a.glass_type,
        a.glass_thickness_mm,
        a.dimensions_cm,
        a.volume_liters,
        a.description,
        a.price,
        a.image_url,
        a.style,
        a.includes_cabinet,
        a.badge,
        a.is_in_stock,
        a.is_featured
      FROM public.aquariums a
      LEFT JOIN public.categories c ON a.category_id = c.id
      ORDER BY a.sort_order ASC, a.created_at DESC
    `);

    if (res && res.rows && res.rows.length > 0) {
      dbAquariums = res.rows.map((row) => ({
        id: row.id,
        category: row.category_name || 'Rimless Ultra-Clear',
        title: row.title,
        glassType: row.glass_type,
        glassThicknessMm: Number(row.glass_thickness_mm),
        dimensionsCm: row.dimensions_cm,
        volumeLiters: Number(row.volume_liters),
        description: row.description || '',
        price: Number(row.price),
        imageUrl: row.image_url,
        style: row.style,
        includesCabinet: row.includes_cabinet,
        badge: row.badge || undefined,
        isInStock: row.is_in_stock,
        isFeatured: row.is_featured,
      }));
    }
  } catch {
    // Database connection absent or idle; fallback to memory/disk store
  }

  if (dbAquariums.length > 0) {
    globalStore.__natureHouseAquariums = dbAquariums;
    return dbAquariums;
  }

  return globalStore.__natureHouseAquariums || MOCK_AQUARIUMS;
}

/**
 * Fetch single aquarium by ID
 */
export async function getAquariumById(id: string): Promise<AquariumItem | null> {
  const aquas = await getAquariums();
  return aquas.find((a) => a.id === id) || null;
}

/**
 * Create a new aquarium card
 */
export async function createAquarium(
  data: Omit<AquariumItem, 'id'> & { id?: string }
): Promise<AquariumItem> {
  const newId = (data.id && isValidUuid(data.id)) ? data.id : crypto.randomUUID();
  const newAquarium: AquariumItem = {
    ...data,
    id: newId,
  };

  try {
    await query(
      `
      INSERT INTO public.aquariums (
        id, category_id, title, glass_type, glass_thickness_mm, dimensions_cm,
        volume_liters, description, price, image_url, style,
        includes_cabinet, badge, is_in_stock, is_featured
      ) VALUES (
        $1,
        (SELECT id FROM public.categories WHERE LOWER(name) = LOWER($2) AND type = 'aquarium' LIMIT 1),
        $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      )
    `,
      [
        newId,
        newAquarium.category || 'Rimless Ultra-Clear',
        newAquarium.title,
        newAquarium.glassType || 'Opti-White Ultra-Clear',
        newAquarium.glassThicknessMm || 10,
        newAquarium.dimensionsCm || '60 x 30 x 36 cm',
        newAquarium.volumeLiters || 64,
        newAquarium.description || '',
        newAquarium.price,
        newAquarium.imageUrl,
        newAquarium.style || 'Rimless Nature Aquarium',
        newAquarium.includesCabinet ?? false,
        newAquarium.badge || null,
        newAquarium.isInStock ?? true,
        newAquarium.isFeatured || false,
      ]
    );
  } catch (err) {
    console.warn('[CatalogService] Could not insert aquarium into PostgreSQL:', err);
  }

  // Always update in-memory runtime store & disk persistence
  if (!globalStore.__natureHouseAquariums) {
    globalStore.__natureHouseAquariums = [...MOCK_AQUARIUMS];
  }
  globalStore.__natureHouseAquariums = [newAquarium, ...globalStore.__natureHouseAquariums.filter((a) => a.id !== newId)];
  persistCatalog(
    globalStore.__natureHousePlants || MOCK_PLANTS,
    globalStore.__natureHouseAquariums
  );

  return newAquarium;
}

/**
 * Update an existing aquarium card
 */
export async function updateAquarium(
  id: string,
  data: Partial<AquariumItem>
): Promise<AquariumItem | null> {
  if (isValidUuid(id)) {
    try {
      await query(
        `
        UPDATE public.aquariums
        SET 
          category_id = COALESCE((SELECT id FROM public.categories WHERE LOWER(name) = LOWER($2) AND type = 'aquarium' LIMIT 1), category_id),
          title = COALESCE($3, title),
          glass_type = COALESCE($4, glass_type),
          glass_thickness_mm = COALESCE($5, glass_thickness_mm),
          dimensions_cm = COALESCE($6, dimensions_cm),
          volume_liters = COALESCE($7, volume_liters),
          description = COALESCE($8, description),
          price = COALESCE($9, price),
          image_url = COALESCE($10, image_url),
          style = COALESCE($11, style),
          includes_cabinet = COALESCE($12, includes_cabinet),
          badge = $13,
          is_in_stock = COALESCE($14, is_in_stock),
          is_featured = COALESCE($15, is_featured),
          updated_at = NOW()
        WHERE id = $1
      `,
        [
          id,
          data.category || null,
          data.title,
          data.glassType,
          data.glassThicknessMm,
          data.dimensionsCm,
          data.volumeLiters,
          data.description,
          data.price,
          data.imageUrl,
          data.style,
          data.includesCabinet,
          data.badge !== undefined ? data.badge : null,
          data.isInStock,
          data.isFeatured,
        ]
      );
    } catch {
      // Database fallback
    }
  }

  if (globalStore.__natureHouseAquariums) {
    const idx = globalStore.__natureHouseAquariums.findIndex((a) => a.id === id);
    if (idx !== -1) {
      globalStore.__natureHouseAquariums[idx] = {
        ...globalStore.__natureHouseAquariums[idx],
        ...data,
      };
      persistCatalog(
        globalStore.__natureHousePlants || MOCK_PLANTS,
        globalStore.__natureHouseAquariums
      );
      return globalStore.__natureHouseAquariums[idx];
    }
  }

  return null;
}

/**
 * Delete an aquarium card ("Deleted everywhere" cascade purge)
 */
export async function deleteAquarium(id: string): Promise<boolean> {
  if (isValidUuid(id)) {
    try {
      const existing = await query<{ image_url: string; storage_path: string }>(
        'SELECT image_url, storage_path FROM public.aquariums WHERE id = $1',
        [id]
      );
      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        const key = row.storage_path || (row.image_url?.startsWith('/media/') ? row.image_url.replace('/media/', '') : '');
        await query('DELETE FROM public.aquariums WHERE id = $1', [id]);
        if (key) {
          await enqueueMediaCleanup(key).catch(() => {});
        }
      } else {
        await query('DELETE FROM public.aquariums WHERE id = $1', [id]);
      }
    } catch (err) {
      console.warn('[CatalogService] Could not delete aquarium from PostgreSQL:', err);
    }
  }

  if (globalStore.__natureHouseAquariums) {
    const beforeCount = globalStore.__natureHouseAquariums.length;
    globalStore.__natureHouseAquariums = globalStore.__natureHouseAquariums.filter((a) => a.id !== id);
    persistCatalog(
      globalStore.__natureHousePlants || MOCK_PLANTS,
      globalStore.__natureHouseAquariums
    );
    return globalStore.__natureHouseAquariums.length < beforeCount;
  }

  return true;
}

/**
 * Fetch categories dynamically or fallback.
 */
export async function getPlantCategories(): Promise<string[]> {
  try {
    const res = await query<{ name: string }>(`
      SELECT name FROM public.categories WHERE type = 'plant' ORDER BY sort_order ASC
    `);
    if (res && res.rows && res.rows.length > 0) {
      return ['All Plants', ...res.rows.map((r) => r.name)];
    }
  } catch {
    // Fallback
  }
  const plants = globalStore.__natureHousePlants || loadPersistedCatalog()?.plants || MOCK_PLANTS;
  const customCategories = plants.map((p) => p.category).filter(Boolean);
  return Array.from(new Set(['All Plants', ...PLANT_CATEGORIES.slice(1), ...customCategories]));
}

export async function getAquariumCategories(): Promise<string[]> {
  try {
    const res = await query<{ name: string }>(`
      SELECT name FROM public.categories WHERE type = 'aquarium' ORDER BY sort_order ASC
    `);
    if (res && res.rows && res.rows.length > 0) {
      return ['All Aquariums', ...res.rows.map((r) => r.name)];
    }
  } catch {
    // Fallback
  }
  const aquas = globalStore.__natureHouseAquariums || loadPersistedCatalog()?.aquariums || MOCK_AQUARIUMS;
  const customCategories = aquas.map((a) => a.category).filter(Boolean);
  return Array.from(new Set(['All Aquariums', ...AQUARIUM_CATEGORIES.slice(1), ...customCategories]));
}

/**
 * Fetch Store Information from site_settings or fallback.
 */
export async function getStoreSettings(): Promise<StoreInfo> {
  try {
    const res = await query<{ value: Record<string, string> }>(`
      SELECT value FROM public.site_settings WHERE key = 'business_info'
    `);
    if (res && res.rows && res.rows.length > 0) {
      const v = res.rows[0].value;
      return {
        storeName: v.store_name || v.storeName || STORE_INFO.storeName,
        tagline: v.tagline || STORE_INFO.tagline,
        whatsappPhone: v.whatsapp_phone || v.whatsappPhone || STORE_INFO.whatsappPhone,
        callingPhone: v.calling_phone || v.callingPhone || STORE_INFO.callingPhone,
        addressLine1: v.address_line1 || v.addressLine1 || STORE_INFO.addressLine1,
        addressLine2: v.address_line2 || v.addressLine2 || STORE_INFO.addressLine2,
        city: v.city || STORE_INFO.city,
        pincode: v.pincode || STORE_INFO.pincode,
        googleMapsUrl: v.google_maps_url || v.googleMapsUrl || STORE_INFO.googleMapsUrl,
        openTime: v.open_time || v.openTime || STORE_INFO.openTime,
        closeTime: v.close_time || v.closeTime || STORE_INFO.closeTime,
        openDays: v.open_days || v.openDays || STORE_INFO.openDays,
      };
    }
  } catch {
    // Fallback
  }
  return STORE_INFO;
}

/**
 * Returns inventory count summary for the admin dashboard
 */
export async function getInventorySummary() {
  const [plants, aquas] = await Promise.all([getPlants(), getAquariums()]);
  const outOfStockPlants = plants.filter((p) => !p.isInStock).length;
  const outOfStockAquas = aquas.filter((a) => !a.isInStock).length;

  return {
    totalPlants: plants.length,
    totalAquariums: aquas.length,
    totalItems: plants.length + aquas.length,
    outOfStockCount: outOfStockPlants + outOfStockAquas,
    inStockCount: plants.filter((p) => p.isInStock).length + aquas.filter((a) => a.isInStock).length,
  };
}
