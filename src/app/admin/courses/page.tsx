// ============================================================
// FILE LOCATION: app/admin/courses/page.tsx
// ACTION: CREATE NEW
// PURPOSE: Admin page - list all courses across all departments
//          with teacher info, enrollment count, and quick actions
// ============================================================

"use client";

import { useState, useEffect } from "react";
import {
  BookOpen, Plus, Search, ChevronRight, Building2,
  UserCheck, Users, LayoutList, Loader2, AlertCircle,
  Pencil, Trash2, ToggleLeft, ToggleRight,
} from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  code: string;
  subject: string;
  description?: string;
  isActive?: boolean;
  department?: { id: string; name: string };
  teacher?: { id: string; name: string; email: string } | null;
  studentCount: number;
  subjectCount: number;
}

interface Department {
  id: string;
  name: string;
}

// ─── Single course row ────────────────────────────────────────
function CourseRow({ course, onDelete }: {
  course: Course;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${course.title}"? This cannot be undone and will remove all enrollments.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/courses/${course.id}`, { method: "DELETE" });
    if (res.ok) onDelete(course.id);
    else setDeleting(false);
  };

  return (
    <div className="group flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">

      {/* Icon */}
      <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <BookOpen className="w-4 h-4 text-primary" />
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-foreground font-serif">{course.title}</span>
          <span className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
            {course.code}
          </span>
          <span className="text-xs text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
            {course.subject}
          </span>
        </div>

        <div className="flex items-center gap-4 mt-1 flex-wrap">
          {/* Department */}
          {course.department ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="w-3 h-3" />
              {course.department.name}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/50 italic">No department</span>
          )}

          {/* Teacher */}
          {course.teacher ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <UserCheck className="w-3 h-3" />
              {course.teacher.name}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-amber-500/70">
              <AlertCircle className="w-3 h-3" />
              No teacher
            </span>
          )}

          {/* Counts */}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            {course.studentCount} students
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <LayoutList className="w-3 h-3" />
            {course.subjectCount} subjects
          </span>
        </div>
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Link
          href={`/admin/courses/${course.id}/subjects`}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <LayoutList className="w-3 h-3" /> Subjects
        </Link>
        <Link
          href={`/admin/courses/${course.id}/enrollments`}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <Users className="w-3 h-3" /> Enrollments
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          {deleting
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Trash2 className="w-3.5 h-3.5" />
          }
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/courses").then((r) => r.json()),
      fetch("/api/departments").then((r) => r.json()),
    ]).then(([courseData, deptData]) => {
      setCourses(courseData.courses ?? []);
      setDepartments(deptData.departments ?? []);
      setLoading(false);
    });
  }, []);

  const subjects = [...new Set(courses.map((c) => c.subject))].sort();

  const filtered = courses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept ? c.department?.id === filterDept : true;
    const matchSubject = filterSubject ? c.subject === filterSubject : true;
    return matchSearch && matchDept && matchSubject;
  });

  const totalStudents = courses.reduce((s, c) => s + c.studentCount, 0);

  return (
    <div className="min-h-screen bg-background dot-pattern">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-6">
          <span>Admin</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary">Courses</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Courses</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              All courses across every department
            </p>
          </div>
          <Link
            href="/admin/courses/new"
            className="flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Course
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total courses", value: courses.length },
            { label: "Total students enrolled", value: totalStudents },
            { label: "Departments", value: departments.length },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-lg px-4 py-3">
              <p className="text-2xl font-bold font-serif text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses, codes, subjects…"
              className="w-full h-10 pl-9 pr-4 rounded-md bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Department filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="h-10 px-3 rounded-md bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none min-w-[160px]"
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Subject filter */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="h-10 px-3 rounded-md bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none min-w-[160px]"
          >
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {(filterDept || filterSubject || search) && (
            <button
              onClick={() => { setSearch(""); setFilterDept(""); setFilterSubject(""); }}
              className="h-10 px-3 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-xs text-muted-foreground mb-3">
            {filtered.length} course{filtered.length !== 1 ? "s" : ""}
            {(search || filterDept || filterSubject) && " matching filters"}
          </p>
        )}

        {/* Course list */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 px-5 py-4 animate-shimmer" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-sm">
                {search || filterDept || filterSubject
                  ? "No courses match your filters"
                  : "No courses yet"}
              </p>
              {!search && !filterDept && !filterSubject && (
                <Link
                  href="/admin/courses/new"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Create your first course
                </Link>
              )}
            </div>
          ) : (
            filtered.map((course) => (
              <CourseRow
                key={course.id}
                course={course}
                onDelete={(id) => setCourses((prev) => prev.filter((c) => c.id !== id))}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}