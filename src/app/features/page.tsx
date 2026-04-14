// src/app/(public)/features/page.tsx — Features Page

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = { title: "Features" };

const featureGroups = [
  {
    category: "AI-Powered",
    features: [
      {
        title: "AI Tutor Chat",
        description:
          "ChatGPT-style conversational tutor that explains any concept with examples, step-by-step reasoning, and follow-up questions.",
        tags: ["GPT-4", "Streaming", "Context-Aware"],
      },
      {
        title: "AI Quiz Generator",
        description:
          "Upload your notes and instantly generate MCQ or short-answer quizzes. Control difficulty, question count, and topic focus.",
        tags: ["Auto-Generate", "From Notes", "Configurable"],
      },
      {
        title: "AI Note Summarizer",
        description:
          "Upload PDFs, DOCX, or presentations and get structured, concise summaries highlighting key concepts and terms.",
        tags: ["PDF", "DOCX", "PPTX"],
      },
      {
        title: "AI Feedback System",
        description:
          "Analyzes student answers and provides constructive, specific feedback explaining what was correct and what needs improvement.",
        tags: ["Per-Question", "Constructive", "Instant"],
      },
    ],
  },
  {
    category: "Assessment",
    features: [
      {
        title: "Quiz System",
        description:
          "Create timer-based quizzes with MCQ and short-answer questions. Auto-grading calculates scores instantly and stores results.",
        tags: ["Timer", "Auto-Grade", "MCQ + Short Answer"],
      },
      {
        title: "Exam Engine",
        description:
          "University-level exams with section-based organization, time limits, scheduled windows, auto-submit on timeout, and anti-cheating UI.",
        tags: ["Sections", "Anti-Cheat", "Auto-Submit"],
      },
      {
        title: "Marks & Grading",
        description:
          "Complete grade tracking with percentage scores, letter grades, and historical performance data stored per student.",
        tags: ["Auto-Calculate", "History", "Per-Student"],
      },
    ],
  },
  {
    category: "Learning Tools",
    features: [
      {
        title: "Notes System",
        description:
          "Upload and organize notes by course, subject, and topic. Firebase Cloud Storage for reliable file hosting with metadata in PostgreSQL.",
        tags: ["Firebase", "Organized", "Searchable"],
      },
      {
        title: "Video Learning",
        description:
          "Embed or upload course videos with per-user progress tracking. Students resume exactly where they stopped.",
        tags: ["Progress Tracking", "Resume", "Completion"],
      },
      {
        title: "Performance Analytics",
        description:
          "Interactive Recharts dashboards showing quiz scores, exam results, progress trends, weak topics, and class-wide performance.",
        tags: ["Recharts", "Trends", "Weak Topics"],
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 text-center mb-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Features
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            A complete education <span className="text-primary italic">ecosystem</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every feature is designed to make teaching more efficient and
            learning more effective — powered by AI and built for scale.
          </p>
        </section>

        {/* Feature Groups */}
        {featureGroups.map((group) => (
          <section key={group.category} className="max-w-6xl mx-auto px-6 mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-primary mb-6 pl-1">
              {group.category}
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {group.features.map((feature) => (
                <div
                  key={feature.title}
                  className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors"
                >
                  <h3 className="font-semibold text-base mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary/8 text-primary border border-primary/15"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}