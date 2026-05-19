import React from "react";
import Link from "next/link";
import "@/css/home.css";

const trustBadges = [
  "🔒 SOC 2 Compliant",
  "🌍 GDPR Ready",
  "⚡ 99.9% Uptime",
];

export default function CTASection() {
  return (
    <section className="cta-section">

      {/* Background image */}
      <img
        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1800&q=80"
        alt=""
        className="cta-bg-img"
        aria-hidden="true"
      />

      {/* Overlay */}
      <div className="cta-overlay">

        <div className="cta-container">

          {/* Label */}
          <div className="cta-label reveal">
            <span className="line" />
            Start Today — It’s Free
            <span className="line" />
          </div>

          {/* Title */}
          <h2 className="f-display cta-title reveal">
            Ready to transform <br />
            your <em className="text-gold">learning?</em>
          </h2>

          {/* Description */}
          <p className="f-body cta-desc reveal">
            Join thousands of students and educators using Brainbox AI to make
            education smarter, faster, and more effective.
          </p>

          {/* Buttons */}
          <div className="cta-buttons reveal">
            <Link href="/register" className="btn-primary">
              Get Started — It’s Free →
            </Link>

            <Link href="/features" className="btn-ghost">
              Schedule a Demo
            </Link>
          </div>

          {/* Badges */}
          <div className="cta-badges reveal">
            {trustBadges.map((b, i) => (
              <span key={i}>{b}</span>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}