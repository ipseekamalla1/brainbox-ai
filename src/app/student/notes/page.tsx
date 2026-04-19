// src/app/(dashboard)/student/notes/page.tsx — Student Notes Browser

"use client";

import { useState, useEffect } from "react";

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
  uploader?: { name: string };
}

export default function StudentNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      if (data.success) setNotes(data.data);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = filter
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(filter.toLowerCase()) ||
          n.subject.toLowerCase().includes(filter.toLowerCase()) ||
          n.topic?.toLowerCase().includes(filter.toLowerCase())
      )
    : notes;

  const subjects = [...new Set(notes.map((n) => n.subject))];

  const fileTypeIcon: Record<string, string> = {
    pdf: "📕", docx: "📘", doc: "📘", pptx: "📙", ppt: "📙",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold">Notes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse course materials uploaded by your teachers
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {subjects.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                !filter ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {subjects.slice(0, 5).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filter === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-shimmer" />
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-3xl mb-3">📚</p>
          <p className="text-sm text-muted-foreground">
            {filter ? "No notes match your search." : "No notes available yet."}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                  {fileTypeIcon[note.fileType] || "📄"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate">{note.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {note.subject}{note.topic ? ` · ${note.topic}` : ""}
                  </p>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-muted text-muted-foreground flex-shrink-0">
                  {note.fileType}
                </span>
              </div>

              {note.uploader && (
                <p className="text-xs text-muted-foreground mb-3">
                  By {note.uploader.name} · {new Date(note.createdAt).toLocaleDateString()}
                </p>
              )}

              {/* AI Summary Preview */}
              {note.summary && (
                <div className="mb-3">
                  <button
                    onClick={() => setExpandedSummary(expandedSummary === note.id ? null : note.id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 hover:underline"
                  >
                    🧠 AI Summary
                    <span className="text-[10px]">{expandedSummary === note.id ? "▲" : "▼"}</span>
                  </button>
                  {expandedSummary === note.id && (
                    <div className="mt-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-xs text-muted-foreground leading-relaxed">
                      {note.summary}
                    </div>
                  )}
                </div>
              )}

              <a
                href={note.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
              >
                Open File ↗
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}