// ============================================================
// FILE LOCATION: app/admin/courses/[courseId]/subjects/page.tsx
// ACTION: CREATE NEW
// PURPOSE: Admin page - manage subjects inside a course add edit delete
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ChevronRight, Plus, BookMarked, Loader2, FileText, Video, ClipboardList, ScrollText, GripVertical, Pencil, Trash2, Check, X } from "lucide-react";
import Link from "next/link";

interface Subject {
  id: string; name: string; description?: string; order: number;
  _count: { notes: number; videos: number; quizzes: number; exams: number };
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
      setCourse(c.course ? { title: c.course.title, code: c.course.code } : null);
      setLoading(false);
    });
  }, [params.courseId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    const res = await fetch(`/api/courses/${params.courseId}/subjects`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: addName, description: addDesc, order: subjects.length }),
    });
    const data = await res.json();
    if (res.ok) { setSubjects((p) => [...p, data.subject]); setAddName(""); setAddDesc(""); setAddOpen(false); }
    setAdding(false);
  };

  const handleEdit = async (id: string) => {
    const res = await fetch(`/api/courses/${params.courseId}/subjects/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc }),
    });
    if (res.ok) {
      setSubjects((p) => p.map((s) => s.id === id ? { ...s, name: editName, description: editDesc } : s));
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete subject? Linked content will remain but lose the subject link.")) return;
    const res = await fetch(`/api/courses/${params.courseId}/subjects/${id}`, { method: "DELETE" });
    if (res.ok) setSubjects((p) => p.filter((s) => s.id !== id));
  };

  const startEdit = (s: Subject) => { setEditingId(s.id); setEditName(s.name); setEditDesc(s.description ?? ""); };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background dot-pattern">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-6">
          <Link href="/admin/departments" className="hover:text-foreground">Departments</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/admin/courses/${params.courseId}/enrollments`} className="hover:text-foreground">{course?.code}</Link>
          <ChevronRight className="w-3 h-3" /><span className="text-primary">Subjects</span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2"><BookMarked className="w-5 h-5 text-primary" />Subjects</h1>
            <p className="text-sm text-muted-foreground mt-1">{course?.title} — {subjects.length} subject{subjects.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href={`/admin/courses/${params.courseId}/enrollments`} className="text-xs px-3 py-1.5 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground transition-colors">← Enrollments</Link>
        </div>

        <div className="bg-primary/8 border border-primary/20 rounded-lg px-4 py-3 mb-5 text-xs text-primary/80 leading-relaxed">
          Subjects organise content within this course. Notes, videos, quizzes and exams can each be scoped to a subject.
        </div>

        <div className="space-y-3 mb-4">
          {subjects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
              <BookMarked className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No subjects yet.</p>
            </div>
          ) : subjects.sort((a, b) => a.order - b.order).map((s, i) => (
            <div key={s.id} className="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-border/60 transition-all">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/30 group-hover:bg-primary/60 transition-colors" />
              <div className="pl-4 pr-4 py-4 flex items-start gap-3">
                <GripVertical className="w-4 h-4 text-muted-foreground/30 mt-1 shrink-0" />
                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary font-mono">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  {editingId === s.id ? (
                    <div className="space-y-2">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus
                        className="w-full h-8 px-2 rounded-md bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                      <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} placeholder="Description (optional)"
                        className="w-full px-2 py-1.5 rounded-md bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(s.id)} disabled={!editName} className="flex items-center gap-1 h-7 px-2.5 rounded-md bg-primary text-primary-foreground text-xs disabled:opacity-50">
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="h-7 px-2.5 rounded-md bg-secondary text-xs text-muted-foreground"><X className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-foreground text-sm font-serif">{s.name}</h3>
                      {s.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.description}</p>}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {s._count.notes > 0 && <span className="flex items-center gap-1 text-xs text-muted-foreground"><FileText className="w-3 h-3" />{s._count.notes}</span>}
                        {s._count.videos > 0 && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Video className="w-3 h-3" />{s._count.videos}</span>}
                        {s._count.quizzes > 0 && <span className="flex items-center gap-1 text-xs text-muted-foreground"><ClipboardList className="w-3 h-3" />{s._count.quizzes}</span>}
                        {s._count.exams > 0 && <span className="flex items-center gap-1 text-xs text-muted-foreground"><ScrollText className="w-3 h-3" />{s._count.exams}</span>}
                        {Object.values(s._count).every((v) => v === 0) && <span className="text-xs text-muted-foreground/50 italic">No content yet</span>}
                      </div>
                    </>
                  )}
                </div>
                {editingId !== s.id && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => startEdit(s)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {addOpen ? (
          <form onSubmit={handleAdd} className="bg-card border border-primary/30 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">New subject</h3>
            <input value={addName} onChange={(e) => setAddName(e.target.value)} required autoFocus placeholder="e.g. Week 3: Sorting Algorithms"
              className="w-full h-9 px-3 rounded-md bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <textarea value={addDesc} onChange={(e) => setAddDesc(e.target.value)} rows={2} placeholder="Description (optional)"
              className="w-full px-3 py-2 rounded-md bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
            <div className="flex gap-2">
              <button type="submit" disabled={adding || !addName} className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs disabled:opacity-50">
                {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Add
              </button>
              <button type="button" onClick={() => setAddOpen(false)} className="h-8 px-3 rounded-md bg-secondary text-xs text-muted-foreground">Cancel</button>
            </div>
          </form>
        ) : (
          <button onClick={() => setAddOpen(true)}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all">
            <Plus className="w-4 h-4" /> Add subject
          </button>
        )}
      </div>
    </div>
  );
}