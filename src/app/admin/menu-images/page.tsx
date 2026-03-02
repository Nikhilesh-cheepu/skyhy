'use client';

import { useEffect, useState } from 'react';

type MenuImage = {
  id: string;
  url: string;
  title: string | null;
  sortOrder: number;
};

type AdminImage = MenuImage & { _temp?: boolean; _saving?: boolean; _uploading?: boolean };

async function processImageToFourFive(file: File): Promise<File> {
  if (typeof window === 'undefined') return file;
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (e) => reject(e);
    image.src = dataUrl;
  });

  const targetRatio = 4 / 5;
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  const srcRatio = srcW / srcH;
  let cropW: number;
  let cropH: number;
  let sx: number;
  let sy: number;

  if (srcRatio > targetRatio) {
    // too wide, crop sides
    cropH = srcH;
    cropW = srcH * targetRatio;
    sx = (srcW - cropW) / 2;
    sy = 0;
  } else {
    // too tall, crop top/bottom
    cropW = srcW;
    cropH = srcW / targetRatio;
    sx = 0;
    sy = (srcH - cropH) / 2;
  }

  const maxWidth = 800;
  const scale = cropW > maxWidth ? maxWidth / cropW : 1;
  const destW = Math.round(cropW * scale);
  const destH = Math.round(cropH * scale);

  const canvas = document.createElement('canvas');
  canvas.width = destW;
  canvas.height = destH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, destW, destH);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.8),
  );
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', {
    type: 'image/jpeg',
  });
}

export default function AdminMenuImagesPage() {
  const [images, setImages] = useState<AdminImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/menu-gallery')
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) setError(data.error);
        else if (Array.isArray(data)) setImages(data);
      })
      .catch(() => setError('Failed to load images'))
      .finally(() => setLoading(false));
  }, []);

  function addImage() {
    setImages((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        url: '',
        title: '',
        sortOrder: prev.length,
        _temp: true,
      },
    ]);
  }

  function updateLocal(id: string, patch: Partial<AdminImage>) {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...patch } : img)));
  }

  async function handleUpload(id: string, file: File) {
    if (file.size > 3 * 1024 * 1024) {
      // still try to compress and crop
    }
    updateLocal(id, { _uploading: true });
    try {
      const processed = await processImageToFourFive(file);
      const form = new FormData();
      form.append('file', processed);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      updateLocal(id, { url: data.url });
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      updateLocal(id, { _uploading: false });
    }
  }

  async function saveImage(img: AdminImage) {
    if (!img.url) {
      setError('Please upload an image first.');
      return;
    }
    updateLocal(img.id, { _saving: true });
    try {
      if (img._temp) {
        const res = await fetch('/api/admin/menu-gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: img.url, title: img.title }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setImages((prev) =>
          prev.map((m) => (m.id === img.id ? { ...data, _temp: false } : m)),
        );
      } else {
        const res = await fetch(`/api/admin/menu-gallery/${img.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: img.url, title: img.title }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setImages((prev) => prev.map((m) => (m.id === img.id ? data : m)));
      }
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save image');
    } finally {
      updateLocal(img.id, { _saving: false });
    }
  }

  async function deleteImage(id: string) {
    const target = images.find((i) => i.id === id);
    if (!target) return;
    if (!target._temp && !confirm('Delete this image?')) return;
    if (target._temp) {
      setImages((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    try {
      const res = await fetch(`/api/admin/menu-gallery/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setImages((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete image');
    }
  }

  async function saveOrder(nextImages: AdminImage[]) {
    setImages(nextImages);
    await Promise.all(
      nextImages.map((img, index) =>
        fetch(`/api/admin/menu-gallery/${img.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: index }),
        }),
      ),
    );
  }

  function move(id: string, direction: 'up' | 'down') {
    const idx = images.findIndex((i) => i.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === images.length - 1) return;
    const next = [...images];
    const swapWith = direction === 'up' ? idx - 1 : idx + 1;
    const tmp = next[idx];
    next[idx] = next[swapWith];
    next[swapWith] = tmp;
    saveOrder(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Menu Images</h1>
          <p className="text-xs text-white/60">
            Manage the 4:5 images that appear in the “Our Menu” gallery.
          </p>
        </div>
        <button
          type="button"
          onClick={addImage}
          className="rounded-lg bg-[#4A90E2] px-3 py-1.5 text-xs font-semibold text-white"
        >
          + Add Image
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {loading && <p className="text-xs text-white/60">Loading…</p>}
      <div className="space-y-3">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/5 p-3 md:flex-row"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <button
                    type="button"
                    onClick={() => move(img.id, 'up')}
                    disabled={index === 0}
                    className="rounded-full border border-white/20 px-2 py-0.5 disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(img.id, 'down')}
                    disabled={index === images.length - 1}
                    className="rounded-full border border-white/20 px-2 py-0.5 disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <span className="text-white/50">#{index + 1}</span>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/60">Title (optional)</label>
                <input
                  value={img.title ?? ''}
                  onChange={(e) =>
                    updateLocal(img.id, { title: e.target.value || null })
                  }
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/60">
                  Image (4:5, &lt; 3MB preferred)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(img.id, file);
                  }}
                  className="w-full text-xs text-white/70 file:mr-2 file:rounded file:border-0 file:bg-[#4A90E2] file:px-3 file:py-1 file:text-white"
                />
                {img._uploading && (
                  <p className="mt-1 text-[11px] text-white/50">Uploading…</p>
                )}
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-2 md:w-40">
              <div
                className="relative w-full overflow-hidden rounded-xl border border-white/20 bg-black/40"
                style={{ aspectRatio: '4 / 5' }}
              >
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.url}
                    alt={img.title ?? 'Menu image'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[11px] text-white/40">
                    No image
                  </div>
                )}
              </div>
              <div className="flex w-full justify-end gap-2">
                <button
                  type="button"
                  onClick={() => deleteImage(img.id)}
                  className="rounded-lg bg-red-500/15 px-3 py-1 text-[11px] font-medium text-red-300 hover:bg-red-500/25"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => saveImage(img)}
                  disabled={img._saving}
                  className="rounded-lg bg-[#4A90E2] px-3 py-1 text-[11px] font-medium text-white hover:bg-[#3a7bc8] disabled:opacity-60"
                >
                  {img._saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

