'use client';

import { useEffect, useMemo, useState } from 'react';

type Section = { id: string; slug: string; name: string };
type Category = { id: string; slug: string; name: string; sectionId: string };

type AdminItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  isActive: boolean;
  section: Section;
  categoryRef: Category;
};

type Toast = { message: string; type: 'success' | 'error' } | null;

const CATEGORY_TYPES = ['veg', 'non-veg', 'beverage', 'liquor', 'store'] as const;
const PAGE_SIZE = 80;

export default function AdminMenuManagerPage() {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminItem | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }

  function loadItems() {
    setLoading(true);
    fetch('/api/admin/items')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setItems(data);
      })
      .catch(() => setError('Failed to load menu items'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadItems();
  }, []);

  const sections = useMemo(() => {
    const map = new Map<string, Section>();
    items.forEach((it) => {
      map.set(it.section.id, it.section);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const categoriesBySection = useMemo(() => {
    const by: Record<string, Category[]> = {};
    items.forEach((it) => {
      const secId = it.section.id;
      if (!by[secId]) by[secId] = [];
      if (!by[secId].some((c) => c.id === it.categoryRef.id)) {
        by[secId].push(it.categoryRef);
      }
    });
    Object.values(by).forEach((arr) => arr.sort((a, b) => a.slug.localeCompare(b.slug)));
    return by;
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (sectionId && it.section.id !== sectionId) return false;
      if (categoryId && it.categoryRef.id !== categoryId) return false;
      if (typeFilter && it.category !== typeFilter) return false;
      if (q) {
        const text = `${it.name} ${it.description}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [items, search, sectionId, categoryId, typeFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, sectionId, categoryId, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pagedItems = useMemo(
    () =>
      filteredItems.slice(
        (page - 1) * PAGE_SIZE,
        (page - 1) * PAGE_SIZE + PAGE_SIZE,
      ),
    [filteredItems, page],
  );

  type Group = {
    key: string;
    section: Section;
    category: Category;
    items: AdminItem[];
  };

  const groups: Group[] = useMemo(() => {
    const map = new Map<string, Group>();
    pagedItems.forEach((it) => {
      const key = `${it.section.id}:${it.categoryRef.id}`;
      const existing = map.get(key);
      if (existing) {
        existing.items.push(it);
      } else {
        map.set(key, {
          key,
          section: it.section,
          category: it.categoryRef,
          items: [it],
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      if (a.section.name === b.section.name) {
        return a.category.slug.localeCompare(b.category.slug);
      }
      return a.section.name.localeCompare(b.section.name);
    });
  }, [pagedItems]);

  function toggleGroup(key: string) {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleToggleAvailability(item: AdminItem) {
    setPendingItemId(item.id);
    try {
      const res = await fetch(`/api/admin/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isActive }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        showToast(data.error || 'Failed to update item', 'error');
        return;
      }
      setItems((prev) => prev.map((it) => (it.id === data.id ? data : it)));
      showToast('Availability updated');
    } catch {
      showToast('Failed to update item', 'error');
    } finally {
      setPendingItemId(null);
    }
  }

  async function handleDelete(item: AdminItem) {
    if (!confirm(`Delete “${item.name}”?`)) return;
    setPendingItemId(item.id);
    try {
      const res = await fetch(`/api/admin/items/${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || data.error) {
        showToast(data.error || 'Failed to delete item', 'error');
        return;
      }
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      showToast('Item deleted');
    } catch {
      showToast('Failed to delete item', 'error');
    } finally {
      setPendingItemId(null);
    }
  }

  function openAddModal() {
    setEditingItem(null);
    setShowModal(true);
  }

  function openEditModal(item: AdminItem) {
    setEditingItem(item);
    setShowModal(true);
  }

  function handleSavedItem(saved: AdminItem) {
    setItems((prev) => {
      const existing = prev.some((it) => it.id === saved.id);
      if (existing) {
        return prev.map((it) => (it.id === saved.id ? saved : it));
      }
      return [...prev, saved];
    });
    showToast(editingItem ? 'Item updated' : 'Item added');
  }

  const visibleCategories = sectionId ? categoriesBySection[sectionId] ?? [] : [];

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header / controls */}
      <div className="sticky top-[56px] z-20 -mx-4 px-4 pb-3 pt-2 bg-[#0C1222]/95 backdrop-blur border-b border-white/10 md:top-[60px]">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Menu Manager</h1>
            <p className="text-xs text-white/60">
              {filteredItems.length} item{filteredItems.length === 1 ? '' : 's'}{' '}
              • page {page} of {totalPages}
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center rounded-lg bg-[#4A90E2] px-4 py-2 text-sm font-medium text-white shadow hover:bg-[#3a7bc8] active:bg-[#2563eb]"
          >
            + Add Item
          </button>
        </div>

        {/* Search + filters */}
        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or description…"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
            />
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <select
              value={sectionId}
              onChange={(e) => {
                setSectionId(e.target.value);
                setCategoryId('');
              }}
              className="min-w-[120px] rounded-lg border border-white/15 bg-white/5 px-2 py-2 text-xs text-white"
            >
              <option value="">All sections</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={!sectionId}
              className="min-w-[130px] rounded-lg border border-white/15 bg-white/5 px-2 py-2 text-xs text-white disabled:opacity-40"
            >
              <option value="">All categories</option>
              {visibleCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.slug}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="min-w-[120px] rounded-lg border border-white/15 bg-white/5 px-2 py-2 text-xs text-white"
            >
              <option value="">All types</option>
              {CATEGORY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-4 animate-pulse"
              >
                <div className="h-3 w-32 rounded bg-white/20 mb-2" />
                <div className="h-3 w-24 rounded bg-white/10 mb-4" />
                <div className="h-8 w-full rounded bg-white/5" />
              </div>
            ))}
          </>
        )}

        {!loading && !error && groups.length === 0 && (
          <p className="text-center text-sm text-white/60 py-10">
            No items match your filters.
          </p>
        )}

        {error && !loading && (
          <p className="text-center text-sm text-red-400 py-4">{error}</p>
        )}

        {groups.map((group) => {
          const collapsed = collapsedGroups[group.key];
          return (
            <div
              key={group.key}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
            >
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {group.section.name}
                  </p>
                  <p className="text-xs text-white/60">{group.category.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/50">
                    {group.items.length} item
                    {group.items.length === 1 ? '' : 's'}
                  </span>
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-xs text-white/70 transition-transform ${
                      collapsed ? '' : 'rotate-180'
                    }`}
                  >
                    ▾
                  </span>
                </div>
              </button>
              {!collapsed && (
                <div className="divide-y divide-white/10">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 px-4 py-3 text-sm md:flex-row md:items-center"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-medium text-white">
                            {item.name}
                          </p>
                          <p className="text-sm font-semibold text-[#4A90E2]">
                            ₹{item.price}
                          </p>
                        </div>
                        <p className="mt-1 line-clamp-1 text-xs text-white/60">
                          {item.description}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              item.category === 'veg'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : item.category === 'non-veg'
                                ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                                : 'bg-white/10 text-white/70 border border-white/20'
                            }`}
                          >
                            {item.category}
                          </span>
                          {!item.isActive && (
                            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-white/60 border border-white/15">
                              Hidden
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:ml-4">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(item)}
                          disabled={pendingItemId === item.id}
                          className={`rounded-full px-3 py-1 text-[11px] font-medium border transition ${
                            item.isActive
                              ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                              : 'border-white/25 bg-white/5 text-white/70'
                          } disabled:opacity-60`}
                        >
                          {item.isActive ? 'Visible' : 'Hidden'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded-full bg-[#4A90E2]/15 px-3 py-1 text-[11px] font-medium text-[#4A90E2] hover:bg-[#4A90E2]/25"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={pendingItemId === item.id}
                          className="rounded-full bg-red-500/10 px-3 py-1 text-[11px] font-medium text-red-300 hover:bg-red-500/20 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {filteredItems.length > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-3 pt-2 text-xs text-white/70">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-full border border-white/20 px-3 py-1 disabled:opacity-40"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-full border border-white/20 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Add/Edit modal */}
      {showModal && (
        <ItemModal
          open={showModal}
          onClose={() => setShowModal(false)}
          initialItem={editingItem}
          onSaved={handleSavedItem}
        />
      )}
    </div>
  );
}

type ItemModalProps = {
  open: boolean;
  onClose: () => void;
  initialItem: AdminItem | null;
  onSaved: (item: AdminItem) => void;
};

function ItemModal({ open, onClose, initialItem, onSaved }: ItemModalProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sectionId, setSectionId] = useState(initialItem?.section.id ?? '');
  const [categoryId, setCategoryId] = useState(initialItem?.categoryRef.id ?? '');
  const [name, setName] = useState(initialItem?.name ?? '');
  const [description, setDescription] = useState(initialItem?.description ?? '');
  const [price, setPrice] = useState(
    initialItem ? String(initialItem.price) : '',
  );
  const [categoryType, setCategoryType] = useState<string>(
    initialItem?.category ?? 'veg',
  );
  const [imageUrl, setImageUrl] = useState(initialItem?.imageUrl ?? '');
  const [isAvailable, setIsAvailable] = useState(
    initialItem?.isActive ?? true,
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/sections')
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setSections(data);
      });
  }, []);

  useEffect(() => {
    if (!sectionId) {
      setCategories([]);
      setCategoryId('');
      return;
    }
    fetch(`/api/admin/categories?sectionId=${encodeURIComponent(sectionId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setCategories(data);
        if (!initialItem) {
          setCategoryId('');
        }
      });
  }, [sectionId, initialItem]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setImageUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const priceNum = parseInt(price, 10);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a non-negative number');
      return;
    }
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!sectionId || !categoryId) {
      setError('Section and category are required');
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        sectionId,
        categoryId,
        category: categoryType,
        imageUrl: imageUrl || undefined,
        isAvailable,
      };

      let res: Response;
      if (initialItem) {
        res = await fetch(`/api/admin/items/${initialItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch('/api/admin/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save item');
      }
      onSaved(data as AdminItem);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 px-3 pb-4 pt-10 md:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#050816]/95 p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            {initialItem ? 'Edit Item' : 'Add Item'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/70 hover:bg-white/20"
          >
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div>
            <label className="mb-1 block text-xs text-white/70">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/70">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg:white/5 px-3 py-2 text-sm text-white bg-white/5 min-h-[70px]"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-white/70">Price (₹)</label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
                required
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-white/70">Type</label>
              <select
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-2 py-2 text-xs text-white"
              >
                {CATEGORY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-white/70">Section</label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-2 py-2 text-xs text-white"
                required
              >
                <option value="">Select section</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-white/70">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-2 py-2 text-xs text-white"
                required
                disabled={!sectionId}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.slug}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/70">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="w-full text-xs text-white/70 file:mr-2 file:rounded file:border-0 file:bg-[#4A90E2] file:px-3 file:py-1 file:text-white"
            />
            {uploading && (
              <p className="mt-1 text-xs text-white/50">Uploading…</p>
            )}
            {imageUrl && (
              <p className="mt-1 truncate text-xs text-emerald-300">
                Saved: {imageUrl}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              id="available-toggle"
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="h-4 w-4 rounded border-white/30 bg-white/5"
            />
            <label
              htmlFor="available-toggle"
              className="text-xs font-medium text-white/70"
            >
              Available
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-white/5 px-4 py-2 text-xs font-medium text-white/80 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#4A90E2] px-4 py-2 text-xs font-medium text-white hover:bg-[#3a7bc8] disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

