export type CatalogSection = 'plants' | 'aquariums';

export interface PlantItem {
  id: string;
  category: string;
  title: string;
  botanicalName: string;
  description: string;
  price: number;
  imageUrl: string;
  lightRequirement: string;
  waterFrequency: string;
  potSize: string;
  difficultyLevel: 'Beginner' | 'Moderate' | 'Expert';
  badge?: string;
  careTip?: string;
  idealPlacement?: string;
  isInStock: boolean;
  isFeatured?: boolean;
}

export interface AquariumItem {
  id: string;
  category: string;
  title: string;
  glassType: string;
  glassThicknessMm: number;
  dimensionsCm: string;
  volumeLiters: number;
  description: string;
  price: number;
  imageUrl: string;
  style: string;
  includesCabinet: boolean;
  badge?: string;
  idealPlacement?: string;
  clarityRating?: string;
  aquascapingTip?: string;
  isInStock: boolean;
  isFeatured?: boolean;
}

export interface StoreInfo {
  storeName: string;
  tagline: string;
  whatsappPhone: string;
  callingPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
  googleMapsUrl: string;
  openTime: string; // e.g. "09:00"
  closeTime: string; // e.g. "20:30"
  openDays: string; // e.g. "Monday - Saturday (Closed Sundays)"
}
