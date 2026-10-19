import { ValidationError } from './errors';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function validatePlantInput(input: any) {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('Invalid request body: expected JSON object');
  }

  const errors: Record<string, string> = {};

  if (!input.title || typeof input.title !== 'string' || !input.title.trim()) {
    errors.title = 'Title is required and must be a non-empty string.';
  }

  const price = Number(input.price);
  if (!Number.isFinite(price) || price < 0) {
    errors.price = 'Price must be a valid, non-negative number.';
  }

  if (input.imageUrl && typeof input.imageUrl !== 'string') {
    errors.imageUrl = 'Image URL must be a valid string.';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Plant input validation failed', errors);
  }

  const difficulty = input.difficultyLevel ? String(input.difficultyLevel).trim() : 'Beginner';
  const difficultyLevel: 'Beginner' | 'Moderate' | 'Expert' = ['Beginner', 'Moderate', 'Expert'].includes(difficulty)
    ? (difficulty as 'Beginner' | 'Moderate' | 'Expert')
    : 'Beginner';

  return {
    title: String(input.title).trim(),
    botanicalName: input.botanicalName ? String(input.botanicalName).trim() : '',
    category: input.category ? String(input.category).trim() : 'Indoor Foliage',
    description: input.description ? String(input.description).trim() : '',
    price,
    imageUrl: input.imageUrl ? String(input.imageUrl).trim() : '',
    lightRequirement: input.lightRequirement ? String(input.lightRequirement).trim() : 'Bright Indirect',
    waterFrequency: input.waterFrequency ? String(input.waterFrequency).trim() : '1-2x Weekly',
    potSize: input.potSize ? String(input.potSize).trim() : '6-inch Pot',
    difficultyLevel,
    badge: input.badge ? String(input.badge).trim() : undefined,
    isInStock: input.isInStock !== undefined ? Boolean(input.isInStock) : true,
    isFeatured: Boolean(input.isFeatured),
  };
}

export function validateAquariumInput(input: any) {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('Invalid request body: expected JSON object');
  }

  const errors: Record<string, string> = {};

  if (!input.title || typeof input.title !== 'string' || !input.title.trim()) {
    errors.title = 'Title is required and must be a non-empty string.';
  }

  const price = Number(input.price);
  if (!Number.isFinite(price) || price < 0) {
    errors.price = 'Price must be a valid, non-negative number.';
  }

  const volume = Number(input.volumeLiters);
  if (!Number.isFinite(volume) || volume <= 0) {
    errors.volumeLiters = 'Volume in liters must be a positive number.';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Aquarium input validation failed', errors);
  }

  return {
    title: String(input.title).trim(),
    category: input.category ? String(input.category).trim() : 'Rimless Aquascapes',
    glassType: input.glassType ? String(input.glassType).trim() : 'Opti-White Ultra-Clear',
    glassThicknessMm: Number(input.glassThicknessMm) || 10.0,
    dimensionsCm: input.dimensionsCm ? String(input.dimensionsCm).trim() : '60 x 30 x 36 cm',
    volumeLiters: volume,
    description: input.description ? String(input.description).trim() : '',
    price,
    imageUrl: input.imageUrl ? String(input.imageUrl).trim() : '',
    style: input.style ? String(input.style).trim() : 'Rimless Nature Aquarium',
    includesCabinet: Boolean(input.includesCabinet),
    badge: input.badge ? String(input.badge).trim() : undefined,
    isInStock: input.isInStock !== undefined ? Boolean(input.isInStock) : true,
    isFeatured: Boolean(input.isFeatured),
  };
}

export function validateScheduleNoticeInput(input: any) {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('Invalid request body: expected JSON object');
  }

  const errors: Record<string, string> = {};

  if (!input.title || typeof input.title !== 'string' || !input.title.trim()) {
    errors.title = 'Notice title is required.';
  }

  if (!input.startDate || !DATE_REGEX.test(input.startDate)) {
    errors.startDate = 'Start date must be in YYYY-MM-DD format.';
  }

  if (!input.endDate || !DATE_REGEX.test(input.endDate)) {
    errors.endDate = 'End date must be in YYYY-MM-DD format.';
  }

  if (input.startDate && input.endDate && input.startDate > input.endDate) {
    errors.dateRange = 'Start date cannot be after end date.';
  }

  const validStatuses = ['Closed', 'Special Hours', 'Open Normal', 'Studio Notice'];
  if (!validStatuses.includes(input.status)) {
    errors.status = `Status must be one of: ${validStatuses.join(', ')}`;
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Schedule notice validation failed', errors);
  }

  return {
    id: input.id ? String(input.id) : undefined,
    title: String(input.title).trim(),
    startDate: input.startDate,
    endDate: input.endDate,
    status: input.status,
    hours: input.hours ? String(input.hours).trim() : undefined,
    details: input.details ? String(input.details).trim() : undefined,
    reopenMessage: input.reopenMessage ? String(input.reopenMessage).trim() : undefined,
  };
}
