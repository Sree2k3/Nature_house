'use client';

import React from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  itemTitle: string;
  itemType: 'plant' | 'aquarium';
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  itemTitle,
  itemType,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        className="w-full max-w-md max-h-[calc(100dvh-32px)] rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 relative overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Warning Banner */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 id="delete-confirm-title" className="font-display text-lg font-bold text-stone-900 leading-snug">
              Cascade Delete {itemType === 'plant' ? 'Plant' : 'Aquarium'} Card?
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Multi-target purge will permanently remove this item from the catalog, database, and storage.
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Item preview chip */}
        <div className="rounded-2xl bg-stone-50 border border-stone-200/80 p-3.5 mb-5 flex items-center justify-between">
          <div className="truncate pr-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-stone-400">
              Selected Item
            </span>
            <p className="text-sm font-semibold text-stone-800 truncate">
              {itemTitle}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-rose-100 text-rose-800 text-3xs font-bold px-2 py-0.5 uppercase">
            Irreversible
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-stone-300 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Purging Everywhere...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete Everywhere</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
