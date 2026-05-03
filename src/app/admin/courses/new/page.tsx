// ============================================================
// FILE LOCATION: app/admin/courses/new/page.tsx
// ACTION: CREATE NEW
// PURPOSE: Admin page - form to create a new course with department and teacher
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const SUBJECTS = ["Computer Science","Mathematics","Physics","Chemistry","Biology","History","Literature","Economics","Psychology","Engineering","Medicine","Law","Business","Philosophy","Arts"];

export default function NewCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    title: "", code: "", subject: "", description: "",
    departmentId: searchParams.get("departmentId") ?? "",
    teacherId: "",
  });
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ title: string; enrolled: number } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/departments").then((r) => r.json()),
      fetch("/api/admin/users?role=TEACHER&limit=100").then((r) => r.json()),
    ]).then(([d, t]) => {
      setDepartments(d.departments ?? []);
      setTeachers(t.users ?? []);
    });
  }, []);

  const handleTitle = (title: string) => {
    const words = title.trim().split(/\s+/);
    const code = words.length >= 2
      ? (words[0].slice(0, 2) + words[words.length - 1].slice(0, 3)).toUpperCase()
      : title.slice(0, 5).toUpperCase();
    setForm((f) => ({ ...f, title, code: f.code || code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/courses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          departmentId: form.departmentId || undefined,
          teacherId: form.teacherId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess({ title: data.course.title, enrolled: data.enrollment?.enrolled ?? 0 });
      setTimeout(() => router.push(`/admin/courses/${data.course.id}/enrollments`), 2000);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div className="min-h-screen bg-background flex items-center justify-center dot-pattern">
      <div className="text-center animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-serif text-xl font-bold text-foreground">{success.title} created</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {success.enrolled > 0 ? `${success.enrolled} students auto-enrolled.` : "Course created successfully."}
        </p>
        <p className="text-xs text-muted-foreground mt-2 font-mono">Redirecting…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background dot-pattern">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-6">
          <Link href="/admin/departments" className="hover:text-foreground">Departments</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary">New Course</span>
        </div>
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-foreground">Create Course</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Course details */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Course details</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
              <input value={form.title} onChange={(e) => handleTitle(e.target.value)} required placeholder="e.g. Introduction to Algorithms"
                className="w-full h-10 px-3 rounded-md bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Code</label>
                <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} required maxLength={20}
                  className="w-full h-10 px-3 rounded-md bg-input border border-border text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
                <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} required
                  className="w-full h-10 px-3 rounded-md bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                  <option value="">Select...</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="What will students learn?"
                className="w-full px-3 py-2 rounded-md bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          {/* Department */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Department</h2>
            <select value={form.departmentId} onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
              className="w-full h-10 px-3 rounded-md bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
              <option value="">No department (manual enroll only)</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {form.departmentId && (
              <div className="flex items-start gap-2 text-xs text-primary bg-primary/8 border border-primary/20 rounded-md px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                All students in <strong className="mx-1">{departments.find((d) => d.id === form.departmentId)?.name}</strong> will be auto-enrolled.
              </div>
            )}
          </div>

          {/* Teacher */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Teacher <span className="text-muted-foreground font-normal text-xs">(optional)</span></h2>
            <select value={form.teacherId} onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}
              className="w-full h-10 px-3 rounded-md bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
              <option value="">Assign later</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.email}</option>)}
            </select>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/25 rounded-md px-4 py-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/admin/departments" className="flex-1 h-10 rounded-md border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors flex items-center justify-center">Cancel</Link>
            <button type="submit" disabled={loading} className="flex-1 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}