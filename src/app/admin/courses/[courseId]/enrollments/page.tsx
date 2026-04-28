// ============================================================
// FILE LOCATION: app/admin/courses/[courseId]/enrollments/page.tsx
// ACTION: CREATE NEW
// PURPOSE: Admin page - manage who is enrolled in a course assign teacher
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ChevronRight, Users, Plus, Search, Loader2, Trash2, UserX, AlertCircle, BookOpen, LayoutList } from "lucide-react";
import Link from "next/link";

interface User { id: string; name: string; email: string; department?: { name: string }; }

export default function CourseEnrollmentsPage() {
  const params = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<any>(null);
  const [teacher, setTeacher] = useState<User | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [allTeachers, setAllTeachers] = useState<User[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addMode, setAddMode] = useState<"student" | "teacher" | null>(null);
  const [addUserId, setAddUserId] = useState("");
  const [adding, setAdding] = useState(false);

  const load = () =>
    Promise.all([
      fetch(`/api/courses/${params.courseId}`).then((r) => r.json()),
      fetch(`/api/admin/courses/${params.courseId}/enrollments`).then((r) => r.json()),
      fetch("/api/admin/users?role=TEACHER&limit=100").then((r) => r.json()),
      fetch("/api/admin/users?role=STUDENT&limit=100").then((r) => r.json()),
    ]).then(([c, e, t, s]) => {
      setCourse(c.course); setTeacher(e.teacher); setStudents(e.students ?? []);
      setAllTeachers(t.users ?? []); setAllStudents(s.users ?? []);
      setLoading(false);
    });

  useEffect(() => { load(); }, [params.courseId]);

  const handleAdd = async () => {
    if (!addUserId) return;
    setAdding(true);
    await fetch(`/api/admin/courses/${params.courseId}/enrollments`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: addMode === "teacher" ? "assign_teacher" : "enroll_student", userId: addUserId }),
    });
    const e = await fetch(`/api/admin/courses/${params.courseId}/enrollments`).then((r) => r.json());
    setTeacher(e.teacher); setStudents(e.students ?? []);
    setAddMode(null); setAddUserId(""); setAdding(false);
  };

  const handleRemove = async (userId: string, role: "STUDENT" | "TEACHER") => {
    if (!confirm(`Remove this ${role.toLowerCase()}?`)) return;
    await fetch(`/api/admin/courses/${params.courseId}/enrollments?userId=${userId}&role=${role}`, { method: "DELETE" });
    if (role === "TEACHER") setTeacher(null);
    else setStudents((p) => p.filter((s) => s.id !== userId));
  };

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background dot-pattern">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-6">
          <Link href="/admin/departments" className="hover:text-foreground">Departments</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary">{course?.code} Enrollments</span>
        </div>

        {course && (
          <div className="bg-card border border-border rounded-lg p-5 mb-6 flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="font-serif text-xl font-bold text-foreground">{course.title}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">{course.code}</span>
                <span className="text-xs bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded">{course.subject}</span>
                {course.department && <span className="text-xs text-muted-foreground">{course.department.name}</span>}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold font-serif text-foreground">{students.length}</p>
              <p className="text-xs text-muted-foreground">enrolled</p>
            </div>
          </div>
        )}

        {/* Teacher */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Teacher</h2>
            {!teacher && addMode !== "teacher" && (
              <button onClick={() => setAddMode("teacher")} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-colors">
                <Plus className="w-3 h-3" /> Assign teacher
              </button>
            )}
          </div>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {addMode === "teacher" && (
              <div className="p-4 border-b border-border bg-primary/5 flex items-center gap-3">
                <select value={addUserId} onChange={(e) => setAddUserId(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-md bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select teacher...</option>
                  {allTeachers.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.email}</option>)}
                </select>
                <button onClick={handleAdd} disabled={!addUserId || adding}
                  className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50">
                  {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Assign"}
                </button>
                <button onClick={() => setAddMode(null)} className="h-9 px-3 rounded-md bg-secondary text-sm text-muted-foreground">Cancel</button>
              </div>
            )}
            {teacher ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary font-mono shrink-0">
                  {teacher.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1"><p className="font-medium text-sm text-foreground">{teacher.name}</p><p className="text-xs text-muted-foreground">{teacher.email}</p></div>
                <button onClick={() => handleRemove(teacher.id, "TEACHER")} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <UserX className="w-4 h-4" />
                </button>
              </div>
            ) : !addMode && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                <AlertCircle className="w-6 h-6 mx-auto mb-1 opacity-40" />No teacher assigned.
              </div>
            )}
          </div>
        </div>

        {/* Students */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Students ({students.length})</h2>
            <div className="flex items-center gap-2">
              <Link href={`/admin/courses/${params.courseId}/subjects`}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground transition-colors">
                <LayoutList className="w-3 h-3" /> Subjects
              </Link>
              {addMode !== "student" && (
                <button onClick={() => setAddMode("student")} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-colors">
                  <Plus className="w-3 h-3" /> Enroll student
                </button>
              )}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {addMode === "student" && (
              <div className="p-4 border-b border-border bg-primary/5 flex items-center gap-3">
                <select value={addUserId} onChange={(e) => setAddUserId(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-md bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select student...</option>
                  {allStudents.filter((s) => !students.some((e) => e.id === s.id)).map((s) => <option key={s.id} value={s.id}>{s.name} — {s.email}</option>)}
                </select>
                <button onClick={handleAdd} disabled={!addUserId || adding}
                  className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50">
                  {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Enroll"}
                </button>
                <button onClick={() => setAddMode(null)} className="h-9 px-3 rounded-md bg-secondary text-sm text-muted-foreground">Cancel</button>
              </div>
            )}
            {students.length > 5 && (
              <div className="p-3 border-b border-border relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..."
                  className="w-full h-8 pl-8 pr-3 rounded-md bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            )}
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground"><Users className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No students enrolled.</p></div>
            ) : filtered.map((s) => (
              <div key={s.id} className="group flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary font-mono shrink-0">
                  {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{s.name}</p><p className="text-xs text-muted-foreground">{s.email}</p></div>
                {s.department && <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground hidden sm:block">{s.department.name}</span>}
                <button onClick={() => handleRemove(s.id, "STUDENT")} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}