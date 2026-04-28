// ============================================================
// FILE LOCATION: app/student/courses/page.tsx
// ACTION: REPLACE EXISTING app/student/courses/page.tsx
// PURPOSE: Student page - my courses grouped by department with subject list
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { BookOpen, ChevronRight, Search, GraduationCap, Loader2, FileText, Video, ClipboardList, ScrollText, Building2, BookMarked } from "lucide-react";
import Link from "next/link";

interface Subject { id: string; name: string; order: number; _count: { notes: number; videos: number; quizzes: number; exams: number }; }
interface Course {
  id: string; title: string; code: string; subject: string; description?: string;
  department?: { id: string; name: string };
  teacher: { name: string } | null;
  studentCount: number; subjectCount: number;
}

function CourseCard({ course }: { course: Course }) {
  const [expanded, setExpanded] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingS, setLoadingS] = useState(false);

  const handleExpand = async () => {
    if (!expanded && subjects.length === 0 && course.subjectCount > 0) {
      setLoadingS(true);
      const d = await fetch(`/api/courses/${course.id}/subjects`).then((r) => r.json());
      setSubjects(d.subjects ?? []);
      setLoadingS(false);
    }
    setExpanded((v) => !v);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-border/60 transition-all group">
      <div className="h-0.5 bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-serif font-semibold text-foreground">{course.title}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs font-mono text-muted-foreground">{course.code}</span>
                  <span className="text-xs bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded">{course.subject}</span>
                </div>
              </div>
              <Link href={`/student/courses/${course.id}`} className="shrink-0 text-xs px-2.5 py-1.5 rounded-md bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-colors font-medium">
                Open →
              </Link>
            </div>
            {course.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{course.description}</p>}
            <div className="flex items-center justify-between mt-3">
              {course.teacher && <span className="text-xs text-muted-foreground">by {course.teacher.name}</span>}
              {course.subjectCount > 0 && (
                <button onClick={handleExpand} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto">
                  <BookMarked className="w-3 h-3" />{course.subjectCount} subjects
                  <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
                </button>
              )}
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            {loadingS ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Loading...</div>
            ) : subjects.sort((a, b) => a.order - b.order).map((s, i) => (
              <Link key={s.id} href={`/student/courses/${course.id}/subjects/${s.id}`}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border transition-all">
                <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary font-mono shrink-0">{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-foreground truncate">{s.name}</span>
                <div className="flex items-center gap-1.5">
                  {s._count.notes > 0 && <span className="flex items-center gap-0.5 text-xs text-muted-foreground bg-secondary px-1 py-0.5 rounded"><FileText className="w-2.5 h-2.5" />{s._count.notes}</span>}
                  {s._count.videos > 0 && <span className="flex items-center gap-0.5 text-xs text-muted-foreground bg-secondary px-1 py-0.5 rounded"><Video className="w-2.5 h-2.5" />{s._count.videos}</span>}
                  {s._count.quizzes > 0 && <span className="flex items-center gap-0.5 text-xs text-muted-foreground bg-secondary px-1 py-0.5 rounded"><ClipboardList className="w-2.5 h-2.5" />{s._count.quizzes}</span>}
                </div>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/courses").then((r) => r.json())
      .then((d) => setCourses(d.courses ?? [])).finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, { name: string; courses: Course[] }>>((acc, c) => {
    const key = c.department?.id ?? "__none";
    const name = c.department?.name ?? "Other Courses";
    if (!acc[key]) acc[key] = { name, courses: [] };
    acc[key].courses.push(c);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background dot-pattern">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-7">
          <h1 className="font-serif text-3xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground mt-1 text-sm">{courses.length} course{courses.length !== 1 ? "s" : ""} enrolled</p>
        </div>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses..."
            className="w-full h-10 pl-9 pr-4 rounded-md bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-44 bg-card border border-border rounded-lg animate-shimmer" />)}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">{search ? "No courses match" : "No courses enrolled yet"}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([key, { name, courses: dc }]) => (
              <div key={key}>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground font-serif">{name}</h2>
                  <div className="flex-1 h-px bg-border ml-1" />
                  <span className="text-xs text-muted-foreground">{dc.length} course{dc.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {dc.map((c) => <CourseCard key={c.id} course={c} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}