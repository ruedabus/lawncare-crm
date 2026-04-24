"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type PhotoType = "before" | "after";

type JobPhoto = {
  id: string;
  type: PhotoType;
  storage_path: string;
  created_at: string;
  url: string | null;
};

const TYPE_LABELS: Record<PhotoType, string> = {
  before: "Before",
  after: "After",
};

const TYPE_STYLES: Record<PhotoType, string> = {
  before: "bg-amber-50 text-amber-700 border-amber-200",
  after: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function JobPhotos({ jobId, planName = "basic" }: { jobId: string; planName?: string }) {
  const isLocked = planName === "basic";
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<PhotoType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = useCallback(async () => {
    const res = await fetch(`/api/jobs/${jobId}/photos`);
    if (res.ok) {
      const data = await res.json();
      setPhotos(data.photos ?? []);
    }
    setLoading(false);
  }, [jobId]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  async function handleUpload(file: File, type: PhotoType) {
    setUploading(type);
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);

    const res = await fetch(`/api/jobs/${jobId}/photos`, { method: "POST", body: form });
    if (res.ok) {
      const data = await res.json();
      setPhotos((prev) => [...prev, data.photo]);
    }
    setUploading(null);
  }

  async function handleDelete(photoId: string) {
    if (!confirm("Delete this photo?")) return;
    setDeletingId(photoId);
    await fetch(`/api/jobs/${jobId}/photos/${photoId}`, { method: "DELETE" });
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setDeletingId(null);
  }

  const beforePhotos = photos.filter((p) => p.type === "before");
  const afterPhotos = photos.filter((p) => p.type === "after");

  if (loading) return null;

  if (isLocked) {
    return (
      <div className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
        <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-amber-800">Before &amp; after photos — Pro &amp; Premier</p>
          <p className="mt-0.5 text-xs text-amber-700">
            Capture job photos from the field and automatically send them to customers when the job is complete.
          </p>
          <a href="/settings?tab=billing" className="mt-1.5 inline-block text-xs font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900">
            Upgrade your plan →
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Job Photos
        </p>

        <div className="grid grid-cols-2 gap-3">
          {(["before", "after"] as PhotoType[]).map((type) => {
            const typePhotos = type === "before" ? beforePhotos : afterPhotos;
            const inputRef = type === "before" ? beforeRef : afterRef;
            const isUploading = uploading === type;

            return (
              <div key={type}>
                <div className="mb-2 flex items-center justify-between">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${TYPE_STYLES[type]}`}>
                    {TYPE_LABELS[type]}
                  </span>
                  <button
                    onClick={() => inputRef.current?.click()}
                    disabled={isUploading}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    {isUploading ? "Uploading…" : "+ Add"}
                  </button>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, type);
                      e.target.value = "";
                    }}
                  />
                </div>

                {typePhotos.length === 0 ? (
                  <button
                    onClick={() => inputRef.current?.click()}
                    disabled={isUploading}
                    className="flex h-24 w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400 transition hover:border-slate-300 hover:bg-slate-100 disabled:opacity-50"
                  >
                    {isUploading ? "Uploading…" : "Tap to upload"}
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    {typePhotos.map((photo) => (
                      <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        {photo.url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={photo.url}
                            alt={`${type} photo`}
                            className="h-full w-full cursor-pointer object-cover transition hover:opacity-90"
                            onClick={() => setLightbox(photo.url)}
                          />
                        )}
                        <button
                          onClick={() => handleDelete(photo.id)}
                          disabled={deletingId === photo.id}
                          className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow group-hover:flex"
                          title="Delete photo"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {/* Extra upload slot */}
                    <button
                      onClick={() => inputRef.current?.click()}
                      disabled={isUploading}
                      className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400 transition hover:border-slate-300 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Photo preview"
            className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
