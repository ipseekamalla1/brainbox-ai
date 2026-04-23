// src/app/(dashboard)/student/exams/page.tsx — Student Exam System

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ExamListItem {
  id: string;
  title: string;
  description?: string;
  timeLimit: number;
  startTime?: string;
  endTime?: string;
  createdBy: { name: string };
  sections: { title: string; _count: { questions: number } }[];
}

interface ExamSection {
  id: string;
  title: string;
  description?: string;
  questions: {
    id: string;
    type: "MCQ" | "SHORT_ANSWER" | "LONG_ANSWER";
    question: string;
    options?: string[];
    points: number;
  }[];
}

interface ExamResult {
  score: number;
  maxScore: number;
  percentage: number | null;
  autoSubmit: boolean;
  exam: { title: string };
  answers: {
    answer: string;
    isCorrect: boolean | null;
    score: number | null;
    question: {
      question: string;
      correctAnswer?: string;
      type: string;
      points: number;
    };
  }[];
}

type View = "list" | "taking" | "result";

export default function StudentExamsPage() {
  const [view, setView] = useState<View>("list");
  const [exams, setExams] = useState<ExamListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Taking state
  const [sections, setSections] = useState<ExamSection[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const [activeQ, setActiveQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [examMeta, setExamMeta] = useState<{ id: string; title: string; timeLimit: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [tabWarnings, setTabWarnings] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Result state
  const [result, setResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    fetchExams();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Anti-cheat: detect tab switching
  useEffect(() => {
    if (view !== "taking") return;

    const handleVisibility = () => {
      if (document.hidden) {
        setTabWarnings((p) => {
          const next = p + 1;
          if (next >= 3) {
            // Auto-submit after 3 tab switches
            handleSubmit(true);
          }
          return next;
        });
      }
    };

    // Prevent right-click
    const handleContext = (e: MouseEvent) => e.preventDefault();

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("contextmenu", handleContext);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("contextmenu", handleContext);
    };
  }, [view]);

  const fetchExams = async () => {
    try {
      const res = await fetch("/api/exams");
      const data = await res.json();
      if (data.success) setExams(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const startExam = async (exam: ExamListItem) => {
    try {
      const examRes = await fetch(`/api/exams/${exam.id}`);
      const examData = await examRes.json();
      if (!examData.success) return;

      const attemptRes = await fetch(`/api/exams/${exam.id}`, { method: "POST" });
      const attemptData = await attemptRes.json();
      if (!attemptData.success) {
        alert(attemptData.error || "Cannot start exam");
        return;
      }

      setExamMeta({ id: exam.id, title: exam.title, timeLimit: exam.timeLimit });
      setSections(examData.data.sections);
      setAttemptId(attemptData.data.id);
      setActiveSection(0);
      setActiveQ(0);
      setAnswers({});
      setTabWarnings(0);
      setView("taking");

      // Start timer
      const totalSeconds = exam.timeLimit * 60;
      setTimeLeft(totalSeconds);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Request fullscreen
      try { document.documentElement.requestFullscreen?.(); } catch {}
    } catch (err) { console.error(err); }
  };

  const handleSubmit = useCallback(async (auto = false) => {
    if (!attemptId || !examMeta || submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const allQuestions = sections.flatMap((s) => s.questions);
      const answerArray = allQuestions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || "",
      }));

      const res = await fetch(`/api/exams/${examMeta.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers: answerArray, autoSubmit: auto }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setView("result");
        try { document.exitFullscreen?.(); } catch {}
      }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  }, [attemptId, examMeta, answers, sections, submitting]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const totalQuestions = (exam: ExamListItem) => exam.sections.reduce((s, sec) => s + sec._count.questions, 0);

  // ─── LIST ─────────────────────────────────────
  if (view === "list") {
    return (
      <div>
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-bold">Exams</h1>
          <p className="text-sm text-muted-foreground mt-1">University-level timed exams with sections</p>
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-shimmer" />)}</div>
        ) : exams.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-3xl mb-3">🎓</p>
            <p className="text-sm text-muted-foreground">No exams available.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exams.map((exam) => (
              <div key={exam.id} className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{exam.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
                      <span>{exam.sections.length} sections</span>
                      <span>·</span>
                      <span>{totalQuestions(exam)} questions</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">⏱ {exam.timeLimit} min</span>
                      <span>·</span>
                      <span>By {exam.createdBy.name}</span>
                    </div>
                    {/* Sections preview */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {exam.sections.map((s) => (
                        <span key={s.title} className="text-[10px] px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border">
                          {s.title} ({s._count.questions}Q)
                        </span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => startExam(exam)}
                    className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity flex-shrink-0">
                    Start Exam
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── TAKING ───────────────────────────────────
  if (view === "taking" && sections.length > 0) {
    const section = sections[activeSection];
    const q = section.questions[activeQ];
    const totalAnswered = Object.keys(answers).filter((k) => answers[k]?.trim()).length;
    const totalQs = sections.reduce((s, sec) => s + sec.questions.length, 0);
    const isUrgent = timeLeft < 300; // less than 5 min

    return (
      <div className="min-h-screen -m-8 p-6 bg-background">
        {/* Anti-cheat warning */}
        {tabWarnings > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-500 text-center font-medium">
            ⚠️ Tab switch detected ({tabWarnings}/3). Exam will auto-submit after 3 switches.
          </div>
        )}

        {/* Exam Header Bar */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card mb-4">
          <div>
            <h2 className="font-semibold text-sm">{examMeta?.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Section {activeSection + 1}/{sections.length}: {section.title} · Q{activeQ + 1}/{section.questions.length} · {totalAnswered}/{totalQs} answered
            </p>
          </div>
          <div className={`font-mono text-xl font-bold ${isUrgent ? "text-red-500 animate-pulse" : "text-primary"}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {sections.map((s, i) => {
            const sAnswered = s.questions.filter((q) => answers[q.id]?.trim()).length;
            return (
              <button key={s.id} onClick={() => { setActiveSection(i); setActiveQ(0); }}
                className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors ${
                  i === activeSection ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                }`}>
                {s.title} ({sAnswered}/{s.questions.length})
              </button>
            );
          })}
        </div>

        {/* Question */}
        <div className="p-6 rounded-2xl border border-border bg-card mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-primary/10 text-primary">
              {q.type === "MCQ" ? "Multiple Choice" : q.type === "SHORT_ANSWER" ? "Short Answer" : "Long Answer"} · {q.points} pt{q.points > 1 ? "s" : ""}
            </span>
            <span className="text-xs text-muted-foreground">Q{activeQ + 1} of {section.questions.length}</span>
          </div>

          <h3 className="text-base font-semibold mb-5 leading-relaxed">{q.question}</h3>

          {q.type === "MCQ" && q.options && (
            <div className="space-y-2">
              {(q.options as string[]).map((opt, i) => (
                <button key={i} onClick={() => setAnswers((p) => ({ ...p, [q.id]: opt }))}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    answers[q.id] === opt ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-border hover:border-primary/30"
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      answers[q.id] === opt ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
                    }`}>{String.fromCharCode(65 + i)}</div>
                    <span className="text-sm">{opt}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {(q.type === "SHORT_ANSWER" || q.type === "LONG_ANSWER") && (
            <textarea
              value={answers[q.id] || ""}
              onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
              rows={q.type === "LONG_ANSWER" ? 8 : 3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder={q.type === "LONG_ANSWER" ? "Write your detailed answer..." : "Type your answer..."}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (activeQ > 0) setActiveQ(activeQ - 1);
              else if (activeSection > 0) {
                setActiveSection(activeSection - 1);
                setActiveQ(sections[activeSection - 1].questions.length - 1);
              }
            }}
            disabled={activeSection === 0 && activeQ === 0}
            className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium disabled:opacity-30 hover:bg-secondary transition-colors">
            ← Previous
          </button>

          <div className="flex gap-2">
            {activeSection === sections.length - 1 && activeQ === section.questions.length - 1 ? (
              <button onClick={() => handleSubmit(false)} disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
                {submitting ? "Submitting..." : "Submit Exam ✓"}
              </button>
            ) : (
              <button
                onClick={() => {
                  if (activeQ < section.questions.length - 1) setActiveQ(activeQ + 1);
                  else if (activeSection < sections.length - 1) {
                    setActiveSection(activeSection + 1);
                    setActiveQ(0);
                  }
                }}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULT ───────────────────────────────────
  if (view === "result" && result) {
    const pct = result.percentage ?? 0;
    const grade = pct >= 90 ? { l: "A+", c: "text-emerald-500" } : pct >= 70 ? { l: "B", c: "text-blue-500" } : pct >= 50 ? { l: "C", c: "text-amber-500" } : { l: "F", c: "text-red-500" };
    const hasPending = result.answers.some((a) => a.isCorrect === null);

    return (
      <div>
        <div className="text-center mb-8 p-8 rounded-2xl border border-border bg-card">
          {result.autoSubmit && (
            <div className="inline-block mb-4 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-semibold">
              ⏱ Auto-submitted (time expired)
            </div>
          )}
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            {result.exam.title}
          </p>
          {hasPending ? (
            <>
              <p className="font-serif text-2xl font-bold mb-2">Pending Review</p>
              <p className="text-sm text-muted-foreground">
                Score so far: {result.score}/{result.maxScore} · Some answers need manual grading
              </p>
            </>
          ) : (
            <>
              <div className={`font-serif text-6xl font-bold mb-2 ${grade.c}`}>{grade.l}</div>
              <p className="text-2xl font-bold font-serif">{result.score}/{result.maxScore}</p>
              <p className="text-sm text-muted-foreground">{pct}%</p>
            </>
          )}
        </div>

        {/* Answer Review */}
        <h2 className="font-semibold text-base mb-4">Answer Review</h2>
        <div className="space-y-3 mb-8">
          {result.answers.map((ans, i) => (
            <div key={i} className={`p-4 rounded-xl border ${
              ans.isCorrect === null ? "border-amber-500/20 bg-amber-500/5"
              : ans.isCorrect ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-red-500/20 bg-red-500/5"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                  ans.isCorrect === null ? "bg-amber-500" : ans.isCorrect ? "bg-emerald-500" : "bg-red-500"
                }`}>
                  {ans.isCorrect === null ? "?" : ans.isCorrect ? "✓" : "✕"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">{ans.question.question}</p>
                  <p className="text-xs">
                    <span className="text-muted-foreground">Your answer: </span>
                    <span className="font-medium">{ans.answer || "(no answer)"}</span>
                  </p>
                  {ans.isCorrect === false && ans.question.correctAnswer && (
                    <p className="text-xs mt-1">
                      <span className="text-muted-foreground">Correct: </span>
                      <span className="text-emerald-500 font-medium">{ans.question.correctAnswer}</span>
                    </p>
                  )}
                  {ans.isCorrect === null && (
                    <p className="text-xs text-amber-500 mt-1 italic">Pending manual review</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{ans.question.points}pt</span>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => { setView("list"); setResult(null); }}
          className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
          ← Back to Exams
        </button>
      </div>
    );
  }

  return null;
}