// ============================================================
// FILE LOCATION: app/teacher/page.tsx
// ACTION: REPLACE EXISTING app/teacher/page.tsx
// PURPOSE: Teacher page - my courses and my students tabs
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { BookOpen, Users, Loader2, Search, GraduationCap, BookMarked, Building2, BarChart2, LayoutList } from "lucide-react";
import Link from "next/link";

interface Course { id: string; title: string; code: string; subject: string; description?: string; department?: { name: string }; teacher: { name: string } | null; studentCount: number; subjectCount: number; }
interface TeacherStudent { user: { id: string; name: string; email: string; department?: { name: string } }; courses: string[]; }

export default function TeacherDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [tab, setTab] = useState<"courses" | "students">("courses");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [studentsLoaded, setStudentsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/courses").then((r) => r.json())
      .then((d) => setCourses(d.courses ?? [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "students" && !studentsLoaded) {
      fetch("/api/teacher/students").then((r) => r.json())
        .then((d) => { setStudents(d.students ?? []); setStudentsLoaded(true); });
    }
  }, [tab]);

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
  );
  const filteredStudents = students.filter((s) =>
    s.user.name.toLowerCase().includes(search.toLowerCase()) || s.user.email.toLowerCase().includes(search.toLowerCase())
  );
  const uniqueStudents = [...new Set(students.map((s) => s.user.id))].length;

  return (
    <div className="min-h-screen bg-background dot-pattern">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-7">
          <h1 className="font-serif text-3xl font-bold text-foreground">My Teaching</h1>
          <p className="text-muted-foreground mt-1 text-sm">Overview of your courses and students</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Courses", value: courses.length, icon: BookOpen },
            { label: "Students", value: studentsLoaded ? uniqueStudents : "—", icon: GraduationCap },
            { label: "Subjects", value: courses.reduce((s, c) => s + c.subjectCount, 0), icon: BookMarked },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold font-serif text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-card border border-border rounded-lg animate-shimmer" />)}
          </div>
        ) : tab === "courses" ? (
          filteredCourses.length === 0
            ? <div className="text-center py-16 text-muted-foreground"><BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No courses found.</p></div>
            : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCourses.map((c) => (
                <div key={c.id} className="bg-card border border-border rounded-lg overflow-hidden hover:border-border/60 transition-all group">
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-semibold text-foreground">{c.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">{c.code}</span>
                          <span className="text-xs bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded">{c.subject}</span>
                          {c.department && <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Building2 className="w-2.5 h-2.5" />{c.department.name}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.studentCount}</span>
                        <span className="flex items-center gap-1"><BookMarked className="w-3 h-3" />{c.subjectCount}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Link href={`/teacher/courses/${c.id}/subjects`}
                          className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">
                          <LayoutList className="w-3 h-3" /> Content
                        </Link>
                        <Link href={`/teacher/courses/${c.id}/students`}
                          className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">
                          <Users className="w-3 h-3" /> Students
                        </Link>
                        <Link href={`/teacher/courses/${c.id}/analytics`}
                          className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-md bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-colors">
                          <BarChart2 className="w-3 h-3" /> Analytics
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {filteredStudents.length === 0
              ? <div className="text-center py-12 text-muted-foreground"><GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No students found.</p></div>
              : filteredStudents.map((s) => {
                const initials = s.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={s.user.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary font-mono shrink-0">{initials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.user.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[180px]">
                      {s.courses.slice(0, 2).map((c) => <span key={c} className="text-xs bg-secondary border border-border px-1.5 py-0.5 rounded text-muted-foreground truncate max-w-[80px]">{c}</span>)}
                      {s.courses.length > 2 && <span className="text-xs text-muted-foreground">+{s.courses.length - 2}</span>}
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}
      </div>
    </div>
  );
}