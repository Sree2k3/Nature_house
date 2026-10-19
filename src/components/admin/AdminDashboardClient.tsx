'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  Layers,
  Calendar,
} from 'lucide-react';
import { PlantItem, AquariumItem } from '@/types/catalog';
import AdminNavbar from './AdminNavbar';
import PlantFormModal from './PlantFormModal';
import AquariumFormModal from './AquariumFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import CalendarManager from './CalendarManager';

interface AdminDashboardClientProps {
  initialPlants: PlantItem[];
  initialAquariums: AquariumItem[];
  plantCategories: string[];
  aquaCategories: string[];
}

export default function AdminDashboardClient({
  initialPlants,
  initialAquariums,
  plantCategories,
  aquaCategories,
}: AdminDashboardClientProps) {
  const [plants, setPlants] = useState<PlantItem[]>(initialPlants);
  const [aquariums, setAquariums] = useState<AquariumItem[]>(initialAquariums);
  const [activeTab, setActiveTab] = useState<'plants' | 'aquariums' | 'calendar'>('plants');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setPlants(initialPlants);
  }, [initialPlants]);

  useEffect(() => {
    setAquariums(initialAquariums);
  }, [initialAquariums]);

  const lastReloadRef = React.useRef<number>(Date.now());

  const reloadData = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastReloadRef.current < 10000) return;
    lastReloadRef.current = now;

    try {
      const res = await fetch('/api/catalog', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.plants)) setPlants(data.plants);
        if (Array.isArray(data.aquariums)) setAquariums(data.aquariums);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handleFocus = () => reloadData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [reloadData]);

  // Modals state
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<PlantItem | null>(null);

  const [isAquaModalOpen, setIsAquaModalOpen] = useState(false);
  const [editingAqua, setEditingAqua] = useState<AquariumItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
    type: 'plant' | 'aquarium';
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Stock toggle handler (Optimistic UI update)
  const handleToggleStock = async (type: 'plant' | 'aquarium', id: string, currentStock: boolean) => {
    const newStock = !currentStock;

    if (type === 'plant') {
      setPlants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isInStock: newStock } : p))
      );
      try {
        const res = await fetch('/api/admin/plants', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, isInStock: newStock }),
        });
        if (!res.ok) throw new Error();
        showToast(`Updated: Plant is now ${newStock ? 'In Stock' : 'Sold Out'}`);
      } catch {
        // Rollback
        setPlants((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isInStock: currentStock } : p))
        );
        showToast('Failed to update stock status on server');
      }
    } else {
      setAquariums((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isInStock: newStock } : a))
      );
      try {
        const res = await fetch('/api/admin/aquariums', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, isInStock: newStock }),
        });
        if (!res.ok) throw new Error();
        showToast(`Updated: Tank is now ${newStock ? 'In Stock' : 'Bespoke Order'}`);
      } catch {
        // Rollback
        setAquariums((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isInStock: currentStock } : a))
        );
        showToast('Failed to update stock status on server');
      }
    }
  };

  // Save Plant (Add or Edit)
  const handleSavePlant = async (data: Partial<PlantItem>) => {
    setIsSaving(true);
    try {
      const isEdit = Boolean(data.id);
      const res = await fetch('/api/admin/plants', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save plant');

      if (isEdit) {
        setPlants((prev) =>
          prev.map((p) => (p.id === data.id ? { ...p, ...result.plant } : p))
        );
        showToast(`Saved changes for ${result.plant.title}`);
      } else {
        setPlants((prev) => [result.plant, ...prev]);
        showToast(`Created new plant model card: ${result.plant.title}`);
      }
      setIsPlantModalOpen(false);
      setEditingPlant(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving plant');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Aquarium (Add or Edit)
  const handleSaveAquarium = async (data: Partial<AquariumItem>) => {
    setIsSaving(true);
    try {
      const isEdit = Boolean(data.id);
      const res = await fetch('/api/admin/aquariums', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save aquarium');

      if (isEdit) {
        setAquariums((prev) =>
          prev.map((a) => (a.id === data.id ? { ...a, ...result.aquarium } : a))
        );
        showToast(`Saved changes for ${result.aquarium.title}`);
      } else {
        setAquariums((prev) => [result.aquarium, ...prev]);
        showToast(`Created new aquarium model card: ${result.aquarium.title}`);
      }
      setIsAquaModalOpen(false);
      setEditingAqua(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving aquarium');
    } finally {
      setIsSaving(false);
    }
  };

  // Cascade Deletion ("Deleted everywhere")
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const endpoint =
        deleteTarget.type === 'plant'
          ? `/api/admin/plants?id=${encodeURIComponent(deleteTarget.id)}`
          : `/api/admin/aquariums?id=${encodeURIComponent(deleteTarget.id)}`;

      const res = await fetch(endpoint, { method: 'DELETE' });
      if (!res.ok) throw new Error('Deletion request failed');

      if (deleteTarget.type === 'plant') {
        setPlants((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      } else {
        setAquariums((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      }

      showToast(`Purged "${deleteTarget.title}" everywhere (database, storage & catalog).`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to cascade delete card');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter items
  const filteredPlants = plants.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.botanicalName && p.botanicalName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAquariums = aquariums.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.dimensionsCm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.glassType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPlants = plants.length;
  const totalAquariums = aquariums.length;
  const outOfStockCount =
    plants.filter((p) => !p.isInStock).length +
    aquariums.filter((a) => !a.isInStock).length;

  return (
    <div className="min-h-screen bg-stone-100/60 pb-16 selection:bg-nature-moss selection:text-white">
      {/* 1. Admin Sticky Navbar */}
      <AdminNavbar
        totalPlants={totalPlants}
        totalAquariums={totalAquariums}
        outOfStockCount={outOfStockCount}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-nature-forest text-white px-5 py-3 text-xs font-semibold shadow-2xl border border-emerald-400/30 animate-slide-up">
          <Sparkles className="h-4 w-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* 2. Top Controls & Mode Switcher Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          {/* Plants / Aquariums / Calendar Tab Switcher */}
          <div className="inline-flex rounded-2xl bg-white p-1 border border-stone-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('plants')}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'plants'
                  ? 'bg-nature-forest text-white shadow-xs'
                  : 'text-stone-600 hover:text-nature-forest'
              }`}
            >
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>Nursery Plants ({totalPlants})</span>
            </button>
            <button
              onClick={() => setActiveTab('aquariums')}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'aquariums'
                  ? 'bg-aqua-deep text-white shadow-xs'
                  : 'text-stone-600 hover:text-aqua-deep'
              }`}
            >
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <span>Glass Aquaria ({totalAquariums})</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-amber-800'
              }`}
            >
              <Calendar className="h-4 w-4 text-amber-300" />
              <span>Calendar &amp; Holidays</span>
            </button>
          </div>

          {/* Action Row: Search & Add New Card Button */}
          <div className="flex items-center gap-3">
            {activeTab !== 'calendar' ? (
              <>
                <div className="relative flex-1 sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${activeTab}...`}
                    className="w-full rounded-xl border border-stone-300/80 bg-white pl-9 pr-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-nature-moss focus:outline-hidden"
                  />
                </div>

                {activeTab === 'plants' ? (
                  <button
                    onClick={() => {
                      setEditingPlant(null);
                      setIsPlantModalOpen(true);
                    }}
                    className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-xs active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Add Plant</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingAqua(null);
                      setIsAquaModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-aqua-deep hover:bg-aqua-azure text-white px-6 py-3 text-sm font-bold shadow-xs active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Add Aquarium</span>
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Live Studio Broadcast Active</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Items Table / Cards Grid */}
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          {activeTab === 'plants' ? (
            filteredPlants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-600">
                  <thead className="bg-stone-50 border-b border-stone-200/80 text-2xs font-bold uppercase tracking-wider text-stone-500">
                    <tr>
                      <th className="px-5 py-3.5">Plant Model</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Care Specs</th>
                      <th className="px-4 py-3.5">Price</th>
                      <th className="px-4 py-3.5">Live Stock Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {filteredPlants.map((plant) => (
                      <tr key={plant.id} className="hover:bg-stone-50/60 transition-colors">
                        {/* Title & Photo */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={plant.imageUrl}
                                alt={plant.title}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80';
                                }}
                              />
                            </div>
                            <div className="truncate max-w-[220px]">
                              <span className="font-display font-bold text-sm text-nature-forest block truncate">
                                {plant.title}
                              </span>
                              <span className="text-2xs italic text-stone-400 block truncate">
                                {plant.botanicalName || 'Botanical specimen'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-2xs font-semibold text-stone-700">
                            {plant.category}
                          </span>
                        </td>

                        {/* Care Specs */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-2xs text-stone-500">
                          <div>☀️ {plant.lightRequirement}</div>
                          <div>💧 {plant.waterFrequency}</div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-sm text-nature-forest">
                          ₹{plant.price}
                        </td>

                        {/* Live Stock Status Toggle */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleStock('plant', plant.id, plant.isInStock)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-2xs font-bold transition-all cursor-pointer ${
                              plant.isInStock
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                            title="Click to toggle stock status"
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                plant.isInStock ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'
                              }`}
                            />
                            <span>{plant.isInStock ? 'In Stock (Ready)' : 'Sold Out'}</span>
                          </button>
                        </td>

                        {/* Actions: Edit & Delete */}
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingPlant(plant);
                                setIsPlantModalOpen(true);
                              }}
                              className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-nature-moss transition-colors cursor-pointer"
                              title="Edit plant card details"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  id: plant.id,
                                  title: plant.title,
                                  type: 'plant',
                                raid: undefined,
                                } as unknown as { id: string; title: string; type: 'plant' | 'aquarium' })
                              }
                              className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Cascade delete card everywhere"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-stone-400">
                <span className="text-4xl block mb-2">🌿</span>
                <p className="font-semibold text-stone-600">No plants match your search</p>
                <p className="text-xs mt-1">Tap &ldquo;+ Add Plant&rdquo; above to create a new model card.</p>
              </div>
            )
          ) : activeTab === 'aquariums' ? (
            filteredAquariums.length > 0 ? (
              <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 border-b border-stone-200/80 text-2xs font-bold uppercase tracking-wider text-stone-500">
                  <tr>
                    <th className="px-5 py-3.5">Aquarium Model</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Dimensions &amp; Glass</th>
                    <th className="px-4 py-3.5">Price</th>
                    <th className="px-4 py-3.5">Live Stock Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredAquariums.map((aqua) => (
                    <tr key={aqua.id} className="hover:bg-stone-50/60 transition-colors">
                      {/* Title & Photo */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={aqua.imageUrl}
                              alt={aqua.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=900&q=80';
                              }}
                            />
                          </div>
                          <div className="truncate max-w-[220px]">
                            <span className="font-display font-bold text-sm text-aqua-deep block truncate">
                              {aqua.title}
                            </span>
                            <span className="text-2xs text-stone-400 block truncate">
                              {aqua.style || 'Handcrafted Glass Tank'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-2xs font-semibold text-stone-700">
                          {aqua.category}
                        </span>
                      </td>

                      {/* Dimensions & Glass */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-2xs text-stone-500 font-mono">
                        <div>📐 {aqua.dimensionsCm}</div>
                        <div>💎 {aqua.glassType} ({aqua.glassThicknessMm}mm)</div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-sm text-aqua-deep">
                        ₹{aqua.price}
                      </td>

                      {/* Live Stock Status Toggle */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStock('aquarium', aqua.id, aqua.isInStock)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-2xs font-bold transition-all cursor-pointer ${
                            aqua.isInStock
                              ? 'bg-sky-100 text-sky-800 hover:bg-sky-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                          title="Click to toggle stock status"
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              aqua.isInStock ? 'bg-cyan-600 animate-pulse' : 'bg-amber-600'
                            }`}
                          />
                          <span>{aqua.isInStock ? 'In Stock (Ready)' : 'Bespoke Order'}</span>
                        </button>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingAqua(aqua);
                              setIsAquaModalOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-aqua-deep transition-colors cursor-pointer"
                            title="Edit aquarium card details"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                id: aqua.id,
                                title: aqua.title,
                                type: 'aquarium',
                              })
                            }
                            className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Cascade delete card everywhere"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-stone-400">
              <span className="text-4xl block mb-2">🌊</span>
              <p className="font-semibold text-stone-600">No aquariums match your search</p>
              <p className="text-xs mt-1">Tap &ldquo;+ Add Aquarium&rdquo; above to create a new model card.</p>
            </div>
          )
        ) : (
          /* 3. INTERACTIVE 6-YEAR CALENDAR & CUSTOM HOLIDAYS / STORE CLOSURE CONSOLE */
          <CalendarManager onShowToast={showToast} />
        )}
      </div>
      </main>

      {/* 4. Modals */}
      <PlantFormModal
        isOpen={isPlantModalOpen}
        onClose={() => {
          setIsPlantModalOpen(false);
          setEditingPlant(null);
        }}
        onSave={handleSavePlant}
        plant={editingPlant}
        categories={plantCategories}
        isSaving={isSaving}
      />

      <AquariumFormModal
        isOpen={isAquaModalOpen}
        onClose={() => {
          setIsAquaModalOpen(false);
          setEditingAqua(null);
        }}
        onSave={handleSaveAquarium}
        aquarium={editingAqua}
        categories={aquaCategories}
        isSaving={isSaving}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        itemTitle={deleteTarget?.title || ''}
        itemType={deleteTarget?.type || 'plant'}
      />
    </div>
  );
}
