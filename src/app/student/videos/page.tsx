// src/app/(dashboard)/student/videos/page.tsx — Student Video Player with Progress

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface VideoItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  duration?: number;
  createdAt: string;
  uploader?: { name: string };
  progress?: {
    watchedSeconds: number;
    completed: boolean;
  } | null;
}

export default function StudentVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchVideos();
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/videos");
      const data = await res.json();
      if (data.success) setVideos(data.data);
    } catch (err) {
      console.error("Failed to fetch videos:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = useCallback(async (videoId: string, seconds: number, duration?: number) => {
    try {
      await fetch("/api/videos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          watchedSeconds: Math.floor(seconds),
          duration,
        }),
      });
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  }, []);

  const handlePlay = (video: VideoItem) => {
    setActiveVideo(video);

    // Set up progress tracking every 10 seconds
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        updateProgress(
          video.id,
          videoRef.current.currentTime,
          video.duration || videoRef.current.duration
        );
      }
    }, 10000);
  };

  const handleVideoEnd = () => {
    if (activeVideo && videoRef.current) {
      updateProgress(
        activeVideo.id,
        videoRef.current.duration,
        videoRef.current.duration
      );
      // Update local state
      setVideos((prev) =>
        prev.map((v) =>
          v.id === activeVideo.id
            ? { ...v, progress: { watchedSeconds: videoRef.current!.duration, completed: true } }
            : v
        )
      );
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercent = (video: VideoItem) => {
    if (!video.progress || !video.duration) return 0;
    return Math.min(100, Math.round((video.progress.watchedSeconds / video.duration) * 100));
  };

  // Extract YouTube embed URL
  const isYouTube = (url: string) =>
    url.includes("youtube.com") || url.includes("youtu.be");

  const getEmbedUrl = (url: string) => {
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    return url;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold">Videos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Watch course videos and track your progress
        </p>
      </div>

      {/* Active Video Player */}
      {activeVideo && (
        <div className="mb-8 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="aspect-video bg-black">
            {isYouTube(activeVideo.url) ? (
              <iframe
                src={getEmbedUrl(activeVideo.url)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={activeVideo.title}
              />
            ) : (
              <video
                ref={videoRef}
                src={activeVideo.url}
                controls
                autoPlay
                onEnded={handleVideoEnd}
                className="w-full h-full"
              />
            )}
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-base">{activeVideo.title}</h2>
                {activeVideo.uploader && (
                  <p className="text-xs text-muted-foreground mt-1">
                    By {activeVideo.uploader.name}
                    {activeVideo.duration && ` · ${formatDuration(activeVideo.duration)}`}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setActiveVideo(null);
                  if (progressInterval.current) clearInterval(progressInterval.current);
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕ Close
              </button>
            </div>
            {activeVideo.description && (
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                {activeVideo.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Videos Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-shimmer" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-3xl mb-3">🎥</p>
          <p className="text-sm text-muted-foreground">
            No videos available yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {videos.map((video) => {
            const progress = getProgressPercent(video);
            const isCompleted = video.progress?.completed;

            return (
              <button
                key={video.id}
                onClick={() => handlePlay(video)}
                className={`text-left p-5 rounded-xl border bg-card hover:border-primary/20 transition-all ${
                  activeVideo?.id === video.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-xl flex-shrink-0">
                    {isCompleted ? "✅" : "🎥"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{video.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {video.uploader?.name || "Teacher"}
                      {video.duration ? ` · ${formatDuration(video.duration)}` : ""}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                {video.duration && video.progress && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDuration(video.progress.watchedSeconds)} / {formatDuration(video.duration)}
                      </span>
                      <span className={`text-[10px] font-semibold ${isCompleted ? "text-emerald-500" : "text-primary"}`}>
                        {isCompleted ? "Completed" : `${progress}%`}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCompleted ? "bg-emerald-500" : "bg-primary"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {!video.progress && (
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Not started · Tap to watch
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}