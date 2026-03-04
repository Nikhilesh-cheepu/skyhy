 'use client';

import { useEffect, useMemo, useState } from 'react';

type AdminEvent = {
  id: string;
  endDate: string | null;
  ticketPrice: number;
  mediaUrl: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ToastState =
  | {
      message: string;
      variant: 'success' | 'error';
    }
  | null;

function formatDateTimeLabel(iso: string | null): string {
  if (!iso) return 'No end date';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'No end date';
  const date = d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const prefix = d.getTime() <= Date.now() ? 'Ended' : 'Ends';
  return `${prefix} ${date}, ${time}`;
}

function toLocalInputValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hour = pad(d.getHours());
  const minute = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  const [newPosterUrl, setNewPosterUrl] = useState('');
  const [newUploading, setNewUploading] = useState(false);
  const [newTicketPrice, setNewTicketPrice] = useState<string>('0');
  const [newEndDate, setNewEndDate] = useState<string>('');
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTicketPrice, setEditTicketPrice] = useState<string>('0');
  const [editEndDate, setEditEndDate] = useState<string>('');
  const [editPosterUrl, setEditPosterUrl] = useState<string>('');
  const [editUploading, setEditUploading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminEvent | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/events')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.error) setError(data.error);
        else if (Array.isArray(data)) setEvents(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load events');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function uploadPoster(
    file: File,
    opts: { forEdit?: boolean } = {},
  ): Promise<string | null> {
    if (file.size > 3 * 1024 * 1024) {
      setError('Please upload files under 3MB for best performance.');
      setToast({ message: 'File too large (max 3MB).', variant: 'error' });
      return null;
    }
    if (opts.forEdit) setEditUploading(true);
    else setNewUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok || data?.error) {
        throw new Error(data?.error || 'Upload failed');
      }
      return data.url as string;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Upload failed';
      setError(message);
      setToast({ message, variant: 'error' });
      return null;
    } finally {
      if (opts.forEdit) setEditUploading(false);
      else setNewUploading(false);
    }
  }

  const now = useMemo(() => new Date(), []);

  const activeEvents = useMemo(
    () =>
      events.filter((ev) => {
        if (ev.isActive === false) return false;
        if (!ev.endDate) return true;
        const end = new Date(ev.endDate);
        return !Number.isNaN(end.getTime()) && end.getTime() > now.getTime();
      }),
    [events, now],
  );

  const expiredEvents = useMemo(
    () => events.filter((ev) => !activeEvents.some((a) => a.id === ev.id)),
    [events, activeEvents],
  );

  const canAdd =
    !!newPosterUrl &&
    !newUploading &&
    !adding &&
    newTicketPrice.trim() !== '' &&
    !Number.isNaN(Number(newTicketPrice)) &&
    Number(newTicketPrice) >= 0;

  async function handleAdd() {
    if (!canAdd) return;
    setAdding(true);
    setError('');
    try {
      const body = {
        ticketPrice: Number(newTicketPrice) || 0,
        endDate: newEndDate || '',
        mediaType: 'image',
        mediaUrl: newPosterUrl,
        isActive: true,
      };
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        throw new Error(data?.error || 'Failed to add event');
      }
      setEvents((prev) => [data, ...prev]);
      setToast({ message: 'Event added.', variant: 'success' });
      setNewPosterUrl('');
      setNewTicketPrice('0');
      setNewEndDate('');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to add event';
      setError(message);
      setToast({ message, variant: 'error' });
    } finally {
      setAdding(false);
    }
  }

  function startEdit(ev: AdminEvent) {
    setEditingId(ev.id);
    setEditTicketPrice(String(ev.ticketPrice ?? 0));
    setEditEndDate(toLocalInputValue(ev.endDate));
    setEditPosterUrl(ev.mediaUrl);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTicketPrice('0');
    setEditEndDate('');
    setEditPosterUrl('');
  }

  async function saveEdit() {
    if (!editingId) return;
    const priceNumber = Number(editTicketPrice);
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      setToast({ message: 'Ticket price must be 0 or more.', variant: 'error' });
      return;
    }
    setEditSaving(true);
    setError('');
    try {
      const body = {
        ticketPrice: priceNumber,
        endDate: editEndDate || '',
        mediaUrl: editPosterUrl,
      };
      const res = await fetch(`/api/admin/events/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        throw new Error(data?.error || 'Failed to update event');
      }
      setEvents((prev) => prev.map((ev) => (ev.id === editingId ? data : ev)));
      setToast({ message: 'Event updated.', variant: 'success' });
      cancelEdit();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update event';
      setError(message);
      setToast({ message, variant: 'error' });
    } finally {
      setEditSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/events/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        throw new Error(data?.error || 'Failed to delete event');
      }
      setEvents((prev) => prev.filter((ev) => ev.id !== deleteTarget.id));
      setToast({ message: 'Event deleted.', variant: 'success' });
      setDeleteTarget(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete event';
      setError(message);
      setToast({ message, variant: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-5 text-sm text-white/90">
      <div className="space-y-1">
        <h1 className="text-base font-semibold text-white">Events &amp; Offers</h1>
        <p className="text-xs text-white/60">
          Posters show in the hero carousel. Leave end date empty for no expiry.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/60 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.9)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
          Add event
        </p>
        <div className="mt-3 space-y-4">
          <div className="flex gap-3">
            <div
              className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-dashed border-white/20 bg-black/60"
              style={{ aspectRatio: '9 / 16' }}
            >
              {newPosterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={newPosterUrl}
                  alt="Event poster preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center px-2 text-[10px] text-white/40">
                  <span className="mb-0.5 text-lg">+</span>
                  9:16 poster
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="block text-[11px] font-medium text-white/70">
                Poster *
              </label>
              <p className="text-[11px] text-white/50">
                JPG/PNG/WebP. Auto-crops to 9:16 and converts to WebP. Stored on Vercel
                Blob.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadPoster(file);
                  if (url) setNewPosterUrl(url);
                }}
                className="mt-1 w-full text-[11px] text-white/80 file:mr-2 file:rounded-full file:border-0 file:bg-sky-500 file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-black hover:file:bg-sky-400"
              />
              {newUploading && (
                <p className="text-[11px] text-white/50">Uploading poster…</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-white/70">
              Ticket price (₹)
            </label>
            <input
              type="number"
              min={0}
              value={newTicketPrice}
              onChange={(e) => setNewTicketPrice(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/70 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-600/60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-white/70">
              End date &amp; time (optional)
            </label>
            <input
              type="datetime-local"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              onKeyDown={(e) => {
                // Prevent manual typing; use the native picker only.
                e.preventDefault();
              }}
              className="w-full rounded-xl border border-white/15 bg-black/70 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-600/60"
            />
            <p className="text-[11px] text-white/50">
              Leave empty for no expiry. Past end date = offer hidden on site and shown
              under Expired.
            </p>
          </div>

          <button
            type="button"
            disabled={!canAdd}
            onClick={handleAdd}
            className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
          >
            {adding ? 'Adding…' : 'Add event'}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
      {loading && <p className="text-xs text-white/60">Loading events…</p>}

      <div className="space-y-2">
        <p className="text-xs font-semibold text-white/70">Active</p>
        {activeEvents.length === 0 && !loading && (
          <p className="text-[11px] text-white/50">No active events.</p>
        )}
        <div className="space-y-2">
          {activeEvents.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/70 p-3 shadow-[0_12px_32px_rgba(0,0,0,0.9)]"
            >
              <div
                className="relative h-20 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-black/60"
                style={{ aspectRatio: '9 / 16' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ev.mediaUrl}
                  alt="Event poster"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[13px] font-medium text-white">
                  {formatDateTimeLabel(ev.endDate)}
                </p>
                <p className="text-[11px] text-white/60">
                  Ticket price:{' '}
                  <span className="font-semibold text-sky-300">
                    ₹{ev.ticketPrice ?? 0}
                  </span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(ev)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs text-white hover:bg-white/10"
                >
                  ✎
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(ev)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-xs text-red-300 hover:bg-red-500/20"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-white/70">Expired</p>
        {expiredEvents.length === 0 && !loading && (
          <p className="text-[11px] text-white/50">No expired events.</p>
        )}
        <div className="space-y-2">
          {expiredEvents.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/60 p-3 opacity-80"
            >
              <div
                className="relative h-16 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-black/60"
                style={{ aspectRatio: '9 / 16' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ev.mediaUrl}
                  alt="Expired event poster"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[13px] font-medium text-white">
                  {formatDateTimeLabel(ev.endDate)}
                </p>
                <p className="text-[11px] text-white/60">
                  Ticket price:{' '}
                  <span className="font-semibold text-sky-200">
                    ₹{ev.ticketPrice ?? 0}
                  </span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(ev)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs text-white hover:bg-white/10"
                >
                  ✎
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(ev)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-xs text-red-300 hover:bg-red-500/20"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingId && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md rounded-t-3xl border border-white/15 bg-slate-950/95 p-4 shadow-[0_-18px_40px_rgba(0,0,0,1)] backdrop-blur-xl">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/15" />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
            Edit event
          </p>
          <div className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-white/70">
                Ticket price (₹)
              </label>
              <input
                type="number"
                min={0}
                value={editTicketPrice}
                onChange={(e) => setEditTicketPrice(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/80 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-600/60"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-white/70">
                End date &amp; time (optional)
              </label>
              <input
                type="datetime-local"
                value={editEndDate}
                onChange={(e) => setEditEndDate(e.target.value)}
                onKeyDown={(e) => {
                  // Prevent manual typing; use the native picker only.
                  e.preventDefault();
                }}
                className="w-full rounded-xl border border-white/15 bg-black/80 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-600/60"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-white/70">
                Replace poster (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadPoster(file, { forEdit: true });
                  if (url) setEditPosterUrl(url);
                }}
                className="w-full text-[11px] text-white/80 file:mr-2 file:rounded-full file:border-0 file:bg-sky-500 file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-black hover:file:bg-sky-400"
              />
              {editUploading && (
                <p className="text-[11px] text-white/50">Uploading poster…</p>
              )}
            </div>
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

      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-slate-950/95 p-4 shadow-[0_18px_40px_rgba(0,0,0,1)]">
            <p className="text-sm font-semibold text-white">Delete event?</p>
            <p className="mt-1 text-[12px] text-white/60">
              This will remove the poster from the events carousel. This action cannot be
              undone.
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

