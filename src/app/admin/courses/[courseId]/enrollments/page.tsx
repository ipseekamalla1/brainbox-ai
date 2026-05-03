"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ChevronRight,
  Users,
  Plus,
  Search,
  Loader2,
  Trash2,
  UserX,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  department?: { name: string };
}

export default function CourseEnrollmentsPage() {
  const params = useParams<{ courseId: string }>();

  const [course, setCourse] = useState<any>(null);
  const [teacher, setTeacher] = useState<User | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [allTeachers, setAllTeachers] = useState<User[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [addMode, setAddMode] =
    useState<"student" | "teacher" | null>(null);

  const [addUserId, setAddUserId] = useState("");
  const [adding, setAdding] = useState(false);

  // ─── LOAD DATA ─────────────────────────────────────────────
  const load = async () => {
    setLoading(true);

    const [c, e, t, s] = await Promise.all([
      fetch(`/api/courses/${params.courseId}`).then((r) => r.json()),
      fetch(`/api/admin/courses/${params.courseId}/enrollments`).then((r) =>
        r.json()
      ),
      fetch("/api/admin/users?role=TEACHER&limit=100").then((r) =>
        r.json()
      ),
      fetch("/api/admin/users?role=STUDENT&limit=100").then((r) =>
        r.json()
      ),
    ]);

    setCourse(c.course);
    setTeacher(e.teacher);

    // ✅ REMOVE DUPLICATES SAFELY (FIX FOR YOUR ERROR)
    const uniqueStudentsMap = new Map<string, User>();
    (e.students ?? []).forEach((s: User) => {
      if (s?.id) uniqueStudentsMap.set(s.id, s);
    });

    setStudents(Array.from(uniqueStudentsMap.values()));

   setAllTeachers(t.data?.users ?? []);
setAllStudents(s.data?.users ?? []);

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [params.courseId]);

  // ─── ADD / ASSIGN ──────────────────────────────────────────
  const handleAdd = async () => {
    if (!addUserId) return;
    setAdding(true);

    await fetch(`/api/admin/courses/${params.courseId}/enrollments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action:
          addMode === "teacher" ? "assign_teacher" : "enroll_student",
        userId: addUserId,
      }),
    });

    setAddUserId("");
    setAddMode(null);
    setAdding(false);

    load();
  };

  // ─── REMOVE ───────────────────────────────────────────────
  const handleRemove = async (
    userId: string,
    role: "STUDENT" | "TEACHER"
  ) => {
    if (!confirm(`Remove this ${role.toLowerCase()}?`)) return;

    await fetch(
      `/api/admin/courses/${params.courseId}/enrollments?userId=${userId}&role=${role}`,
      { method: "DELETE" }
    );

    if (role === "TEACHER") setTeacher(null);
    else setStudents((p) => p.filter((s) => s.id !== userId));
  };

  // ─── FILTER ────────────────────────────────────────────────
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  // ─── LOADING ───────────────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background dot-pattern">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-6">
          <Link href="/admin/departments">Departments</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary">{course?.code} Enrollments</span>
        </div>

        {/* COURSE */}
        {course && (
          <div className="bg-card border rounded-lg p-5 mb-6 flex gap-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <h1 className="font-bold">{course.title}</h1>
              <p className="text-xs text-muted-foreground">
                {course.code} • {course.subject}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">{students.length}</p>
              <p className="text-xs">students</p>
            </div>
          </div>
        )}

        {/* TEACHER */}
        <div className="mb-5">
          <div className="flex justify-between mb-3">
            <h2 className="text-sm font-semibold">Teacher</h2>

            {!teacher && (
              <button
                onClick={() => setAddMode("teacher")}
                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
              >
                + Assign
              </button>
            )}
          </div>

          <div className="bg-card border rounded-lg">
            {addMode === "teacher" && (
              <div className="p-4 flex gap-3">
                <select
                  value={addUserId}
                  onChange={(e) => setAddUserId(e.target.value)}
                  className="flex-1 border rounded px-2"
                >
                  <option value="">Select teacher</option>
                  {allTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <button onClick={handleAdd}>Assign</button>
              </div>
            )}

            {teacher ? (
              <div className="p-4 flex justify-between">
                <div>
                  <p>{teacher.name}</p>
                  <p className="text-xs">{teacher.email}</p>
                </div>
                <button
                  onClick={() => handleRemove(teacher.id, "TEACHER")}
                >
                  <UserX />
                </button>
              </div>
            ) : (
              !addMode && (
                <p className="p-4 text-sm text-muted-foreground">
                  No teacher assigned
                </p>
              )
            )}
          </div>
        </div>

        {/* STUDENTS */}
        <div>
          <div className="flex justify-between mb-3">
            <h2 className="text-sm font-semibold">
              Students ({students.length})
            </h2>

            <button
              onClick={() => setAddMode("student")}
              className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
            >
              + Add
            </button>
          </div>

          <div className="bg-card border rounded-lg">

            {/* ADD */}
            {addMode === "student" && (
              <div className="p-4 flex gap-3">
                <select
                  value={addUserId}
                  onChange={(e) => setAddUserId(e.target.value)}
                  className="flex-1 border rounded px-2"
                >
                  <option value="">Select student</option>
                  {allStudents
                    .filter(
                      (s) => !students.some((e) => e.id === s.id)
                    )
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>

                <button onClick={handleAdd}>Add</button>
              </div>
            )}

            {/* SEARCH */}
            <div className="p-3 border-b">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full border rounded px-2"
              />
            </div>

            {/* LIST (FIXED DUPLICATE KEY ISSUE) */}
            {filtered
              .filter(
                (s, i, arr) =>
                  arr.findIndex((x) => x.id === s.id) === i
              )
              .map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between p-3 border-b"
                >
                  <div>
                    <p>{s.name}</p>
                    <p className="text-xs">{s.email}</p>
                  </div>

                  <button
                    onClick={() => handleRemove(s.id, "STUDENT")}
                  >
                    <Trash2 />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}