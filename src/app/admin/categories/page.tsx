'use client';

import { useEffect, useState } from 'react';

type Category = {
  id: string;
  slug: string;
  name: string;
  sectionId: string;
  section?: { slug: string; name: string };
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newSectionId, setNewSectionId] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [adding, setAdding] = useState(false);

  function load() {
    Promise.all([
      fetch('/api/admin/categories').then((r) => r.json()),
      fetch('/api/admin/sections').then((r) => r.json()),
    ]).then(([catData, secData]) => {
      if (catData.error) setError(catData.error);
      else setCategories(catData);
      if (!secData.error) setSections(secData);
    }).catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newSectionId || !newSlug.trim()) return;
    setAdding(true);
    setError('');
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: newSectionId,
          slug: newSlug.trim().toLowerCase().replace(/\s+/g, '-'),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNewSlug('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add');
    } finally {
      setAdding(false);
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category? (Only allowed if it has no items)')) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.error) setError(data.error);
    else load();
  }

  const bySection = categories.reduce<Record<string, Category[]>>((acc, c) => {
    const sid = c.sectionId;
    if (!acc[sid]) acc[sid] = [];
    acc[sid].push(c);
    return acc;
  }, {});

  if (loading) return <p className="text-white/60">Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-6">Category Management</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <form onSubmit={addCategory} className="flex flex-wrap gap-3 mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
        <select
          value={newSectionId}
          onChange={(e) => setNewSectionId(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
          required
        >
          <option value="">Section</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input
          value={newSlug}
          onChange={(e) => setNewSlug(e.target.value)}
          placeholder="Category key (e.g. salad)"
          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
        />
        <button
          type="submit"
          disabled={adding}
          className="px-4 py-2 rounded-lg bg-[#4A90E2] text-white font-medium hover:bg-[#3a7bc8] disabled:opacity-50"
        >
          {adding ? 'Adding…' : 'Add Category'}
        </button>
      </form>
      <div className="space-y-4">
        {sections.map((sec) => (
          <div key={sec.id} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <h2 className="px-4 py-2 bg-white/5 text-[#4A90E2] font-medium">{sec.name}</h2>
            <ul className="divide-y divide-white/10">
              {(bySection[sec.id] ?? []).map((c) => (
                <li key={c.id} className="px-4 py-2 flex items-center justify-between">
                  <span className="text-white">{c.slug}</span>
                  <button
                    type="button"
                    onClick={() => deleteCategory(c.id)}
                    className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
