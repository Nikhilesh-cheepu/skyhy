'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Section = { id: string; slug: string; name: string };
type Category = { id: string; slug: string; name: string; sectionId: string };
type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  sectionId: string;
  categoryId: string;
  category?: string;
  section: { id: string; slug: string; name: string };
  categoryRef: { id: string; slug: string; name: string };
};

type ToastState = { message: string; variant: 'success' | 'error' } | null;

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<ToastState>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    sectionId: '',
    categoryId: '',
    category: 'veg',
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editSectionId, setEditSectionId] = useState('');
  const [editCategory, setEditCategory] = useState<'veg' | 'non-veg'>('veg');
  const [editIsAvailable, setEditIsAvailable] = useState(true);
  const [editSaving, setEditSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function load() {
    Promise.all([
      fetch('/api/admin/items').then((r) => r.json()),
      fetch('/api/admin/sections').then((r) => r.json()),
      fetch('/api/admin/categories').then((r) => r.json()),
    ])
      .then(([itemsData, secData, catData]) => {
        if (itemsData.error) setError(itemsData.error);
        else setItems(Array.isArray(itemsData) ? itemsData : []);
        if (!secData.error) setSections(secData);
        if (!catData.error) setCategories(catData);
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const categoriesBySection = categories.reduce<Record<string, Category[]>>((acc, c) => {
    const sid = c.sectionId;
    if (!acc[sid]) acc[sid] = [];
    acc[sid].push(c);
    return acc;
  }, {});

  const itemsBySectionCategory = items.reduce<
    Record<string, Record<string, MenuItem[]>>
  >((acc, item) => {
    const sid = item.sectionId;
    const cid = item.categoryId;
    if (!acc[sid]) acc[sid] = {};
    if (!acc[sid][cid]) acc[sid][cid] = [];
    acc[sid][cid].push(item);
    return acc;
  }, {});

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    const name = form.name.trim();
    const price = Number(form.price);
    if (!name || !form.sectionId || !form.categoryId) return;
    if (!Number.isInteger(price) || price < 0) {
      setError('Price must be a non-negative integer');
      return;
    }
    setAdding(true);
    setError('');
    try {
      const res = await fetch('/api/admin/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: form.description.trim() || undefined,
          price,
          sectionId: form.sectionId,
          categoryId: form.categoryId,
          category: form.category,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setForm({ name: '', description: '', price: '', sectionId: '', categoryId: '', category: 'veg' });
      load();
      setToast({ message: 'Item added.', variant: 'success' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add';
      setError(msg);
      setToast({ message: msg, variant: 'error' });
    } finally {
      setAdding(false);
    }
  }

  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDescription(item.description ?? '');
    setEditPrice(String(item.price));
    setEditSectionId(item.sectionId);
    setEditCategoryId(item.categoryId);
    setEditCategory(item.category === 'non-veg' ? 'non-veg' : 'veg');
    setEditIsAvailable(item.isActive);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit() {
    if (!editingId) return;
    const priceNum = Number(editPrice);
    if (!Number.isInteger(priceNum) || priceNum < 0) {
      setToast({ message: 'Price must be a non-negative integer.', variant: 'error' });
      return;
    }
    setEditSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/items/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || undefined,
          price: priceNum,
          categoryId: editCategoryId || undefined,
          category: editCategory,
          isAvailable: editIsAvailable,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setItems((prev) => prev.map((i) => (i.id === editingId ? data : i)));
      setToast({ message: 'Item updated.', variant: 'success' });
      cancelEdit();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update';
      setError(msg);
      setToast({ message: msg, variant: 'error' });
    } finally {
      setEditSaving(false);
    }
  }

  async function toggleAvailable(item: MenuItem) {
    const nextActive = !item.isActive;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isActive: nextActive } : i))
    );
    setToast({ message: nextActive ? 'Item visible.' : 'Item hidden.', variant: 'success' });
    try {
      const res = await fetch(`/api/admin/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: nextActive }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setItems((prev) => prev.map((i) => (i.id === item.id ? data : i)));
    } catch (err) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isActive: item.isActive } : i))
      );
      setToast({ message: err instanceof Error ? err.message : 'Failed to update', variant: 'error' });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/items/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      setToast({ message: 'Item deleted.', variant: 'success' });
      setDeleteTarget(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete';
      setError(msg);
      setToast({ message: msg, variant: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-white/60">Loading menu…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-sm text-white/90">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-base font-semibold text-white">Manage menu items</h1>
          <p className="text-xs text-white/60">
            Add, edit, hide, or delete items. Group by section and category below.
          </p>
        </div>
        <Link
          href="/admin"
          className="text-xs text-white/70 hover:text-white"
        >
          ← Dashboard
        </Link>
      </div>

      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      {/* Add item — same style as Events "Add event" */}
      <div className="rounded-2xl border border-white/10 bg-black/60 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.9)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
          Add item
        </p>
        <form onSubmit={addItem} className="mt-3 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-white/70">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Paneer Tikka"
                className="w-full rounded-xl border border-white/15 bg-black/70 px-3 py-2 text-sm text-white placeholder-white/40 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-600/60"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-white/70">Price (₹) *</label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="0"
                className="w-full rounded-xl border border-white/15 bg-black/70 px-3 py-2 text-sm text-white placeholder-white/40 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-600/60"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-white/70">Description (optional)</label>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Short description"
              className="w-full rounded-xl border border-white/15 bg-black/70 px-3 py-2 text-sm text-white placeholder-white/40 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-600/60"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-white/70">Section *</label>
              <select
                value={form.sectionId}
                onChange={(e) => setForm((f) => ({ ...f, sectionId: e.target.value, categoryId: '' }))}
                className="rounded-xl border border-white/15 bg-black/70 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-600/60"
                required
              >
                <option value="">Select</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-white/70">Category *</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="rounded-xl border border-white/15 bg-black/70 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-600/60"
                required
              >
                <option value="">Select</option>
                {(form.sectionId ? (categoriesBySection[form.sectionId] ?? []) : []).map((c) => (
                  <option key={c.id} value={c.id}>{c.slug}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-white/70">Veg / Non-veg</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as 'veg' | 'non-veg' }))}
                className="rounded-xl border border-white/15 bg-black/70 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-600/60"
              >
                <option value="veg">Veg</option>
                <option value="non-veg">Non-veg</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={adding}
            className="inline-flex w-full justify-center rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 sm:w-auto"
          >
            {adding ? 'Adding…' : 'Add item'}
          </button>
        </form>
      </div>

      {/* Item list by section / category — card per item like Events */}
      {sections.length === 0 ? (
        <p className="text-xs text-white/60">
          No sections yet. Add sections and categories from{' '}
          <Link href="/admin/categories" className="text-sky-400 underline">
            Category Management
          </Link>
          , then add menu items here.
        </p>
      ) : (
        <div className="space-y-6">
          {sections.map((sec) => (
            <div key={sec.id} className="space-y-2">
              <p className="text-xs font-semibold text-white/70">{sec.name}</p>
              <div className="space-y-2">
                {(categoriesBySection[sec.id] ?? []).map((cat) => {
                  const sectionItems = itemsBySectionCategory[sec.id]?.[cat.id] ?? [];
                  if (sectionItems.length === 0) return null;
                  return (
                    <div key={cat.id} className="space-y-1.5">
                      <p className="text-[11px] uppercase tracking-wider text-white/50 pl-1">{cat.slug}</p>
                      <div className="space-y-2">
                        {sectionItems.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-black/70 p-3 shadow-[0_12px_32px_rgba(0,0,0,0.9)] ${
                              !item.isActive ? 'opacity-70' : ''
                            }`}
                          >
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <p className="text-[13px] font-medium text-white truncate">
                                {item.name}
                                {!item.isActive && (
                                  <span className="ml-2 text-[11px] font-normal text-amber-400">(hidden)</span>
                                )}
                              </p>
                              {item.description && (
                                <p className="text-[11px] text-white/60 line-clamp-2">{item.description}</p>
                              )}
                              <p className="text-[11px] text-sky-300 font-semibold">₹{item.price}</p>
                            </div>
                            <div className="flex flex-shrink-0 items-center gap-2 relative z-10">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleAvailable(item);
                                }}
                                className="flex h-10 w-10 min-w-10 min-h-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm text-white hover:bg-white/20 cursor-pointer select-none touch-manipulation"
                                title={item.isActive ? 'Hide' : 'Show'}
                                aria-label={item.isActive ? 'Hide item' : 'Show item'}
                              >
                                {item.isActive ? '👁' : '👁‍🗨'}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  startEdit(item);
                                }}
                                className="flex h-10 w-10 min-w-10 min-h-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm text-white hover:bg-white/20 cursor-pointer select-none touch-manipulation"
                                title="Edit"
                                aria-label="Edit item"
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDeleteTarget(item);
                                }}
                                className="flex h-10 w-10 min-w-10 min-h-10 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-sm text-red-300 hover:bg-red-500/20 cursor-pointer select-none touch-manipulation"
                                title="Delete"
                                aria-label="Delete item"
                              >
                                🗑
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit bottom sheet — same pattern as Events */}
      {editingId !== null && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md rounded-t-3xl border border-white/15 bg-slate-950/95 p-4 shadow-[0_-18px_40px_rgba(0,0,0,1)] backdrop-blur-xl">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/15" />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
            Edit item
          </p>
          <div className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-white/70">Name *</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/80 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-600/60"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-white/70">Description (optional)</label>
              <input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/80 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-600/60"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-white/70">Price (₹) *</label>
              <input
                type="number"
                min={0}
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/80 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-600/60"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-white/70">Category</label>
                <select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  className="rounded-xl border border-white/15 bg-black/80 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-600/60"
                >
                  {(editSectionId ? (categoriesBySection[editSectionId] ?? []) : []).map((c) => (
                    <option key={c.id} value={c.id}>{c.slug}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-white/70">Veg / Non-veg</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as 'veg' | 'non-veg')}
                  className="rounded-xl border border-white/15 bg-black/80 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-600/60"
                >
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-veg</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editIsAvailable}
                onChange={(e) => setEditIsAvailable(e.target.checked)}
                className="rounded border-white/30 bg-black/80 text-sky-500 focus:ring-sky-500"
              />
              <span className="text-[11px] font-medium text-white/70">Visible on menu</span>
            </label>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm font-medium text-white hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={editSaving}
                className="flex-1 rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-black shadow-lg shadow-sky-500/40 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
              >
                {editSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-slate-950/95 p-4 shadow-[0_18px_40px_rgba(0,0,0,1)]">
            <p className="text-sm font-semibold text-white">Delete &quot;{deleteTarget.name}&quot;?</p>
            <p className="mt-1 text-[12px] text-white/60">
              This will remove the item from the menu. This action cannot be undone.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm font-medium text-white hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="flex-1 rounded-xl bg-red-500/90 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/40 hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-red-500/40"
              >
                {deleteLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
          <div
            className={`pointer-events-auto rounded-full px-4 py-2 text-xs font-medium shadow-lg ${
              toast.variant === 'success'
                ? 'bg-emerald-500 text-black shadow-emerald-500/40'
                : 'bg-red-500 text-white shadow-red-500/40'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
