// src/app/(dashboard)/student/quizzes/page.tsx — Student Quiz System

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface QuizListItem {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  createdAt: string;
  createdBy: { name: string };
  _count: { questions: number };
}

interface QuizQuestion {
  id: string;
  type: "MCQ" | "SHORT_ANSWER";
  question: string;
  options?: string[];
  points: number;
  order: number;
}

interface QuizResult {
  score: number;
  maxScore: number;
  percentage: number;
  answers: {
    questionId: string;
    answer: string;
    isCorrect: boolean;
    question: {
      question: string;
      correctAnswer: string;
      options?: string[];
      points: number;
      type: string;
    };
  }[];
}

type View = "list" | "taking" | "result";

export default function StudentQuizzesPage() {
  const [view, setView] = useState<View>("list");
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Quiz taking state
  const [activeQuiz, setActiveQuiz] = useState<{ id: string; title: string; timeLimit?: number } | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Result state
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    fetchQuizzes();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch("/api/quizzes");
      const data = await res.json();
      if (data.success) setQuizzes(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quiz: QuizListItem) => {
    try {
      // Fetch full quiz with questions
      const quizRes = await fetch(`/api/quizzes/${quiz.id}`);
      const quizData = await quizRes.json();
      if (!quizData.success) return;

      // Start attempt
      const attemptRes = await fetch(`/api/quizzes/${quiz.id}`, { method: "POST" });
      const attemptData = await attemptRes.json();
      if (!attemptData.success) return;

      setActiveQuiz({ id: quiz.id, title: quiz.title, timeLimit: quiz.timeLimit });
      setQuestions(quizData.data.questions);
      setAttemptId(attemptData.data.id);
      setCurrentQ(0);
      setAnswers({});
      setView("taking");

      // Start timer
      if (quiz.timeLimit) {
        const totalSeconds = quiz.timeLimit * 60;
        setTimeLeft(totalSeconds);
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev === null || prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              // Auto-submit
              handleSubmit(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = useCallback(async (auto = false) => {
    if (!attemptId || !activeQuiz || submitting) return;
    setSubmitting(true);

    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const answerArray = questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || "",
      }));

      const res = await fetch(`/api/quizzes/${activeQuiz.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers: answerArray }),
      });

      const data = await res.json();
      if (data.success) {
        setResult({
          score: data.data.score,
          maxScore: data.data.maxScore,
          percentage: data.data.percentage,
          answers: data.data.answers,
        });
        setView("result");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, activeQuiz, answers, questions, submitting]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getGrade = (pct: number) => {
    if (pct >= 90) return { letter: "A+", color: "text-emerald-500" };
    if (pct >= 80) return { letter: "A", color: "text-emerald-500" };
    if (pct >= 70) return { letter: "B", color: "text-blue-500" };
    if (pct >= 60) return { letter: "C", color: "text-amber-500" };
    return { letter: "F", color: "text-red-500" };
  };

  // ─── List View ──────────────────────────────────
  if (view === "list") {
    return (
      <div>
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-bold">Quizzes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Test your knowledge with auto-graded quizzes
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-shimmer" />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-3xl mb-3">📝</p>
            <p className="text-sm text-muted-foreground">
              No quizzes available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-5 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">{quiz.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-muted-foreground">
                        {quiz._count.questions} questions
                      </span>
                      {quiz.timeLimit && (
                        <>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            ⏱ {quiz.timeLimit} min
                          </span>
                        </>
                      )}
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        By {quiz.createdBy.name}
                      </span>
                    </div>
                    {quiz.description && (
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        {quiz.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => startQuiz(quiz)}
                    className="px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity flex-shrink-0"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Taking View ────────────────────────────────
  if (view === "taking" && questions.length > 0) {
    const q = questions[currentQ];
    const answered = Object.keys(answers).length;
    const total = questions.length;

    return (
      <div>
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6 p-4 rounded-xl border border-border bg-card">
          <div>
            <h2 className="font-semibold text-sm">{activeQuiz?.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Question {currentQ + 1} of {total} · {answered}/{total} answered
            </p>
          </div>
          {timeLeft !== null && (
            <div className={`font-mono text-lg font-bold ${timeLeft < 60 ? "text-red-500 animate-pulse" : "text-primary"}`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Progress Dots */}
        <div className="flex gap-1.5 mb-6 flex-wrap">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                i === currentQ
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                  : answers[questions[i].id]
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question Card */}
        <div className="p-6 rounded-2xl border border-border bg-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
              {q.type === "MCQ" ? "Multiple Choice" : "Short Answer"} · {q.points} pt{q.points > 1 ? "s" : ""}
            </span>
          </div>

          <h3 className="text-base font-semibold mb-5 leading-relaxed">{q.question}</h3>

          {/* MCQ Options */}
          {q.type === "MCQ" && q.options && (
            <div className="space-y-2">
              {(q.options as string[]).map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    answers[q.id] === opt
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        answers[q.id] === opt
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="text-sm">{opt}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Short Answer */}
          {q.type === "SHORT_ANSWER" && (
            <textarea
              value={answers[q.id] || ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Type your answer..."
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium disabled:opacity-30 hover:bg-secondary transition-colors"
          >
            ← Previous
          </button>

          {currentQ < total - 1 ? (
            <button
              onClick={() => setCurrentQ(currentQ + 1)}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? "Submitting..." : "Submit Quiz ✓"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── Result View ────────────────────────────────
  if (view === "result" && result) {
    const grade = getGrade(result.percentage);

    return (
      <div>
        {/* Score Header */}
        <div className="text-center mb-8 p-8 rounded-2xl border border-border bg-card">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Quiz Complete
          </p>
          <div className={`font-serif text-6xl font-bold mb-2 ${grade.color}`}>
            {grade.letter}
          </div>
          <p className="text-2xl font-bold font-serif mb-1">
            {result.score}/{result.maxScore}
          </p>
          <p className="text-sm text-muted-foreground">
            {result.percentage}% · {result.answers.filter((a) => a.isCorrect).length}/{result.answers.length} correct
          </p>

          {/* Score Bar */}
          <div className="max-w-xs mx-auto mt-4">
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  result.percentage >= 70 ? "bg-emerald-500" : result.percentage >= 50 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${result.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Answer Review */}
        <h2 className="font-semibold text-base mb-4">Answer Review</h2>
        <div className="space-y-3 mb-8">
          {result.answers.map((ans, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border ${
                ans.isCorrect
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-red-500/20 bg-red-500/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    ans.isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {ans.isCorrect ? "✓" : "✕"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">{ans.question.question}</p>
                  <p className="text-xs">
                    <span className="text-muted-foreground">Your answer: </span>
                    <span className={ans.isCorrect ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>
                      {ans.answer || "(no answer)"}
                    </span>
                  </p>
                  {!ans.isCorrect && (
                    <p className="text-xs mt-1">
                      <span className="text-muted-foreground">Correct: </span>
                      <span className="text-emerald-500 font-medium">
                        {ans.question.correctAnswer}
                      </span>
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {ans.question.points} pt{ans.question.points > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setView("list");
            setResult(null);
            setActiveQuiz(null);
          }}
          className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          ← Back to Quizzes
        </button>
      </div>
    );
  }

  return null;
}