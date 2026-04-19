// src/app/(dashboard)/teacher/notes/page.tsx — Teacher Notes Management

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import FileUpload from "@/components/ui/FileUpload";

interface Note {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  summary?: string;
  createdAt: string;
}

export default function TeacherNotesPage() {
  const { data: session } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [form, setForm] = useState({ title: "", subject: "", topic: "" });
  const [pendingFile, setPendingFile] = useState<{ url: string; name: string; size: number } | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/notes?uploadedBy=" + session?.user?.id);
      const data = await res.json();
      if (data.success) setNotes(data.data);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) fetchNotes();
  }, [session?.user?.id, fetchNotes]);

  const handleSaveNote = async () => {
    if (!pendingFile || !form.title || !form.subject) return;
    setSaving(true);

    try {
      const ext = pendingFile.name.split(".").pop()?.toLowerCase() || "pdf";
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          subject: form.subject,
          topic: form.topic || undefined,
          fileUrl: pendingFile.url,
          fileType: ext,
          fileSize: pendingFile.size,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNotes((prev) => [data.data, ...prev]);
        setShowUpload(false);
        setForm({ title: "", subject: "", topic: "" });
        setPendingFile(null);
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSaving(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const fileTypeIcon: Record<string, string> = {
    pdf: "📕", docx: "📘", doc: "📘", pptx: "📙", ppt: "📙",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold">Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload and manage course materials
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          {showUpload ? "Cancel" : "+ Upload Note"}
        </button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="mb-8 p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-semibold text-base mb-4">Upload New Note</h2>

          <FileUpload
            type="notes"
            userId={session?.user?.id || ""}
            accept=".pdf,.docx,.pptx,.doc,.ppt"
            maxSizeMB={50}
            onUploadComplete={(url, name, size) => {
              setPendingFile({ url, name, size });
              // Auto-fill title from filename
              if (!form.title) {
                setForm((f) => ({
                  ...f,
                  title: name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "),
                }));
              }
            }}
            onError={(err) => setUploadError(err)}
          />

          {uploadError && (
            <p className="text-sm text-destructive mt-3">{uploadError}</p>
          )}

          {pendingFile && (
            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-xl">
                  {fileTypeIcon[pendingFile.name.split(".").pop()?.toLowerCase() || ""] || "📄"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{pendingFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(pendingFile.size)}</p>
                </div>
                <span className="text-xs font-semibold text-primary">Uploaded ✓</span>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Note title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Subject *</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Topic</label>
                  <input
                    type="text"
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g. Data Structures"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveNote}
                disabled={saving || !form.title || !form.subject}
                className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Note"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notes List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-shimmer" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-3xl mb-3">📚</p>
          <p className="text-sm text-muted-foreground mb-4">
            No notes uploaded yet. Upload your first note to get started.
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="text-sm text-primary font-medium hover:underline"
          >
            Upload Note →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                {fileTypeIcon[note.fileType] || "📄"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate">{note.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{note.subject}</span>
                  {note.topic && (
                    <>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{note.topic}</span>
                    </>
                  )}
                  {note.fileSize && (
                    <>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{formatFileSize(note.fileSize)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {note.summary && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Summarized
                  </span>
                )}
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                  {note.fileType}
                </span>
                <a
                  href={note.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  View ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}