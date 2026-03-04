'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    sectionId: '',
    categoryId: '',
    category: 'veg',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSectionId, setFilterSectionId] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterVeg, setFilterVeg] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [filterHidden, setFilterHidden] = useState<'all' | 'visible' | 'hidden'>('all');

  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(new Set());
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

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

  const categoriesBySection = useMemo(
    () =>
      categories.reduce<Record<string, Category[]>>((acc, c) => {
        if (!acc[c.sectionId]) acc[c.sectionId] = [];
        acc[c.sectionId].push(c);
        return acc;
      }, {}),
    [categories]
  );

  const filteredItems = useMemo(() => {
    let list = items;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description?.toLowerCase().includes(q) ?? false)
      );
    }
    if (filterSectionId) list = list.filter((i) => i.sectionId === filterSectionId);
    if (filterCategoryId) list = list.filter((i) => i.categoryId === filterCategoryId);
    if (filterVeg === 'veg') list = list.filter((i) => (i.category ?? 'veg') === 'veg');
    if (filterVeg === 'non-veg') list = list.filter((i) => (i.category ?? 'veg') === 'non-veg');
    if (filterHidden === 'visible') list = list.filter((i) => i.isActive);
    if (filterHidden === 'hidden') list = list.filter((i) => !i.isActive);
    return list;
  }, [items, searchQuery, filterSectionId, filterCategoryId, filterVeg, filterHidden]);

  const categoriesForSection = (sectionId: string) =>
    categoriesBySection[sectionId] ?? [];

  const { sectionOrder, itemsBySectionCategory } = useMemo(() => {
    const sectionOrder: Section[] = [];
    const seen = new Set<string>();
    for (const s of sections) {
      const hasItems = filteredItems.some((i) => i.sectionId === s.id);
      if (hasItems && !seen.has(s.id)) {
        seen.add(s.id);
        sectionOrder.push(s);
      }
    }
    const itemsBySectionCategory: Record<string, Record<string, MenuItem[]>> = {};
    for (const item of filteredItems) {
      const sid = item.sectionId;
      const cid = item.categoryId;
      if (!itemsBySectionCategory[sid]) itemsBySectionCategory[sid] = {};
      if (!itemsBySectionCategory[sid][cid]) itemsBySectionCategory[sid][cid] = [];
      itemsBySectionCategory[sid][cid].push(item);
    }
    return { sectionOrder, itemsBySectionCategory };
  }, [sections, filteredItems]);

  const toggleSection = (sectionId: string) => {
    setOpenSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

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
      setAddModalOpen(false);
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
    setMenuOpenId(null);
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
          sectionId: editSectionId || undefined,
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
    setMenuOpenId(null);
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
    setMenuOpenId(null);
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
    <div
      className="relative min-h-[60vh] rounded-2xl bg-gradient-to-b from-slate-900/95 via-[#0f172a] to-slate-950/95 p-4 text-sm text-white/90 shadow-xl"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold text-white">Manage menu items</h1>
          <p className="text-xs text-white/50">Grouped by section and category.</p>
        </div>
        <Link href="/admin" className="text-xs text-white/60 hover:text-white">
          ← Dashboard
        </Link>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400" role="alert">{error}</p>
      )}

      {/* Toolbar: browsing only */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/20 px-3 py-2 text-xs font-semibold text-sky-200 hover:bg-sky-500/30"
        >
          + Add Item
        </button>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items…"
          className="min-w-[120px] max-w-[200px] rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder-white/40 focus:border-white/20 focus:outline-none"
        />
        <select
          value={filterSectionId}
          onChange={(e) => {
            setFilterSectionId(e.target.value);
            setFilterCategoryId('');
          }}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white focus:border-white/20 focus:outline-none"
        >
          <option value="">All sections</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white focus:border-white/20 focus:outline-none"
        >
          <option value="">All categories</option>
          {(filterSectionId ? categoriesForSection(filterSectionId) : categories).map((c) => (
            <option key={c.id} value={c.id}>{c.slug}</option>
          ))}
        </select>
        <select
          value={filterVeg}
          onChange={(e) => setFilterVeg(e.target.value as 'all' | 'veg' | 'non-veg')}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white focus:border-white/20 focus:outline-none"
        >
          <option value="all">Veg / Non-veg</option>
          <option value="veg">Veg</option>
          <option value="non-veg">Non-veg</option>
        </select>
        <select
          value={filterHidden}
          onChange={(e) => setFilterHidden(e.target.value as 'all' | 'visible' | 'hidden')}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white focus:border-white/20 focus:outline-none"
        >
          <option value="all">All</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      {/* Hierarchy: Section accordions → Category headings → Item rows */}
      <div className="mt-6 space-y-2">
        {sections.length === 0 ? (
          <p className="text-xs text-white/50">
            No sections yet. <Link href="/admin/categories" className="text-sky-400 underline">Category Management</Link>, then add items here.
          </p>
        ) : filteredItems.length === 0 ? (
          <p className="text-xs text-white/50">No items match the current filters.</p>
        ) : (
          sectionOrder.map((sec) => {
            const isOpen = openSectionIds.has(sec.id);
            const sectionItems = Object.values(itemsBySectionCategory[sec.id] ?? {}).flat();
            const count = sectionItems.length;

            return (
              <div
                key={sec.id}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] shadow-lg backdrop-blur-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(sec.id)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-white/5"
                >
                  <span className="font-medium text-white/95">{sec.name}</span>
                  <span className="text-xs text-white/50">({count} items)</span>
                  <span className="text-white/60">{isOpen ? '▼' : '▶'}</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/10 px-3 pb-3 pt-2">
                        {(categoriesBySection[sec.id] ?? []).map((cat) => {
                          const catItems = itemsBySectionCategory[sec.id]?.[cat.id] ?? [];
                          if (catItems.length === 0) return null;
                          return (
                            <div key={cat.id} className="mb-4 last:mb-0">
                              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-white/40">
                                {cat.slug.replace(/-/g, ' ')}
                              </p>
                              <div className="space-y-0.5">
                                {catItems.map((item) => (
                                  <div
                                    key={item.id}
                                    className={`relative flex items-center gap-2 rounded-lg px-2 py-1.5 ${
                                      !item.isActive ? 'opacity-55' : ''
                                    }`}
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-xs font-semibold text-white">
                                        {item.name}
                                        {!item.isActive && (
                                          <span className="ml-1.5 rounded bg-amber-500/20 px-1 py-0.5 text-[10px] font-normal text-amber-300">
                                            Hidden
                                          </span>
                                        )}
                                      </p>
                                      {item.description && (
                                        <p className="truncate text-[11px] text-white/45">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex flex-shrink-0 items-center gap-2">
                                      <span className="text-[11px] font-semibold text-sky-300/90">
                                        ₹{item.price}
                                      </span>
                                      <span className="rounded px-1.5 py-0.5 text-[10px] text-white/60 ring-1 ring-white/20">
                                        {(item.category ?? 'veg') === 'non-veg' ? 'Non-veg' : 'Veg'}
                                      </span>
                                      <div className="relative">
                                        <button
                                          type="button"
                                          onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}
                                          className="flex h-6 w-6 items-center justify-center rounded text-white/50 hover:bg-white/10 hover:text-white/80"
                                          aria-label="Actions"
                                        >
                                          ⋮
                                        </button>
                                        {menuOpenId === item.id && (
                                          <>
                                            <div
                                              className="fixed inset-0 z-30"
                                              onClick={() => setMenuOpenId(null)}
                                              aria-hidden
                                            />
                                            <div className="absolute right-0 top-7 z-40 min-w-[130px] rounded-lg border border-white/10 bg-slate-900/95 py-1 shadow-xl backdrop-blur">
                                              <button
                                                type="button"
                                                onClick={() => startEdit(item)}
                                                className="w-full px-3 py-1.5 text-left text-[11px] text-white hover:bg-white/10"
                                              >
                                                Edit
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => toggleAvailable(item)}
                                                className="w-full px-3 py-1.5 text-left text-[11px] text-white hover:bg-white/10"
                                              >
                                                {item.isActive ? 'Hide' : 'Unhide'}
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setDeleteTarget(item);
                                                  setMenuOpenId(null);
                                                }}
                                                className="w-full px-3 py-1.5 text-left text-[11px] text-red-400 hover:bg-red-500/20"
                                              >
                                                Delete
                                              </button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Add Item modal */}
      <AnimatePresence>
        {addModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/98 p-4 shadow-2xl backdrop-blur"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Add item</p>
              <form onSubmit={addItem} className="mt-3 space-y-3">
                <div>
                  <label className="block text-[11px] text-white/50">Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Paneer Tikka"
                    className="mt-0.5 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder-white/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/50">Price (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="0"
                    className="mt-0.5 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder-white/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/50">Description (optional)</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Short description"
                    className="mt-0.5 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder-white/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-white/50">Section *</label>
                    <select
                      value={form.sectionId}
                      onChange={(e) => setForm((f) => ({ ...f, sectionId: e.target.value, categoryId: '' }))}
                      className="mt-0.5 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white"
                      required
                    >
                      <option value="">Select</option>
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/50">Category *</label>
                    <select
                      value={form.categoryId}
                      onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                      className="mt-0.5 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white"
                      required
                    >
                      <option value="">Select</option>
                      {(form.sectionId ? categoriesForSection(form.sectionId) : []).map((c) => (
                        <option key={c.id} value={c.id}>{c.slug}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-white/50">Veg / Non-veg</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as 'veg' | 'non-veg' }))}
                    className="mt-0.5 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white"
                  >
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-veg</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="flex-1 rounded-lg border border-white/15 py-2 text-xs font-medium text-white/80"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="flex-1 rounded-lg bg-sky-500/90 py-2 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
                  >
                    {adding ? 'Adding…' : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit modal (same fields as Add) */}
      {editingId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={cancelEdit}
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/98 p-4 shadow-2xl backdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Edit item</p>
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] text-white/50">Name *</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-white/50">Price (₹) *</label>
                <input
                  type="number"
                  min={0}
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-white/50">Description</label>
                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-white/50">Section</label>
                  <select
                    value={editSectionId}
                    onChange={(e) => {
                      setEditSectionId(e.target.value);
                      setEditCategoryId('');
                    }}
                    className="mt-0.5 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white"
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-white/50">Category</label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="mt-0.5 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white"
                  >
                    {(editSectionId ? categoriesForSection(editSectionId) : []).map((c) => (
                      <option key={c.id} value={c.id}>{c.slug}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-white/50">Veg / Non-veg</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as 'veg' | 'non-veg')}
                  className="mt-0.5 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white"
                >
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-veg</option>
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editIsAvailable}
                  onChange={(e) => setEditIsAvailable(e.target.checked)}
                  className="rounded border-white/30 bg-black/50 text-sky-500"
                />
                <span className="text-[11px] text-white/60">Visible on menu</span>
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 rounded-lg border border-white/15 py-2 text-xs font-medium text-white/80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={editSaving}
                className="flex-1 rounded-lg bg-sky-500/90 py-2 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
              >
                {editSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900/98 p-4 shadow-2xl backdrop-blur">
            <p className="text-sm font-semibold text-white">Delete &quot;{deleteTarget.name}&quot;?</p>
            <p className="mt-1 text-[12px] text-white/50">This cannot be undone.</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-lg border border-white/15 py-2 text-xs font-medium text-white/80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="flex-1 rounded-lg bg-red-500/90 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
          <div
            className={`rounded-full px-4 py-2 text-xs font-medium shadow-lg ${
              toast.variant === 'success'
                ? 'bg-emerald-500 text-black'
                : 'bg-red-500 text-white'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
