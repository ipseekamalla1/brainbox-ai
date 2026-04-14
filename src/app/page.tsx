// src/app/page.tsx — Landing Page (Home)

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// ─── Data ───────────────────────────────────────────

const features = [
  {
    icon: "🧠",
    title: "AI Tutor",
    description:
      "Ask anything. Get university-level explanations powered by GPT-4 — with examples, analogies, and step-by-step breakdowns.",
  },
  {
    icon: "📝",
    title: "Smart Quizzes",
    description:
      "Timer-based MCQ & short-answer quizzes with instant auto-grading. AI generates quizzes from your notes automatically.",
  },
  {
    icon: "🎓",
    title: "Exam Engine",
    description:
      "Full university-level exams with sections, time limits, and anti-cheating controls. Auto-submit on timeout.",
  },
  {
    icon: "📊",
    title: "Analytics",
    description:
      "Track performance with interactive charts. See quiz scores, exam results, weak topics, and progress over time.",
  },
  {
    icon: "📚",
    title: "Notes Hub",
    description:
      "Upload PDFs, DOCX, and presentations. AI summarizes your notes instantly. Everything organized by course.",
  },
  {
    icon: "🎥",
    title: "Video Learning",
    description:
      "Watch course videos with progress tracking per user. Pick up exactly where you left off.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Sign Up & Choose Your Role",
    description:
      "Create an account as a Student, Teacher, or Admin. Each role gets a tailored dashboard.",
  },
  {
    step: "02",
    title: "Enroll in Courses",
    description:
      "Browse available courses, access notes, videos, quizzes, and exams curated by your teachers.",
  },
  {
    step: "03",
    title: "Learn with AI",
    description:
      "Use the AI tutor for help, auto-generate quizzes from notes, and get instant feedback on your answers.",
  },
  {
    step: "04",
    title: "Track Your Progress",
    description:
      "See your scores, grades, and performance trends. Identify weak areas and improve with targeted practice.",
  },
];

const testimonials = [
  {
    quote:
      "Brainbox AI transformed how I study. The AI tutor explains things better than most textbooks.",
    name: "Priya S.",
    role: "Computer Science Student",
  },
  {
    quote:
      "Creating quizzes used to take hours. Now I generate them from my lecture notes in seconds.",
    name: "Dr. James K.",
    role: "Professor of Mathematics",
  },
  {
    quote:
      "The analytics dashboard gives me a clear picture of how my class is performing at a glance.",
    name: "Prof. Sarah L.",
    role: "Department Head, Physics",
  },
];

// ─── Page Component ─────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* ─── Hero ─── */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 dot-pattern opacity-30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-24 pb-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary tracking-wide uppercase">
                AI-Powered Education Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-slide-up">
              The smartest way
              <br />
              to{" "}
              <span className="text-primary italic">learn & teach</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up [animation-delay:100ms]">
              A complete university LMS with AI tutoring, smart quizzes,
              exam management, video learning, and real-time analytics —
              all in one beautiful platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up [animation-delay:200ms]">
              <Link
                href="/register"
                className="px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/20"
              >
                Get Started Free
              </Link>
              <Link
                href="/features"
                className="px-8 py-3.5 border border-border text-foreground font-medium rounded-xl text-sm hover:bg-secondary transition-colors"
              >
                Explore Features
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto animate-fade-in [animation-delay:400ms]">
              {[
                { value: "6+", label: "AI Features" },
                { value: "3", label: "User Roles" },
                { value: "∞", label: "Scalability" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-serif text-2xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Features ─── */}
        <section className="py-24 bg-card border-y border-border">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                Platform Features
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">
                Everything you need to learn
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group p-6 rounded-2xl border border-border bg-background hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="font-semibold text-base mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                How It Works
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">
                From signup to success
              </h2>
            </div>

            <div className="space-y-8">
              {howItWorks.map((item, i) => (
                <div
                  key={item.step}
                  className="flex items-start gap-6 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-mono text-sm font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {item.step}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold text-base mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        <section className="py-24 bg-card border-y border-border">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                Testimonials
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">
                Loved by educators & students
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="p-6 rounded-2xl border border-border bg-background"
                >
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="py-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Ready to transform your learning?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands of students and educators using Brainbox AI
              to make education smarter, faster, and more effective.
            </p>
            <Link
              href="/register"
              className="inline-flex px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              Get Started — It&apos;s Free
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}