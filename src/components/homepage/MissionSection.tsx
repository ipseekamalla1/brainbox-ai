import Link from "next/link";
import "@/css/home.css";

export default function MissionSection() {
  return (
    <section className="mission-section">
      <div className="mission-container">

        {/* LEFT SIDE */}
        <div className="mission-text reveal">
          <span className="section-label">Our Mission</span>

          <h2 className="mission-title">
            Education deserves intelligence as brilliant as{" "}
            <em className="text-gold">the students</em>{" "}
            it serves.
          </h2>

          <p className="mission-desc">
            Brainbox AI was built for a single purpose: to make every
            moment of learning count. Not with flashy gimmicks — but
            with tools that genuinely understand where students struggle,
            and meet them exactly there.
          </p>

          <div className="mission-buttons">
            <Link href="/register" className="btn-primary">
              Start Learning →
            </Link>

            <Link href="/about" className="btn-outline">
              Our Story
            </Link>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="mission-image reveal d2">
          <div className="mission-img-wrapper">
            <img
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&q=80"
              alt="Students learning together"
            />
          </div>

          <div className="mission-badge">
            <div className="mission-percent">97%</div>

            <div className="mission-badge-text">
              of students reported improved grades within 4 weeks
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}