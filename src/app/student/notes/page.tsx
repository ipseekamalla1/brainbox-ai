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
      setLoading(true);

      const res = await fetch("/api/notes", {
        credentials: "include",
      });

      const data = await res.json();

      console.log("NOTES API RESPONSE:", data);

      if (data.success) {
        setNotes(data.data || []);
      } else {
        console.error("API error:", data.error);
        setNotes([]);
      }
    } catch (err) {
      console.error("Failed to fetch notes:", err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = filter
    ? notes.filter((n) =>
        n.title.toLowerCase().includes(filter.toLowerCase()) ||
        n.subject.toLowerCase().includes(filter.toLowerCase()) ||
        n.topic?.toLowerCase().includes(filter.toLowerCase())
      )
    : notes;

  const subjects = [...new Set(notes.map((n) => n.subject))];

  const fileTypeIcon: Record<string, string> = {
    pdf: "📕",
    docx: "📘",
    doc: "📘",
    pptx: "📙",
    ppt: "📙",
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold">Notes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse course materials uploaded by your teachers
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search notes..."
          className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm"
        />

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("")}
            className="px-3 py-1.5 rounded-lg text-xs border"
          >
            All
          </button>

          {subjects.slice(0, 5).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs border"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="p-12 text-center border rounded-xl">
          <p className="text-2xl">📚</p>
          <p className="text-sm text-muted-foreground mt-2">
            No notes found
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-xl border bg-card"
            >
              {/* Top row */}
              <div className="flex gap-3">
                <div className="text-xl">
                  {fileTypeIcon[note.fileType] || "📄"}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-sm">
                    {note.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {note.subject}
                    {note.topic ? ` · ${note.topic}` : ""}
                  </p>
                </div>

                <span className="text-xs uppercase">
                  {note.fileType}
                </span>
              </div>

              {/* Uploader */}
              {note.uploader && (
                <p className="text-xs mt-2 text-muted-foreground">
                  By {note.uploader.name} ·{" "}
                  {new Date(note.createdAt).toLocaleDateString()}
                </p>
              )}

              {/* File link */}
              <a
                href={note.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 mt-3 inline-block"
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