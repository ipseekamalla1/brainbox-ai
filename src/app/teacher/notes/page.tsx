"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import FileUpload from "@/components/ui/FileUpload";
import { supabase } from "@/lib/supabase";
import {
  FileText,
  Upload,
  Search,
  Download,
  Link2,
  BookMarked,
  Loader2,
} from "lucide-react";

interface Note {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  createdAt: string;
  courseId?: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Course {
  id: string;
  title: string;
}

export default function TeacherNotesPage() {
  const { data: session, status } = useSession();

  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [filterCourse, setFilterCourse] = useState("");

  const [form, setForm] = useState({
    title: "",
    subject: "",
    courseId: "",
    topic: "",
  });

  const [pendingFile, setPendingFile] = useState<{
    url: string;
    name: string;
    size: number;
  } | null>(null);

  // ─── FETCH NOTES ─────────────────────────────
  const fetchNotes = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);

    const res = await fetch(`/api/notes?uploadedBy=${session.user.id}`);
    const data = await res.json();

    if (data.success) setNotes(data.data || []);

    setLoading(false);
  }, [session?.user?.id]);

  // ─── FETCH SUBJECTS ───────────────────────────
  const fetchSubjects = useCallback(async () => {
    const res = await fetch("/api/subjects");
    const data = await res.json();

    if (data.success) setSubjects(data.data || []);
  }, []);

  // ─── FETCH COURSES ────────────────────────────
  const fetchCourses = useCallback(async () => {
    const res = await fetch("/api/courses");
    const data = await res.json();

    if (data.courses) setCourses(data.courses);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotes();
      fetchSubjects();
      fetchCourses();
    }
  }, [status, fetchNotes, fetchSubjects, fetchCourses]);

  // ─── SAVE NOTE ───────────────────────────────
  const handleSaveNote = async () => {
    if (!pendingFile) return;

    setSaving(true);

    const fileType =
      pendingFile.name.split(".").pop()?.toLowerCase() || "pdf";

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        subject: form.subject,
        courseId: form.courseId,   // ✅ NEW
        topic: form.topic,
        fileUrl: pendingFile.url,
        fileType,
        fileSize: pendingFile.size,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setNotes((prev) => [data.data, ...prev]);
      setShowUpload(false);
      setForm({ title: "", subject: "", courseId: "", topic: "" });
      setPendingFile(null);
    }

    setSaving(false);
  };

  // ─── DOWNLOAD ───────────────────────────────
  const handleDownload = async (fileUrl: string) => {
    try {
      const path = fileUrl.split("/storage/v1/object/public/uploads/")[1];

      const { data, error } = await supabase.storage
        .from("uploads")
        .download(path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);

      const a = document.createElement("a");
      a.href = url;
      a.download = path.split("/").pop() || "file";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  // ─── FILTER NOTES ────────────────────────────
  const filteredNotes = notes.filter((n) => {
    const matchSearch =
      `${n.title} ${n.subject} ${n.topic ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchCourse = filterCourse ? n.courseId === filterCourse : true;

    return matchSearch && matchCourse;
  });

  const totalSize = notes.reduce((acc, n) => acc + (n.fileSize || 0), 0);

  if (status === "loading") {
    return (
      <div className="p-6 text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dot-pattern">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* HEADER */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              My Notes
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Upload and manage your teaching materials
            </p>
          </div>

          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary/90 transition"
          >
            <Upload className="w-4 h-4" />
            {showUpload ? "Cancel" : "Upload"}
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Notes", value: notes.length, icon: FileText },
            { label: "Subjects", value: subjects.length, icon: BookMarked },
            { label: "Storage", value: `${(totalSize / 1024 / 1024).toFixed(1)} MB`, icon: Link2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold font-serif text-foreground">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full h-10 pl-9 pr-4 rounded-md bg-card border border-border text-sm"
            />
          </div>

          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="h-10 px-3 rounded-md bg-card border border-border text-sm"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* UPLOAD */}
        {showUpload && (
          <div className="bg-card border border-border rounded-lg p-5 mb-6">
            <FileUpload
              type="notes"
              userId={session?.user?.id || ""}
              onUploadComplete={(url, name, size) =>
                setPendingFile({ url, name, size })
              }
            />

            {pendingFile && (
              <div className="mt-4 grid gap-3">

                <input
                  placeholder="Title"
                  className="border border-border rounded-md p-2 text-sm"
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />

                <select
                  className="border border-border rounded-md p-2 text-sm"
                  value={form.courseId}
                  onChange={(e) =>
                    setForm({ ...form, courseId: e.target.value })
                  }
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>

                <select
                  className="border border-border rounded-md p-2 text-sm"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <input
                  placeholder="Topic"
                  className="border border-border rounded-md p-2 text-sm"
                  onChange={(e) =>
                    setForm({ ...form, topic: e.target.value })
                  }
                />

                <button
                  onClick={handleSaveNote}
                  className="bg-primary text-white px-4 py-2 rounded-md text-sm"
                >
                  {saving ? "Saving..." : "Save Note"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* NOTES LIST */}
        <div className="grid gap-4">
          {filteredNotes.map((note) => (
            <div key={note.id} className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold">{note.title}</h3>
              <p className="text-sm text-muted-foreground">{note.subject}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}