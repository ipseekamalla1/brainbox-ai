"use client";

import Link from "next/link";
import "@/css/home.css";
/* =========================
   DATA (same file)
========================= */
const features = [
  {
    icon: "🧠",
    title: "AI Tutor",
    description:
      "Ask anything. Get university-level explanations powered by GPT-4 — with examples, analogies, and step-by-step breakdowns.",
    tag: "GPT-4 Powered",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
  },
  {
    icon: "📝",
    title: "Smart Quizzes",
    description:
      "Timer-based MCQ & short-answer quizzes with instant auto-grading. AI generates quizzes from your notes automatically.",
    tag: "Auto-graded",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
  },
  {
    icon: "🎓",
    title: "Exam Engine",
    description:
      "Full university-level exams with sections, time limits, and anti-cheating controls. Auto-submit on timeout.",
    tag: "Anti-cheat",
    image:
      "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&q=80",
  },
  {
    icon: "📊",
    title: "Analytics",
    description:
      "Track performance with interactive charts. See quiz scores, exam results, weak topics, and progress over time.",
    tag: "Real-time",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
  {
    icon: "📚",
    title: "Notes Hub",
    description:
      "Upload PDFs, DOCX, and presentations. AI summarizes your notes instantly. Everything organized by course.",
    tag: "AI Summary",
    image:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
  },
  {
    icon: "🎥",
    title: "Video Learning",
    description:
      "Watch course videos with progress tracking per user. Pick up exactly where you left off.",
    tag: "Progress Sync",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
  },
];

/* =========================
   COMPONENT
========================= */
export default function FeaturesSection() {
  return (
    <section className="features-section">
      <div className="features-container">

        {/* HEADER */}
        <div className="features-header reveal">
          <div>
            <span className="section-label">Platform Features</span>

            <h2 className="f-display features-title">
              Every tool a{" "}
              <em className="text-gold">modern university</em>{" "}
              needs.
            </h2>
          </div>

          <p className="f-body features-subtitle">
            Six integrated tools built to work in harmony — from the moment you log in
            to the moment you ace your exam.
          </p>
        </div>

        {/* GRID */}
        <div className="features-grid reveal">
          {features.map((f) => (
            <div key={f.title} className="feat-card">

              {/* shimmer */}
              <div className="feat-card-shimmer" />

              {/* image */}
              <div className="feat-card-img-wrap">
                <img src={f.image} alt={f.title} className="feat-card-img" />
                <div className="feat-card-img-overlay" />
                <div className="feat-card-icon">{f.icon}</div>
              </div>

              {/* content */}
              <div className="feat-card-body">

                <span className="tag">{f.tag}</span>

                <h3 className="f-display feat-card-title">
                  {f.title}
                </h3>

                <p className="f-body feat-card-desc">
                  {f.description}
                </p>

                <div className="feat-card-footer">
                  <Link href="/features" className="feat-card-link">
                    Learn more <span>→</span>
                  </Link>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}