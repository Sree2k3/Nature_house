'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Image as ImageIcon, UploadCloud, Camera, Trash2, CheckCircle2 } from 'lucide-react';
import { AquariumItem } from '@/types/catalog';

interface AquariumFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<AquariumItem>) => Promise<void>;
  aquarium: AquariumItem | null;
  categories: string[];
  isSaving: boolean;
}

export default function AquariumFormModal({
  isOpen,
  onClose,
  onSave,
  aquarium,
  categories,
  isSaving,
}: AquariumFormModalProps) {
  const isEditing = Boolean(aquarium);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Rimless Ultra-Clear');
  const [dimensionsCm, setDimensionsCm] = useState('90 × 45 × 45 cm');
  const [volumeLiters, setVolumeLiters] = useState('182');
  const [glassType, setGlassType] = useState('Opti-White Ultra-Clear');
  const [glassThicknessMm, setGlassThicknessMm] = useState('10');
  const [style, setStyle] = useState('Rimless Nature Aquarium');
  const [price, setPrice] = useState('8500');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [imageFileSize, setImageFileSize] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const [includesCabinet, setIncludesCabinet] = useState(false);
  const [badge, setBadge] = useState('');
  const [description, setDescription] = useState('');
  const [isInStock, setIsInStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (aquarium) {
      setTitle(aquarium.title);
      setCategory(aquarium.category || 'Rimless Ultra-Clear');
      setDimensionsCm(aquarium.dimensionsCm || '90 × 45 × 45 cm');
      setVolumeLiters(aquarium.volumeLiters.toString());
      setGlassType(aquarium.glassType || 'Opti-White Ultra-Clear');
      setGlassThicknessMm(aquarium.glassThicknessMm.toString());
      setStyle(aquarium.style || 'Rimless Nature Aquarium');
      setPrice(aquarium.price.toString());
      setImageUrl(aquarium.imageUrl || '');
      setImageFileName(aquarium.imageUrl ? 'Current Glass Tank Photo' : null);
      setImageFileSize(null);
      setImageError(null);
      setIncludesCabinet(aquarium.includesCabinet || false);
      setBadge(aquarium.badge || '');
      setDescription(aquarium.description || '');
      setIsInStock(aquarium.isInStock);
      setIsFeatured(aquarium.isFeatured || false);
    } else {
      // Reset defaults for creation
      setTitle('');
      setCategory('Rimless Ultra-Clear');
      setDimensionsCm('90 × 45 × 45 cm');
      setVolumeLiters('182');
      setGlassType('Opti-White Ultra-Clear');
      setGlassThicknessMm('10');
      setStyle('Rimless Nature Aquarium');
      setPrice('8500');
      setImageUrl('');
      setImageFileName(null);
      setImageFileSize(null);
      setImageError(null);
      setIncludesCabinet(false);
      setBadge('💎 Handcrafted');
      setDescription('Handcrafted ultra-clear low-iron glass tank assembled with German clear silicone seams and 45° diamond-beveled joints.');
      setIsInStock(true);
      setIsFeatured(false);
    }
  }, [aquarium, isOpen]);

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

    // Use selected device photo or fallback to clean studio aquarium photo
    const finalImageUrl = imageUrl.trim() || 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=900&q=80';
    const finalDimensions = dimensionsCm.trim() || '60 × 40 × 40 cm';

    await onSave({
      ...(aquarium ? { id: aquarium.id } : {}),
      title: title.trim(),
      category: category || 'Rimless Ultra-Clear',
      dimensionsCm: finalDimensions,
      volumeLiters: parseFloat(volumeLiters) || 96,
      glassType: glassType.trim() || 'Opti-White Ultra-Clear',
      glassThicknessMm: parseFloat(glassThicknessMm) || 8,
      style: style.trim() || 'Rimless Nature Aquarium',
      price: parseFloat(price) || 0,
      imageUrl: finalImageUrl,
      includesCabinet,
      badge: badge.trim() || undefined,
      description: description.trim(),
      isInStock,
      isFeatured,
    });
  };

  const validCategories = categories.filter((c) => c !== 'All Aquariums');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="aquarium-modal-title"
        className="w-full max-w-2xl max-h-[calc(100dvh-32px)] rounded-3xl bg-white shadow-2xl border border-stone-200 flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50/70 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <span className="text-xl shrink-0">🌊</span>
            <h2 id="aquarium-modal-title" className="font-display text-lg font-bold text-aqua-deep leading-snug">
              {isEditing ? `Edit Tank: ${aquarium?.title}` : 'Add New Aquarium Model Card'}
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
          {/* Row 1: Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-nature-stone mb-1.5">
                Aquarium Model Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 3ft Rimless Aquascape Tank"
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-800 focus:border-aqua-deep focus:ring-1 focus:ring-aqua-deep"
              />
            </div>
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-nature-stone mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-800 focus:border-aqua-deep focus:ring-1 focus:ring-aqua-deep bg-white"
              >
                {validCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Dimensions, Volume & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-nature-stone mb-1.5">
                Dimensions (cm) *
              </label>
              <input
                type="text"
                required
                value={dimensionsCm}
                onChange={(e) => setDimensionsCm(e.target.value)}
                placeholder="90 × 45 × 45 cm"
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-800 font-mono focus:border-aqua-deep focus:ring-1 focus:ring-aqua-deep"
              />
            </div>
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-nature-stone mb-1.5">
                Volume (Liters)
              </label>
              <input
                type="number"
                min="1"
                value={volumeLiters}
                onChange={(e) => setVolumeLiters(e.target.value)}
                placeholder="182"
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-800 font-mono focus:border-aqua-deep focus:ring-1 focus:ring-aqua-deep"
              />
            </div>
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-nature-stone mb-1.5">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="8500"
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-800 font-mono font-semibold focus:border-aqua-deep focus:ring-1 focus:ring-aqua-deep"
              />
            </div>
          </div>

          {/* Row 3: Glass Specifications & Style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-3xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Glass Type
              </label>
              <input
                type="text"
                value={glassType}
                onChange={(e) => setGlassType(e.target.value)}
                placeholder="Opti-White Ultra-Clear"
                className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-3xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Glass Thickness (mm)
              </label>
              <input
                type="number"
                min="3"
                max="25"
                value={glassThicknessMm}
                onChange={(e) => setGlassThicknessMm(e.target.value)}
                placeholder="10"
                className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-3xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Aquarium Style
              </label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="Rimless Nature Aquarium"
                className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs"
              />
            </div>
          </div>

          {/* Row 4: Photo Upload with Auto-Compressor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-2xs font-bold uppercase tracking-wider text-nature-stone">
                Aquarium Photo
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
              id="aqua-device-image-input"
            />

            {isOptimizing ? (
              <div className="flex items-center justify-center gap-2.5 p-6 rounded-2xl border border-stone-200 bg-stone-50/70 text-xs text-nature-forest">
                <Loader2 className="h-4 w-4 animate-spin text-aqua-deep" />
                <span>Auto-compressing image for fast loading...</span>
              </div>
            ) : imageUrl ? (
              <div className="flex items-center gap-4 p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 shadow-2xs">
                <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden border border-stone-300 bg-stone-100 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="preview" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-900">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
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
                    ? 'border-aqua-deep bg-teal-50/60 ring-2 ring-teal-300'
                    : 'border-stone-300 hover:border-aqua-deep/60 hover:bg-stone-50/80 bg-stone-50/40'
                }`}
              >
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-aqua-deep mb-2">
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

          {/* Row 5: Badge, Cabinet & Stock Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-nature-stone mb-1.5">
                Badge / Tag (Optional)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="💎 Best Seller"
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs text-stone-800"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isInStock}
                  onChange={(e) => setIsInStock(e.target.checked)}
                  className="h-4 w-4 rounded text-aqua-deep focus:ring-aqua-deep"
                />
                <span className="text-xs font-semibold text-stone-700">
                  {isInStock ? '🟢 In Stock (Ready)' : '🔴 Bespoke Order'}
                </span>
              </label>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includesCabinet}
                  onChange={(e) => setIncludesCabinet(e.target.checked)}
                  className="h-4 w-4 rounded text-aqua-deep focus:ring-aqua-deep"
                />
                <span className="text-xs font-semibold text-stone-700">
                  🪵 Includes Cabinet
                </span>
              </label>
            </div>
          </div>

          {/* Row 6: Description */}
          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-nature-stone mb-1.5">
              Craftsmanship &amp; Technical Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe beveling technique, silicone grade, inlet cutouts..."
              className="w-full rounded-xl border border-stone-300 p-3 text-xs text-stone-800 focus:border-aqua-deep focus:ring-1 focus:ring-aqua-deep leading-relaxed"
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
              className="rounded-xl bg-aqua-deep text-white hover:bg-aqua-azure inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
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
