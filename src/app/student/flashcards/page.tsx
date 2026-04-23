// src/app/student/flashcards/page.tsx — AI Flashcards with Flip Animation

"use client";

import { useState } from "react";

interface Flashcard {
  front: string;
  back: string;
  category: string;
}

export default function FlashcardsPage() {
  const [topic, setTopic] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, count: 12 }),
      });
      const data = await res.json();
      if (data.success) {
        setCards(data.data.flashcards);
        setCurrentIdx(0);
        setFlipped(false);
        setKnown(new Set());
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const next = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIdx((p) => Math.min(p + 1, cards.length - 1)), 150);
  };

  const prev = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIdx((p) => Math.max(p - 1, 0)), 150);
  };

  const markKnown = () => {
    setKnown((p) => new Set([...p, currentIdx]));
    next();
  };

  const card = cards[currentIdx];
  const progress = cards.length > 0 ? Math.round((known.size / cards.length) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold">Flashcards</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-generated flashcards — tap to flip</p>
      </div>

      {cards.length === 0 ? (
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4 max-w-lg mx-auto">
          <div className="text-center">
            <p className="text-3xl mb-3">🃏</p>
            <h2 className="font-semibold mb-1">Generate Flashcards</h2>
            <p className="text-xs text-muted-foreground">Enter a topic and AI will create study flashcards</p>
          </div>
          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. Photosynthesis, SQL Joins, French Revolution"
            onKeyDown={(e) => e.key === "Enter" && generate()} />
          <button onClick={generate} disabled={loading || !topic.trim()}
            className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50">
            {loading ? "Generating..." : "Generate Flashcards"}
          </button>
        </div>
      ) : (
        <div className="max-w-lg mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">Card {currentIdx + 1}/{cards.length}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-500 font-medium">{known.size} known</span>
              <span className="text-xs text-muted-foreground">·</span>
              <button onClick={() => { setCards([]); setCurrentIdx(0); }}
                className="text-xs text-muted-foreground hover:text-foreground">New Deck</button>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-6">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
          </div>

          {/* Flashcard */}
          <div
            onClick={() => setFlipped(!flipped)}
            className="relative cursor-pointer select-none mb-6"
            style={{ perspective: "1000px" }}
          >
            <div
              className="transition-transform duration-500 relative"
              style={{
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                minHeight: "280px",
              }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 p-8 rounded-2xl border border-border bg-card flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: "hidden" }}
              >
                {card?.category && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20 mb-4">
                    {card.category}
                  </span>
                )}
                <p className="text-lg font-semibold leading-relaxed">{card?.front}</p>
                <p className="text-xs text-muted-foreground mt-6">Tap to reveal answer</p>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 p-8 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <p className="text-xs font-semibold text-primary mb-3">ANSWER</p>
                <p className="text-base leading-relaxed">{card?.back}</p>
                <p className="text-xs text-muted-foreground mt-6">Tap to flip back</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button onClick={prev} disabled={currentIdx === 0}
              className="px-4 py-2 border border-border rounded-xl text-sm font-medium disabled:opacity-30">← Prev</button>

            <button onClick={markKnown}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                known.has(currentIdx)
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-emerald-600 text-white hover:opacity-90"
              }`}>
              {known.has(currentIdx) ? "✓ Known" : "Mark as Known"}
            </button>

            <button onClick={next} disabled={currentIdx === cards.length - 1}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-30">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}