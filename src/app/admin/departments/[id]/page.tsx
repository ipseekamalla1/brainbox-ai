// ============================================================
// FILE LOCATION: app/admin/departments/[id]/page.tsx
// ACTION: CREATE NEW
// PURPOSE: Admin page - one department detail with Courses tab and Students tab
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ChevronRight, BookOpen, Users, Plus, RefreshCw, Loader2, Search, ArrowLeftRight, Trash2, UserCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Course { id: string; title: string; code: string; subject: string; teacher: { name: string } | null; studentCount: number; subjectCount: number; }
interface Student { id: string; name: string; email: string; }
interface Department { id: string; name: string; slug: string; description?: string; courses: Course[]; _count: { students: number }; }

export default function DepartmentDetailPage() {
  const params = useParams<{ id: string }>();
  const [dept, setDept] = useState<Department | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [allDepts, setAllDepts] = useState<{ id: string; name: string }[]>([]);
  const [tab, setTab] = useState<"courses" | "students">("courses");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [moveTarget, setMoveTarget] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/departments/${params.id}`).then((r) => r.json()),
      fetch("/api/departments").then((r) => r.json()),
    ]).then(([d, all]) => {
      setDept(d.department);
      setAllDepts(all.departments ?? []);
      setLoading(false);
    });
  }, [params.id]);

  useEffect(() => {
    if (tab === "students") {
      fetch(`/api/admin/departments/${params.id}/students`)
        .then((r) => r.json()).then((d) => setStudents(d.students ?? []));
    }
  }, [tab, params.id]);

  const handleSync = async () => {
    setSyncing(true);
    const res = await fetch(`/api/admin/departments/${params.id}/sync`, { method: "POST" });
    const data = await res.json();
    setSyncing(false);
    alert(`Sync done: ${data.totalEnrolled} enrolled, ${data.totalReactivated} reactivated.`);
  };

  const handleMove = async (userId: string) => {
    if (!moveTarget) return;
    const res = await fetch(`/api/admin/users/${userId}/department`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ departmentId: moveTarget }),
    });
    if (res.ok) { setStudents((p) => p.filter((s) => s.id !== userId)); setMovingId(null); setMoveTarget(""); }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Remove student from this department?")) return;
    const res = await fetch(`/api/admin/users/${userId}/department`, { method: "DELETE" });
    if (res.ok) setStudents((p) => p.filter((s) => s.id !== userId));
  };

  if (loading || !dept) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  const filteredCourses = dept.courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
  );
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background dot-pattern">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-6">
          <Link href="/admin/departments" className="hover:text-foreground">Departments</Link>
          <ChevronRight className="w-3 h-3" /><span className="text-primary">{dept.name}</span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">{dept.name}</h1>
            {dept.description && <p className="text-sm text-muted-foreground mt-1">{dept.description}</p>}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">{dept._count.students} students</span>
              <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">{dept.courses.length} courses</span>
              <span className="text-xs bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded font-mono">/{dept.slug}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSync} disabled={syncing}
              className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-card text-sm text-muted-foreground hover:text-foreground transition-colors">
              {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Sync
            </button>
            <Link href={`/admin/courses/new?departmentId=${dept.id}`}
              className="flex items-center gap-1.5 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Course
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit mb-4">
          {(["courses", "students"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setSearch(""); }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "courses" ? <BookOpen className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${tab}...`}
            className="w-full h-9 pl-9 pr-4 rounded-md bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {tab === "courses" && (
            filteredCourses.length === 0
              ? <div className="text-center py-12 text-muted-foreground"><BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No courses yet.</p></div>
              : filteredCourses.map((c) => (
                <div key={c.id} className="group flex items-center gap-4 px-4 py-3.5 border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                  <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">{c.title}</span>
                      <span className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{c.code}</span>
                      <span className="text-xs bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded">{c.subject}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      {c.teacher
                        ? <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />{c.teacher.name}</span>
                        : <span className="flex items-center gap-1 text-amber-500/70"><AlertCircle className="w-3 h-3" />No teacher</span>}
                      <span>{c.studentCount} students · {c.subjectCount} subjects</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/courses/${c.id}/enrollments`}
                      className="text-xs px-2.5 py-1.5 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">Enrollments</Link>
                    <Link href={`/admin/courses/${c.id}/subjects`}
                      className="text-xs px-2.5 py-1.5 rounded-md bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-colors">Subjects</Link>
                  </div>
                </div>
              ))
          )}

          {tab === "students" && (
            filteredStudents.length === 0
              ? <div className="text-center py-12 text-muted-foreground"><Users className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No students yet.</p></div>
              : filteredStudents.map((s) => {
                const initials = s.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={s.id} className="group flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary font-mono shrink-0">{initials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                    </div>
                    {movingId === s.id ? (
                      <div className="flex items-center gap-1.5">
                        <select value={moveTarget} onChange={(e) => setMoveTarget(e.target.value)}
                          className="h-7 px-2 text-xs rounded-md bg-input border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                          <option value="">Select dept...</option>
                          {allDepts.filter((d) => d.id !== params.id).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <button onClick={() => handleMove(s.id)} disabled={!moveTarget}
                          className="h-7 px-2 rounded-md bg-primary text-primary-foreground text-xs disabled:opacity-50"><CheckCircle2 className="w-3 h-3" /></button>
                        <button onClick={() => { setMovingId(null); setMoveTarget(""); }} className="h-7 px-2 rounded-md bg-secondary text-xs text-muted-foreground">✕</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setMovingId(s.id)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">
                          <ArrowLeftRight className="w-3 h-3" /> Move
                        </button>
                        <button onClick={() => handleRemove(s.id)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}