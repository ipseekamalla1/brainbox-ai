// src/app/(public)/about/page.tsx — About Page

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = { title: "About" };

const values = [
  {
    icon: "🎯",
    title: "Personalized Learning",
    description:
      "Every student learns differently. Our AI adapts explanations, pacing, and practice to each individual.",
  },
  {
    icon: "⚡",
    title: "Instant Feedback",
    description:
      "No more waiting days for grades. Auto-grading and AI feedback give students immediate insight into their performance.",
  },
  {
    icon: "📈",
    title: "Data-Driven Teaching",
    description:
      "Teachers see exactly where students struggle, enabling targeted intervention and curriculum improvement.",
  },
  {
    icon: "🔒",
    title: "Academic Integrity",
    description:
      "Built-in exam security features including timed sessions, auto-submit, and anti-cheating UI controls.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 text-center mb-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Our Mission
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Making education <span className="text-primary italic">intelligent</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Brainbox AI exists to bridge the gap between traditional education
            and the potential of artificial intelligence. We believe every
            student deserves a personal tutor, and every teacher deserves
            tools that save time and amplify impact.
          </p>
        </section>

        {/* Vision */}
        <section className="max-w-4xl mx-auto px-6 mb-20">
          <div className="rounded-2xl border border-border bg-card p-8 md:p-12">
            <h2 className="font-serif text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We envision a world where AI doesn&apos;t replace teachers — it
              supercharges them. Where students get instant, personalized
              feedback at 2 AM before an exam. Where analytics reveal learning
              gaps before they become failures.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Brainbox AI combines the rigor of a university LMS with the
              intelligence of modern AI, creating an education platform that
              feels like it was designed for the future — because it was.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-2xl font-bold text-center mb-12">
            What drives us
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="p-6 rounded-2xl border border-border bg-card"
              >
                <div className="text-2xl mb-3">{v.icon}</div>
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}