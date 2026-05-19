import React from "react";

const testimonials = [
  {
    quote:
      "Brainbox AI transformed how I study. The AI tutor explains things better than most textbooks.",
    name: "Priya S.",
    role: "Computer Science Student",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  },
  {
    quote:
      "Creating quizzes used to take hours. Now I generate them from my lecture notes in seconds.",
    name: "Dr. James K.",
    role: "Professor of Mathematics",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
  {
    quote:
      "The analytics dashboard gives me a clear picture of how my class is performing at a glance.",
    name: "Prof. Sarah L.",
    role: "Department Head, Physics",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <div className="testimonials-container">

        {/* Header */}
        <div className="testimonials-header reveal">
          <span className="testimonials-label">
            Testimonials
          </span>

          <h2 className="f-display testimonials-title">
            Loved by educators & <em className="text-gold">students</em> alike.
          </h2>
        </div>

        {/* Grid */}
        <div className="testimonials-grid reveal">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="quote-mark">“</div>

              <div className="stars">
                {[...Array(5)].map((_, j) => (
                  <span key={j}>★</span>
                ))}
              </div>

              <p className="testimonial-quote">
                “{t.quote}”
              </p>

              <div className="testimonial-user">
                <img src={t.image} alt={t.name} />
                <div>
                  <div className="name">{t.name}</div>
                  <div className="role">{t.role}</div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}