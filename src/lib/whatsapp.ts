import { STORE_INFO } from '@/data/mockCatalog';

const DEFAULT_PHONE = STORE_INFO.whatsappPhone || '919876543210';

/**
 * Helper to build pre-formatted WhatsApp Click-to-Chat deep links.
 * Defensive against undefined phone numbers.
 */
export function buildWhatsAppPlantUrl(params: {
  phone?: string;
  title: string;
  botanicalName?: string;
  potSize: string;
  price: number;
  isInStock: boolean;
}): string {
  const targetPhone = params.phone || DEFAULT_PHONE;
  const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
  const greeting = '🌿 *Hello Nature House!*';
  const stockText = params.isInStock
    ? 'I would like to inquire about ordering / picking up:'
    : 'I see this is currently *Sold Out*. Could you let me know when new stock arrives?';

  const text = `${greeting}
${stockText}

• *Plant:* ${params.title}${params.botanicalName ? ` (${params.botanicalName})` : ''}
• *Pot Size:* ${params.potSize}
• *Listed Price:* ₹${params.price.toLocaleString('en-IN')}

Could you confirm current availability and pickup / delivery details?`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppAquariumUrl(params: {
  phone?: string;
  title: string;
  dimensionsCm: string;
  volumeLiters: number;
  glassThicknessMm: number;
  glassType: string;
  price: number;
  isInStock: boolean;
}): string {
  const targetPhone = params.phone || DEFAULT_PHONE;
  const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
  const greeting = '🐟 *Hello Nature House!*';
  const stockText = params.isInStock
    ? 'I am interested in this handcrafted tank setup:'
    : 'I am interested in ordering a custom tank with these specifications:';

  const text = `${greeting}
${stockText}

• *Tank:* ${params.title}
• *Dimensions:* ${params.dimensionsCm} (${params.volumeLiters} Liters)
• *Glass Specs:* ${params.glassThicknessMm}mm ${params.glassType}
• *Listed Price:* ₹${params.price.toLocaleString('en-IN')}

Could you share details on cabinet options or current fabrication lead time?`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppGeneralUrl(phone?: string): string {
  const targetPhone = phone || DEFAULT_PHONE;
  const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
  const text = `🌿 Hello Nature House! I am visiting your digital catalog and would like to ask a general question about your plants and handcrafted aquariums.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
