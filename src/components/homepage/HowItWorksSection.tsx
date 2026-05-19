import React from "react";

const howItWorks = [
  {
    step: "01",
    title: "Sign Up & Choose Your Role",
    description:
      "Create an account as a Student, Teacher, or Admin. Each role gets a tailored dashboard.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
  },
  {
    step: "02",
    title: "Enroll in Courses",
    description:
      "Browse available courses, access notes, videos, quizzes, and exams curated by your teachers.",
    image:
      "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&q=80",
  },
  {
    step: "03",
    title: "Learn with AI",
    description:
      "Use the AI tutor for help, auto-generate quizzes from notes, and get instant feedback.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
  },
  {
    step: "04",
    title: "Track Your Progress",
    description:
      "See your scores, grades, and performance trends. Identify weak areas and improve.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="how-section">
      <div className="how-container">

        <div className="how-header reveal">
          <span className="section-label">How It Works</span>

          <h2 className="how-title f-display">
            From signup to <em>success</em> in four steps.
          </h2>
        </div>

        <div className="how-grid reveal">
          {howItWorks.map((item) => (
            <div key={item.step} className="step-card">

              <img
                src={item.image}
                alt={item.title}
                className="step-card-img"
              />

              <div className="step-card-content">

                <div className="step-number f-display">
                  {item.step}
                </div>

                <h3 className="step-title f-display">
                  {item.title}
                </h3>

                <p className="step-desc f-body">
                  {item.description}
                </p>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}