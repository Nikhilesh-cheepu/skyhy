'use client';

import { useEffect, useState } from 'react';

type EventItem = {
  id: string;
  title: string | null;
  eventDate: string | null;
  endDate: string | null;
  ticketPrice: number;
  mediaType: string;
  mediaUrl: string;
  sortOrder: number;
  isActive: boolean;
};

type AdminEvent = EventItem & {
  _temp?: boolean;
  _saving?: boolean;
  _uploading?: boolean;
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/events')
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) setError(data.error);
        else if (Array.isArray(data)) setEvents(data);
      })
      .catch(() => setError('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  function addEvent() {
    setEvents((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        title: '',
        eventDate: null,
        endDate: null,
        ticketPrice: 0,
        mediaType: 'image',
        mediaUrl: '',
        sortOrder: prev.length,
        isActive: true,
        _temp: true,
      },
    ]);
  }

  function updateLocal(id: string, patch: Partial<AdminEvent>) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
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

  async function saveEvent(ev: AdminEvent) {
    if (!ev.mediaUrl) {
      setError('Media is required for an event.');
      return;
    }
    updateLocal(ev.id, { _saving: true });
    try {
      const body = {
        title: ev.title?.trim() || null,
        eventDate: ev.eventDate,
        endDate: ev.endDate,
        ticketPrice: ev.ticketPrice ?? 0,
        mediaType: ev.mediaType,
        mediaUrl: ev.mediaUrl,
        isActive: ev.isActive,
      };
      if (ev._temp) {
        const res = await fetch('/api/admin/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setEvents((prev) =>
          prev.map((e) => (e.id === ev.id ? { ...data, _temp: false } : e)),
        );
      } else {
        const res = await fetch(`/api/admin/events/${ev.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setEvents((prev) => prev.map((e) => (e.id === ev.id ? data : e)));
      }
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save event');
    } finally {
      updateLocal(ev.id, { _saving: false });
    }
  }

  async function deleteEvent(id: string) {
    const target = events.find((e) => e.id === id);
    if (!target) return;
    if (!target._temp && !confirm('Delete this event?')) return;
    if (target._temp) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
      return;
    }
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete event');
    }
  }

  async function saveOrder(nextEvents: AdminEvent[]) {
    setEvents(nextEvents);
    await Promise.all(
      nextEvents.map((ev, index) =>
        fetch(`/api/admin/events/${ev.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: index }),
        }),
      ),
    );
  }

  function move(id: string, direction: 'up' | 'down') {
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === events.length - 1) return;
    const next = [...events];
    const swapWith = direction === 'up' ? idx - 1 : idx + 1;
    const tmp = next[idx];
    next[idx] = next[swapWith];
    next[swapWith] = tmp;
    saveOrder(next);
  }

  const now = new Date();
  const activeEvents = events.filter((ev) => {
    if (!ev.endDate) return ev.isActive;
    const end = new Date(ev.endDate);
    return ev.isActive && end >= now;
  });
  const expiredEvents = events.filter((ev) => !activeEvents.includes(ev));

  return (
    <div className="space-y-4 text-sm text-white/90">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#050608] px-3 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.9)]">
        <div>
          <h1 className="text-sm font-semibold text-white">Events Carousel</h1>
          <p className="text-xs text-white/60">
            Manage flyers/videos for the /events page. Sorted top to bottom.
          </p>
        </div>
        <button
          type="button"
          onClick={addEvent}
          className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-semibold text-black shadow hover:from-amber-400 hover:to-orange-400"
        >
          + Add Event
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {loading && <p className="text-xs text-white/60">Loading…</p>}
      <div className="space-y-4">
        {activeEvents.length > 0 && (
          <p className="text-xs font-semibold text-white/70">Active Events</p>
        )}
        {activeEvents.map((ev, index) => (
          <div
            key={ev.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/70 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.9)] md:flex-row"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <button
                    type="button"
                    onClick={() => move(ev.id, 'up')}
                    disabled={index === 0}
                    className="rounded-full border border-white/20 px-2 py-0.5 disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(ev.id, 'down')}
                    disabled={index === events.length - 1}
                    className="rounded-full border border-white/20 px-2 py-0.5 disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <span className="text-white/50">#{index + 1}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={ev.isActive}
                      onChange={(e) =>
                        updateLocal(ev.id, { isActive: e.target.checked })
                      }
                      className="h-3 w-3 rounded border-white/30 bg-black/40"
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/60">Title</label>
                <input
                  value={ev.title ?? ''}
                  onChange={(e) =>
                    updateLocal(ev.id, { title: e.target.value || null })
                  }
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-white/60">
                    Event Date (optional)
                  </label>
                  <input
                    type="date"
                    value={ev.eventDate ? ev.eventDate.slice(0, 10) : ''}
                    onChange={(e) =>
                      updateLocal(ev.id, {
                        eventDate: e.target.value || null,
                      })
                    }
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div className="w-28">
                  <label className="mb-1 block text-xs text-white/60">
                    Ticket Price
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={ev.ticketPrice ?? 0}
                    onChange={(e) =>
                      updateLocal(ev.id, {
                        ticketPrice: Number(e.target.value || 0),
                      })
                    }
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-white/60">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={ev.endDate ? ev.endDate.slice(0, 10) : ''}
                    onChange={(e) =>
                      updateLocal(ev.id, {
                        endDate: e.target.value || null,
                      })
                    }
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-white/60">
                    Media (9:16, &lt; 3MB)
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(ev.id, file);
                    }}
                    className="w-full text-xs text-white/70 file:mr-2 file:rounded file:border-0 file:bg-[#4A90E2] file:px-3 file:py-1 file:text-white"
                  />
                  {ev._uploading && (
                    <p className="mt-1 text-[11px] text-white/50">Uploading…</p>
                  )}
                </div>
                <div className="w-24">
                  <label className="mb-1 block text-xs text-white/60">Type</label>
                  <select
                    value={ev.mediaType}
                    onChange={(e) =>
                      updateLocal(ev.id, { mediaType: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-2 py-2 text-xs text-white"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-2 md:w-40">
              <div
                className="relative w-full overflow-hidden rounded-xl bg-black/40"
                style={{ aspectRatio: '9 / 16' }}
              >
                {ev.mediaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ev.mediaUrl}
                    alt={ev.title ?? 'Event media'}
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
                  onClick={() => deleteEvent(ev.id)}
                  className="rounded-lg bg-red-500/15 px-3 py-1 text-[11px] font-medium text-red-300 hover:bg-red-500/25"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => saveEvent(ev)}
                  disabled={ev._saving}
                  className="rounded-lg bg-[#4A90E2] px-3 py-1 text-[11px] font-medium text-white hover:bg-[#3a7bc8] disabled:opacity-60"
                >
                  {ev._saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {expiredEvents.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-white/70">Expired Events</p>
          {expiredEvents.map((ev, index) => (
            <div
              key={ev.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-black/50 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.7)] md:flex-row"
            >
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold text-white">
                  {ev.title || "Untitled event"}
                </p>
                {ev.eventDate && (
                  <p className="text-[11px] text-white/60">
                    Date:{" "}
                    {new Date(ev.eventDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
                {ev.endDate && (
                  <p className="text-[11px] text-white/60">
                    Ended on{" "}
                    {new Date(ev.endDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateLocal(ev.id, { isActive: true })}
                  className="rounded-full border border-white/20 px-3 py-1 text-[11px]"
                >
                  Reactivate
                </button>
                <button
                  type="button"
                  onClick={() => deleteEvent(ev.id)}
                  className="rounded-full border border-red-400/50 bg-red-500/10 px-3 py-1 text-[11px] text-red-200"
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
}

