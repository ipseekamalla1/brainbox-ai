"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ChevronRight,
  Plus,
  BookMarked,
  Loader2,
  FileText,
  Video,
  ClipboardList,
  ScrollText,
  GripVertical,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";

interface Subject {
  id: string;
  name: string;
  description?: string;
  order: number;
  _count?: {
    notes?: number;
    videos?: number;
    quizzes?: number;
    exams?: number;
  };
}

export default function SubjectsPage() {
  const params = useParams<{ courseId: string }>();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [course, setCourse] = useState<{ title: string; code: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/courses/${params.courseId}/subjects`).then((r) => r.json()),
      fetch(`/api/courses/${params.courseId}`).then((r) => r.json()),
    ]).then(([s, c]) => {
      setSubjects(s.subjects ?? []);
      setCourse(c.course ?? null);
      setLoading(false);
    });
  }, [params.courseId]);

  // ─── ADD ─────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    const res = await fetch(`/api/courses/${params.courseId}/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: addName,
        description: addDesc,
        order: subjects.length,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setSubjects((p) => [
        ...p,
        {
          ...data.subject,
          _count: data.subject._count ?? {
            notes: 0,
            videos: 0,
            quizzes: 0,
            exams: 0,
          },
        },
      ]);

      setAddName("");
      setAddDesc("");
      setAddOpen(false);
    }

    setAdding(false);
  };

  // ─── EDIT ─────────────────────────────
  const handleEdit = async (id: string) => {
    const res = await fetch(
      `/api/courses/${params.courseId}/subjects/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDesc,
        }),
      }
    );

    if (res.ok) {
      setSubjects((p) =>
        p.map((s) =>
          s.id === id
            ? { ...s, name: editName, description: editDesc }
            : s
        )
      );
      setEditingId(null);
    }
  };

  // ─── DELETE ─────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Delete subject?")) return;

    const res = await fetch(
      `/api/courses/${params.courseId}/subjects/${id}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      setSubjects((p) => p.filter((s) => s.id !== id));
    }
  };

  const startEdit = (s: Subject) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditDesc(s.description ?? "");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background dot-pattern">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link href="/admin">Admin</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary">Subjects</span>
        </div>

        <h1 className="text-2xl font-bold mb-4">
          {course?.title} Subjects
        </h1>

        {/* LIST */}
        <div className="space-y-3">
          {subjects.map((s, i) => (
            <div key={s.id} className="border rounded-lg p-4 bg-card">

              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {s.description}
                  </p>

                  {/* SAFE COUNT FIX */}
                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                    {(s._count?.notes ?? 0) > 0 && (
                      <span>
                        <FileText className="w-3 h-3 inline" />{" "}
                        {s._count?.notes ?? 0}
                      </span>
                    )}

                    {(s._count?.videos ?? 0) > 0 && (
                      <span>
                        <Video className="w-3 h-3 inline" />{" "}
                        {s._count?.videos ?? 0}
                      </span>
                    )}

                    {(s._count?.quizzes ?? 0) > 0 && (
                      <span>
                        <ClipboardList className="w-3 h-3 inline" />{" "}
                        {s._count?.quizzes ?? 0}
                      </span>
                    )}

                    {(s._count?.exams ?? 0) > 0 && (
                      <span>
                        <ScrollText className="w-3 h-3 inline" />{" "}
                        {s._count?.exams ?? 0}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => startEdit(s)}>
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button onClick={() => handleDelete(s.id)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* ADD */}
        {addOpen ? (
          <form onSubmit={handleAdd} className="mt-6 space-y-2">
            <input
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="Subject name"
              className="border p-2 w-full"
            />

            <textarea
              value={addDesc}
              onChange={(e) => setAddDesc(e.target.value)}
              placeholder="Description"
              className="border p-2 w-full"
            />

            <button className="bg-primary text-white px-4 py-2">
              {adding ? "Adding..." : "Add"}
            </button>
          </form>
        ) : (
          <button onClick={() => setAddOpen(true)} className="mt-6">
            <Plus /> Add Subject
          </button>
        )}
      </div>
    </div>
  );
}