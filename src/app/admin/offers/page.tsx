'use client';

import { useEffect, useState } from 'react';

type Offer = {
  id: string;
  title: string;
  ctaType: 'VIEW_MENU' | 'BOOK_TICKETS' | 'VIEW_PACKAGES';
  mediaType: string;
  mediaUrl: string;
  sortOrder: number;
};

type AdminOffer = Offer & { _temp?: boolean; _saving?: boolean; _uploading?: boolean };

const CTA_LABELS: Record<Offer['ctaType'], string> = {
  VIEW_MENU: 'View Menu',
  BOOK_TICKETS: 'Book Tickets',
  VIEW_PACKAGES: 'View Party Packages',
};

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<AdminOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/offers')
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) setError(data.error);
        else if (Array.isArray(data)) setOffers(data);
      })
      .catch(() => setError('Failed to load offers'))
      .finally(() => setLoading(false));
  }, []);

  function addOffer() {
    if (offers.length >= 3) return;
    setOffers((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        title: '',
        ctaType: 'VIEW_MENU',
        mediaType: 'image',
        mediaUrl: '',
        sortOrder: prev.length,
        _temp: true,
      },
    ]);
  }

  function updateLocal(id: string, patch: Partial<AdminOffer>) {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  async function handleUpload(id: string, file: File) {
    if (file.size > 3 * 1024 * 1024) {
      setError('Please upload files under 3MB for best performance.');
      return;
    }
    updateLocal(id, { _uploading: true });
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      updateLocal(id, {
        mediaUrl: data.url,
        mediaType: file.type.startsWith('video') ? 'video' : 'image',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      updateLocal(id, { _uploading: false });
    }
  }

  async function saveOffer(offer: AdminOffer) {
    if (!offer.title.trim() || !offer.mediaUrl) {
      setError('Title and media are required.');
      return;
    }
    updateLocal(offer.id, { _saving: true });
    try {
      if (offer._temp) {
        const res = await fetch('/api/admin/offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: offer.title.trim(),
            ctaType: offer.ctaType,
            mediaType: offer.mediaType,
            mediaUrl: offer.mediaUrl,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setOffers((prev) =>
          prev.map((o) => (o.id === offer.id ? { ...data, _temp: false } : o)),
        );
      } else {
        const res = await fetch(`/api/admin/offers/${offer.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: offer.title.trim(),
            ctaType: offer.ctaType,
            mediaType: offer.mediaType,
            mediaUrl: offer.mediaUrl,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setOffers((prev) => prev.map((o) => (o.id === offer.id ? data : o)));
      }
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save offer');
    } finally {
      updateLocal(offer.id, { _saving: false });
    }
  }

  async function deleteOffer(id: string) {
    const target = offers.find((o) => o.id === id);
    if (!target) return;
    if (!target._temp && !confirm('Delete this offer?')) return;
    if (target._temp) {
      setOffers((prev) => prev.filter((o) => o.id !== id));
      return;
    }
    try {
      const res = await fetch(`/api/admin/offers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOffers((prev) => prev.filter((o) => o.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete offer');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Homepage Offers</h1>
          <p className="text-xs text-white/60">
            Manage the 9:16 cards shown on the home “Offers &amp; Discounts” carousel.
          </p>
        </div>
        <button
          type="button"
          onClick={addOffer}
          disabled={offers.length >= 3}
          className="rounded-lg bg-[#4A90E2] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
        >
          + Add Offer
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {loading && <p className="text-xs text-white/60">Loading…</p>}
      <div className="space-y-3">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/5 p-3 md:flex-row"
          >
            <div className="flex-1 space-y-2">
              <div>
                <label className="mb-1 block text-xs text-white/60">Title</label>
                <input
                  value={offer.title}
                  onChange={(e) => updateLocal(offer.id, { title: e.target.value })}
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-white/60">CTA</label>
                  <select
                    value={offer.ctaType}
                    onChange={(e) =>
                      updateLocal(offer.id, {
                        ctaType: e.target.value as Offer['ctaType'],
                      })
                    }
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-2 py-2 text-xs text-white"
                  >
                    {(Object.keys(CTA_LABELS) as Offer['ctaType'][]).map((key) => (
                      <option key={key} value={key}>
                        {CTA_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="mb-1 block text-xs text-white/60">Type</label>
                  <select
                    value={offer.mediaType}
                    onChange={(e) => updateLocal(offer.id, { mediaType: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-2 py-2 text-xs text-white"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/60">
                  Media (9:16, &lt; 3MB recommended)
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(offer.id, file);
                  }}
                  className="w-full text-xs text-white/70 file:mr-2 file:rounded file:border-0 file:bg-[#4A90E2] file:px-3 file:py-1 file:text-white"
                />
                {offer._uploading && (
                  <p className="mt-1 text-[11px] text-white/50">Uploading…</p>
                )}
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-2 md:w-40">
              <div
                className="relative w-full overflow-hidden rounded-xl bg-black/40"
                style={{ aspectRatio: '9 / 16' }}
              >
                {offer.mediaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={offer.mediaUrl}
                    alt={offer.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[11px] text-white/40">
                    No media
                  </div>
                )}
              </div>
              <div className="flex w-full justify-end gap-2">
                <button
                  type="button"
                  onClick={() => deleteOffer(offer.id)}
                  className="rounded-lg bg-red-500/15 px-3 py-1 text-[11px] font-medium text-red-300 hover:bg-red-500/25"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => saveOffer(offer)}
                  disabled={offer._saving}
                  className="rounded-lg bg-[#4A90E2] px-3 py-1 text-[11px] font-medium text-white hover:bg-[#3a7bc8] disabled:opacity-60"
                >
                  {offer._saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

