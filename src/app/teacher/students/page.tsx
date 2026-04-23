// src/app/teacher/students/page.tsx — Teacher Student Progress View

"use client";

import { useState, useEffect } from "react";

interface StudentData {
  id: string;
  name: string;
  email: string;
  quizAvg: number;
  examAvg: number;
  quizCount: number;
  examCount: number;
  videosCompleted: number;
  lastActive: string | null;
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/teacher/students");
      const data = await res.json();
      if (data.success) setStudents(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = search
    ? students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
    : students;

  const getGradeColor = (pct: number) => {
    if (pct >= 80) return "text-emerald-500";
    if (pct >= 60) return "text-amber-500";
    if (pct > 0) return "text-red-500";
    return "text-muted-foreground";
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold">Students</h1>
        <p className="text-sm text-muted-foreground mt-1">View student progress and performance</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-3xl mb-3">👥</p>
          <p className="text-sm text-muted-foreground">{search ? "No students match your search." : "No students enrolled yet."}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-4">Student</div>
            <div className="col-span-2 text-center">Quiz Avg</div>
            <div className="col-span-2 text-center">Exam Avg</div>
            <div className="col-span-2 text-center">Videos</div>
            <div className="col-span-2 text-center">Activity</div>
          </div>

          {filtered.map((student) => (
            <div key={student.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 py-3 border-b border-border last:border-0 items-center hover:bg-muted/20">
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                  {student.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{student.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                </div>
              </div>
              <div className="col-span-2 text-center">
                <span className={`text-sm font-bold ${getGradeColor(student.quizAvg)}`}>
                  {student.quizCount > 0 ? `${student.quizAvg}%` : "—"}
                </span>
                <p className="text-[10px] text-muted-foreground">{student.quizCount} taken</p>
              </div>
              <div className="col-span-2 text-center">
                <span className={`text-sm font-bold ${getGradeColor(student.examAvg)}`}>
                  {student.examCount > 0 ? `${student.examAvg}%` : "—"}
                </span>
                <p className="text-[10px] text-muted-foreground">{student.examCount} taken</p>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm font-bold">{student.videosCompleted}</span>
                <p className="text-[10px] text-muted-foreground">completed</p>
              </div>
              <div className="col-span-2 text-center text-xs text-muted-foreground">
                {student.lastActive ? new Date(student.lastActive).toLocaleDateString() : "Never"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}