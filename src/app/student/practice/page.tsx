// src/app/student/practice/page.tsx — AI Practice Questions

"use client";

import { useState } from "react";

interface PracticeQ {
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  hint: string;
  explanation: string;
  difficulty: string;
}

export default function PracticePage() {
  const [topic, setTopic] = useState("");
  const [qType, setQType] = useState("mixed");
  const [questions, setQuestions] = useState<PracticeQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [userTextAnswer, setUserTextAnswer] = useState("");

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setQuestions([]);
    setCurrentQ(0);
    try {
      const res = await fetch("/api/ai/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, type: qType, count: 8 }),
      });
      const data = await res.json();
      if (data.success) setQuestions(data.data.questions);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const nextQuestion = () => {
    setCurrentQ((p) => Math.min(p + 1, questions.length - 1));
    setShowHint(false);
    setShowAnswer(false);
    setSelectedAnswer("");
    setUserTextAnswer("");
  };

  const prevQuestion = () => {
    setCurrentQ((p) => Math.max(p - 1, 0));
    setShowHint(false);
    setShowAnswer(false);
    setSelectedAnswer("");
    setUserTextAnswer("");
  };

  const diffColor: Record<string, string> = {
    easy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    hard: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const q = questions[currentQ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold">Practice Questions</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-generated questions with hints and explanations</p>
      </div>

      {/* Generator */}
      {questions.length === 0 && (
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🧠</span>
            <h2 className="font-semibold">Generate Practice Questions</h2>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Topic</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. Binary Search Trees, Integration, Newton's Laws" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Question Type</label>
            <div className="flex gap-2">
              {[{ v: "mixed", l: "Mixed" }, { v: "MCQ", l: "MCQ Only" }, { v: "OPEN_ENDED", l: "Open-Ended" }].map((t) => (
                <button key={t.v} onClick={() => setQType(t.v)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    qType === t.v ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                  }`}>{t.l}</button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading || !topic.trim()}
            className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity">
            {loading ? "Generating..." : "Generate Questions"}
          </button>
        </div>
      )}

      {/* Question Card */}
      {q && (
        <div>
          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-muted-foreground">Question {currentQ + 1} of {questions.length}</p>
            <button onClick={() => { setQuestions([]); setCurrentQ(0); }}
              className="text-xs text-muted-foreground hover:text-foreground">← New Topic</button>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${diffColor[q.difficulty] || diffColor.medium}`}>
                {q.difficulty}
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {q.type === "MCQ" ? "Multiple Choice" : "Open-Ended"}
              </span>
            </div>

            <h3 className="text-base font-semibold mb-5 leading-relaxed">{q.question}</h3>

            {/* MCQ Options */}
            {q.type === "MCQ" && q.options && (
              <div className="space-y-2 mb-4">
                {q.options.map((opt, i) => {
                  const isSelected = selectedAnswer === opt;
                  const isCorrect = showAnswer && opt === q.correctAnswer;
                  const isWrong = showAnswer && isSelected && opt !== q.correctAnswer;
                  return (
                    <button key={i} onClick={() => !showAnswer && setSelectedAnswer(opt)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                        isCorrect ? "border-emerald-500 bg-emerald-500/10"
                        : isWrong ? "border-red-500 bg-red-500/10"
                        : isSelected ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30"
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                          isCorrect ? "border-emerald-500 bg-emerald-500 text-white"
                          : isWrong ? "border-red-500 bg-red-500 text-white"
                          : isSelected ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground"
                        }`}>
                          {isCorrect ? "✓" : isWrong ? "✕" : String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-sm">{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Open-Ended */}
            {q.type === "OPEN_ENDED" && (
              <textarea value={userTextAnswer} onChange={(e) => setUserTextAnswer(e.target.value)}
                rows={4} disabled={showAnswer}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-4"
                placeholder="Type your answer..." />
            )}

            {/* Hint */}
            {!showAnswer && (
              <button onClick={() => setShowHint(!showHint)}
                className="text-xs text-amber-500 font-medium hover:underline mb-3 block">
                {showHint ? "Hide Hint ▲" : "💡 Show Hint ▼"}
              </button>
            )}
            {showHint && !showAnswer && (
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15 text-xs text-muted-foreground leading-relaxed mb-4">
                💡 {q.hint}
              </div>
            )}

            {/* Check / Reveal */}
            {!showAnswer && (
              <button onClick={() => setShowAnswer(true)}
                className="px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
                {q.type === "MCQ" ? "Check Answer" : "Reveal Answer"}
              </button>
            )}

            {/* Explanation */}
            {showAnswer && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-xs font-semibold text-emerald-500 mb-1">✓ Correct Answer</p>
                <p className="text-sm font-medium mb-2">{q.correctAnswer}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{q.explanation}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button onClick={prevQuestion} disabled={currentQ === 0}
              className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium disabled:opacity-30">← Previous</button>
            <button onClick={nextQuestion} disabled={currentQ === questions.length - 1}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-30">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}