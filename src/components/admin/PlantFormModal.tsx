'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, UploadCloud, Camera, Trash2, CheckCircle2 } from 'lucide-react';
import { PlantItem } from '@/types/catalog';

interface PlantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<PlantItem>) => Promise<void>;
  plant: PlantItem | null;
  categories: string[];
  isSaving: boolean;
}

export default function PlantFormModal({
  isOpen,
  onClose,
  onSave,
  plant,
  categories,
  isSaving,
}: PlantFormModalProps) {
  const isEditing = Boolean(plant);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [botanicalName, setBotanicalName] = useState('');
  const [category, setCategory] = useState('Indoor Foliage');
  const [price, setPrice] = useState('450');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [imageFileSize, setImageFileSize] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const [lightRequirement, setLightRequirement] = useState('Bright Indirect');
  const [waterFrequency, setWaterFrequency] = useState('1x Weekly');
  const [potSize, setPotSize] = useState('6-inch Nursery Pot');
  const [difficultyLevel, setDifficultyLevel] = useState<'Beginner' | 'Moderate' | 'Expert'>('Beginner');
  const [idealPlacement, setIdealPlacement] = useState('');
  const [badge, setBadge] = useState('');
  const [description, setDescription] = useState('');
  const [isInStock, setIsInStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (plant) {
      setTitle(plant.title);
      setBotanicalName(plant.botanicalName || '');
      setCategory(plant.category || 'Indoor Foliage');
      setPrice(plant.price.toString());
      setImageUrl(plant.imageUrl || '');
      setImageFileName(plant.imageUrl ? 'Current Catalog Photo' : null);
      setImageFileSize(null);
      setImageError(null);
      setLightRequirement(plant.lightRequirement || 'Bright Indirect');
      setWaterFrequency(plant.waterFrequency || '1x Weekly');
      setPotSize(plant.potSize || '6-inch Nursery Pot');
      setDifficultyLevel(plant.difficultyLevel || 'Beginner');
      setIdealPlacement(plant.idealPlacement || '');
      setBadge(plant.badge || '');
      setDescription(plant.description || '');
      setIsInStock(plant.isInStock);
      setIsFeatured(plant.isFeatured || false);
    } else {
      // Reset defaults for creation
      setTitle('');
      setBotanicalName('');
      setCategory('Indoor Foliage');
      setPrice('450');
      setImageUrl('');
      setImageFileName(null);
      setImageFileSize(null);
      setImageError(null);
      setLightRequirement('Bright Indirect');
      setWaterFrequency('1x Weekly');
      setPotSize('6-inch Nursery Pot');
      setDifficultyLevel('Beginner');
      setIdealPlacement('Living room shelf, bright desk, or bedroom table');
      setBadge('🌿 Nursery Fresh');
      setDescription('Freshly potted specimen nurtured in our Adra botanical studio with organic perlite bark substrate.');
      setIsInStock(true);
      setIsFeatured(false);
    }
  }, [plant, isOpen]);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setImageError('Image size exceeds 25MB limit. Please choose a photo under 25MB.');
      return;
    }

    setImageFileName(file.name);
    setImageError(null);
    setIsOptimizing(true);

    // Upload directly to authenticated Local MediaStore
    const uploadBinaryMedia = async () => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData,
        });
        const result = await res.json();
        if (result.success && result.media) {
          setImageUrl(result.media.url);
          setImageFileSize(`${(result.media.byteSize / 1024).toFixed(1)} KB (Local Media Store)`);
          setIsOptimizing(false);
          return true;
        }
      } catch (err) {
        console.warn('Direct media upload to /api/admin/media failed:', err);
      }
      return false;
    };

    uploadBinaryMedia().then((uploaded) => {
      if (uploaded) return;

      // Fallback preview compression
      const reader = new FileReader();
      reader.onerror = () => {
        setImageError('Failed to read image from device.');
        setIsOptimizing(false);
      };
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => {
          setImageError('Failed to decode image.');
          setIsOptimizing(false);
        };
        img.onload = () => {
          try {
            const MAX_DIM = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_DIM) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              }
            } else {
              if (height > MAX_DIM) {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.82);
              setImageUrl(compressed);
              const approxKb = Math.round((compressed.length * 3) / 4096);
              setImageFileSize(`${approxKb} KB (Compressed Preview)`);
            } else {
              setImageUrl(reader.result as string);
              setImageFileSize(`${(file.size / 1024).toFixed(1)} KB`);
            }
          } catch {
            setImageUrl(reader.result as string);
            setImageFileSize(`${(file.size / 1024).toFixed(1)} KB`);
          } finally {
            setIsOptimizing(false);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImageFileName(null);
    setImageFileSize(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price.trim()) return;

    // Use selected device photo or fallback to clean nursery studio photo
    const finalImageUrl = imageUrl.trim() || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80';

    await onSave({
      ...(plant ? { id: plant.id } : {}),
      title: title.trim(),
      botanicalName: botanicalName.trim(),
      category: category || 'Indoor Foliage',
      price: parseFloat(price) || 0,
      imageUrl: finalImageUrl,
      lightRequirement,
      waterFrequency,
      potSize,
      difficultyLevel,
      idealPlacement: idealPlacement.trim() || undefined,
      badge: badge.trim() || undefined,
      description: description.trim(),
      isInStock,
      isFeatured,
    });
  };

  const validCategories = categories.filter((c) => c !== 'All Plants');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plant-modal-title"
        className="w-full max-w-2xl max-h-[calc(100dvh-32px)] rounded-3xl bg-white shadow-2xl border border-stone-200 flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50/70 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <span className="text-xl shrink-0">🌿</span>
            <h2 id="plant-modal-title" className="font-display text-lg font-bold text-nature-forest leading-snug">
              {isEditing ? `Edit Plant: ${plant?.title}` : 'Add New Plant Model Card'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 transition-colors shrink-0 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">
          {/* Row 1: Title & Botanical Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-nature-stone mb-1.5">
                Plant Common Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Monstera Deliciosa"
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-800 focus:border-nature-moss focus:ring-1 focus:ring-nature-moss"
              />
            </div>
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-nature-stone mb-1.5">
                Botanical / Latin Name
              </label>
              <input
                type="text"
                value={botanicalName}
                onChange={(e) => setBotanicalName(e.target.value)}
                placeholder="e.g. Swiss Cheese Tropical Foliage"
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-800 italic focus:border-nature-moss focus:ring-1 focus:ring-nature-moss"
              />
            </div>
          </div>

          {/* Row 2: Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-nature-stone mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-800 focus:border-nature-moss focus:ring-1 focus:ring-nature-moss bg-white"
              >
                {validCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-nature-stone mb-1.5">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="10"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="450"
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-800 font-mono font-semibold focus:border-nature-moss focus:ring-1 focus:ring-nature-moss"
              />
            </div>
          </div>

          {/* Row 3: Photo Upload with Auto-Compressor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-2xs font-bold uppercase tracking-wider text-nature-stone">
                Plant Photo
              </label>
              <span className="text-3xs text-stone-500 font-medium">
                Auto-compressed • Max 25MB (JPG, PNG, WebP)
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="plant-device-image-input"
            />

            {isOptimizing ? (
              <div className="flex items-center justify-center gap-2.5 p-6 rounded-2xl border border-stone-200 bg-stone-50/70 text-xs text-nature-forest">
                <Loader2 className="h-4 w-4 animate-spin text-nature-moss" />
                <span>Auto-compressing image for fast loading...</span>
              </div>
            ) : imageUrl ? (
              <div className="flex items-center gap-4 p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 shadow-2xs">
                <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden border border-stone-300 bg-stone-100 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="preview" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{imageFileName || 'Photo Attached'}</span>
                  </div>
                  {imageFileSize && (
                    <p className="text-3xs text-stone-500 font-mono mt-0.5">{imageFileSize}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-2xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 shadow-2xs cursor-pointer transition-all active:scale-95"
                    >
                      <Camera className="h-3 w-3 text-stone-500" />
                      <span>Change</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-2xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 cursor-pointer transition-all active:scale-95"
                    >
                      <Trash2 className="h-3 w-3 text-rose-500" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-nature-moss bg-emerald-50/60 ring-2 ring-emerald-300'
                    : 'border-stone-300 hover:border-nature-moss/60 hover:bg-stone-50/80 bg-stone-50/40'
                }`}
              >
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-nature-moss mb-2">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-stone-800">
                  Click or drag photo here
                </p>
                <p className="text-3xs text-stone-500 mt-1">
                  Supports camera photos, gallery, or files (JPG, PNG, WebP up to 25MB)
                </p>
              </div>
            )}

            {imageError && (
              <p className="mt-1.5 text-2xs text-rose-600 font-medium">{imageError}</p>
            )}
          </div>

          {/* Row 4: Care Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-3xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Light
              </label>
              <input
                type="text"
                value={lightRequirement}
                onChange={(e) => setLightRequirement(e.target.value)}
                placeholder="Bright Indirect"
                className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-3xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Water
              </label>
              <input
                type="text"
                value={waterFrequency}
                onChange={(e) => setWaterFrequency(e.target.value)}
                placeholder="1x Weekly"
                className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-3xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Pot Size
              </label>
              <input
                type="text"
                value={potSize}
                onChange={(e) => setPotSize(e.target.value)}
                placeholder="6-inch Pot"
                className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-3xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Difficulty
              </label>
              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value as 'Beginner' | 'Moderate' | 'Expert')}
                className="w-full rounded-lg border border-stone-300 px-2 py-1.5 text-xs bg-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Moderate">Moderate</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Row 4.5: Ideal Room Position / Placement */}
          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-nature-stone mb-1.5">
              Ideal Room Position (Displayed in Modal Card)
            </label>
            <input
              type="text"
              value={idealPlacement}
              onChange={(e) => setIdealPlacement(e.target.value)}
              placeholder="e.g. Bedroom nightstand, workspace desk, or living room shelf"
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs text-stone-800 focus:border-nature-moss focus:ring-1 focus:ring-nature-moss"
            />
          </div>

          {/* Row 5: Badge & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-nature-stone mb-1.5">
                Badge / Tag (Optional)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="🌿 Most Loved"
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs text-stone-800"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isInStock}
                  onChange={(e) => setIsInStock(e.target.checked)}
                  className="h-4 w-4 rounded text-nature-moss focus:ring-nature-moss"
                />
                <span className="text-xs font-semibold text-stone-700">
                  {isInStock ? '🟢 In Stock (Nursery Ready)' : '🔴 Sold Out'}
                </span>
              </label>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded text-nature-moss focus:ring-nature-moss"
                />
                <span className="text-xs font-semibold text-stone-700">
                  ✨ Featured Highlight
                </span>
              </label>
            </div>
          </div>

          {/* Row 6: Description */}
          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-nature-stone mb-1.5">
              Care &amp; Atmospheric Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe leaf variegation, potting mix, light preferences..."
              className="w-full rounded-xl border border-stone-300 p-3 text-xs text-stone-800 focus:border-nature-moss focus:ring-1 focus:ring-nature-moss leading-relaxed"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="border-t border-stone-200 pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-stone-300 px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  <span>Saving Card...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>{isEditing ? 'Save Changes' : 'Publish Model Card'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
