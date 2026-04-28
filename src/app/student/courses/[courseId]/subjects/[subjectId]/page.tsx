// ============================================================
// FILE LOCATION: app/student/courses/[courseId]/subjects/[subjectId]/page.tsx
// ACTION: CREATE NEW
// PURPOSE: Student page - view all notes videos quizzes exams for one subject
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ChevronRight, FileText, Video, ClipboardList, ScrollText, Loader2, Play, Download, Clock, BookMarked, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Subject { id: string; name: string; description?: string; }
interface Note { id: string; title: string; fileType: string; fileSize?: number; summary?: string; }
interface VideoItem { id: string; title: string; duration?: number; progress?: { completed: boolean; watchedSeconds: number }; }
interface Quiz { id: string; title: string; timeLimit?: number; }
interface Exam { id: string; title: string; timeLimit: number; isPublished: boolean; startTime?: string; }

type STab = "notes" | "videos" | "quizzes" | "exams";

export default function SubjectDetailPage() {
  const params = useParams<{ courseId: string; subjectId: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [courseCode, setCourseCode] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [tab, setTab] = useState<STab>("notes");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/courses/${params.courseId}/subjects/${params.subjectId}`).then((r) => r.json()),
      fetch(`/api/courses/${params.courseId}`).then((r) => r.json()),
      fetch(`/api/notes?subjectId=${params.subjectId}`).then((r) => r.json()),
      fetch(`/api/videos?subjectId=${params.subjectId}`).then((r) => r.json()),
      fetch(`/api/quizzes?subjectId=${params.subjectId}`).then((r) => r.json()),
      fetch(`/api/exams?subjectId=${params.subjectId}`).then((r) => r.json()),
    ]).then(([s, c, n, v, q, e]) => {
      setSubject(s.subject);
      setCourseCode(c.course?.code ?? "");
      setNotes(n.notes ?? []);
      setVideos(v.videos ?? []);
      setQuizzes(q.quizzes ?? []);
      setExams(e.exams ?? []);
      if (n.notes?.length) setTab("notes");
      else if (v.videos?.length) setTab("videos");
      else if (q.quizzes?.length) setTab("quizzes");
      else if (e.exams?.length) setTab("exams");
      setLoading(false);
    });
  }, [params]);

  if (loading || !subject) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  const counts = { notes: notes.length, videos: videos.length, quizzes: quizzes.length, exams: exams.length };
  const icons = { notes: FileText, videos: Video, quizzes: ClipboardList, exams: ScrollText };

  return (
    <div className="min-h-screen bg-background dot-pattern">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-6 flex-wrap">
          <Link href="/student/courses" className="hover:text-foreground">My Courses</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/student/courses/${params.courseId}`} className="hover:text-foreground">{courseCode}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary truncate max-w-[200px]">{subject.name}</span>
        </div>

        <div className="bg-card border border-border rounded-lg p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <BookMarked className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-foreground">{subject.name}</h1>
              {subject.description && <p className="text-sm text-muted-foreground mt-1">{subject.description}</p>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 flex-wrap mb-5">
          {(["notes", "videos", "quizzes", "exams"] as STab[]).map((t) => {
            const Icon = icons[t];
            return (
              <button key={t} onClick={() => setTab(t)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="capitalize">{t}</span>
                {counts[t] > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t ? "bg-primary-foreground/20" : "bg-secondary"}`}>{counts[t]}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-3">
          {tab === "notes" && (notes.length === 0
            ? <p className="text-center py-10 text-sm text-muted-foreground">No notes for this subject.</p>
            : notes.map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg hover:border-border/60 transition-all group">
                <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{n.title}</p>
                  {n.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.summary}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{n.fileType?.split("/").pop()?.toUpperCase()}</span>
                    {n.fileSize && <span className="text-xs text-muted-foreground">{(n.fileSize / 1024).toFixed(0)} KB</span>}
                  </div>
                </div>
                <a href={`/api/notes/${n.id}/download`} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100">
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))
          )}

          {tab === "videos" && (videos.length === 0
            ? <p className="text-center py-10 text-sm text-muted-foreground">No videos for this subject.</p>
            : videos.map((v) => {
              const pct = v.progress && v.duration ? Math.round((v.progress.watchedSeconds / v.duration) * 100) : 0;
              return (
                <Link key={v.id} href={`/student/videos/${v.id}`}
                  className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-all group">
                  <div className="relative w-9 h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Play className="w-4 h-4 text-primary" />
                    {v.progress?.completed && <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"><CheckCircle2 className="w-2.5 h-2.5 text-white" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{v.title}</p>
                    {v.duration && <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock className="w-2.5 h-2.5" />{Math.round(v.duration / 60)}m</span>}
                    {pct > 0 && !v.progress?.completed && <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} /></div>}
                  </div>
                </Link>
              );
            })
          )}

          {tab === "quizzes" && (quizzes.length === 0
            ? <p className="text-center py-10 text-sm text-muted-foreground">No quizzes for this subject.</p>
            : quizzes.map((q) => (
              <Link key={q.id} href={`/student/quizzes/${q.id}`}
                className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-all group">
                <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"><ClipboardList className="w-4 h-4 text-primary" /></div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{q.title}</p>
                  {q.timeLimit && <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock className="w-2.5 h-2.5" />{q.timeLimit}m</span>}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))
          )}

          {tab === "exams" && (exams.length === 0
            ? <p className="text-center py-10 text-sm text-muted-foreground">No exams for this subject.</p>
            : exams.map((e) => {
              const available = e.isPublished && (!e.startTime || new Date(e.startTime) <= new Date());
              return (
                <div key={e.id} className={`flex items-center gap-3 p-4 bg-card border rounded-lg ${available ? "border-border hover:border-primary/30" : "border-border opacity-60"}`}>
                  <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"><ScrollText className="w-4 h-4 text-primary" /></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{e.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{e.timeLimit}m</span>
                      {e.startTime && <span>Opens {new Date(e.startTime).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  {available
                    ? <Link href={`/student/exams/${e.id}`} className="text-xs px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">Start</Link>
                    : <span className="text-xs px-2.5 py-1.5 rounded-md bg-secondary text-muted-foreground">{e.isPublished ? "Scheduled" : "Unavailable"}</span>
                  }
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}