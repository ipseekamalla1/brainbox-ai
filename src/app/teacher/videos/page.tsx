// src/app/(dashboard)/teacher/videos/page.tsx — Teacher Video Management

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  createdAt: string;
}

export default function TeacherVideosPage() {
  const { data: session } = useSession();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    url: "",
    duration: "",
  });

  const fetchVideos = useCallback(async () => {
    try {
      const res = await fetch("/api/videos");
      const data = await res.json();
      if (data.success) setVideos(data.data);
    } catch (err) {
      console.error("Failed to fetch videos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) fetchVideos();
  }, [session?.user?.id, fetchVideos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.url) return;
    setSaving(true);

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          url: form.url,
          duration: form.duration ? parseInt(form.duration) * 60 : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setVideos((prev) => [data.data, ...prev]);
        setShowAdd(false);
        setForm({ title: "", description: "", url: "", duration: "" });
      }
    } catch (err) {
      console.error("Failed to create video:", err);
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Extract YouTube embed URL
  const getEmbedUrl = (url: string) => {
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return url;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold">Videos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload or embed course videos
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          {showAdd ? "Cancel" : "+ Add Video"}
        </button>
      </div>

      {/* Add Video Form */}
      {showAdd && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 rounded-2xl border border-border bg-card space-y-4"
        >
          <h2 className="font-semibold text-base mb-2">Add New Video</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Video title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Duration (minutes)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. 45"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Video URL *</label>
            <input
              type="url"
              required
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="YouTube URL or direct video link"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supports YouTube links, Vimeo, or direct video URLs
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              rows={3}
              placeholder="Optional description..."
            />
          </div>

          {/* Preview */}
          {form.url && form.url.includes("youtube") && (
            <div className="rounded-lg overflow-hidden border border-border aspect-video max-w-md">
              <iframe
                src={getEmbedUrl(form.url)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                allowFullScreen
                title="Video preview"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add Video"}
          </button>
        </form>
      )}

      {/* Videos List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-shimmer" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-3xl mb-3">🎥</p>
          <p className="text-sm text-muted-foreground mb-4">
            No videos added yet. Add your first video to get started.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="text-sm text-primary font-medium hover:underline"
          >
            Add Video →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-xl flex-shrink-0">
                🎥
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate">{video.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {video.duration && (
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(video.duration)}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    · {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary font-medium hover:underline"
              >
                Watch ↗
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}