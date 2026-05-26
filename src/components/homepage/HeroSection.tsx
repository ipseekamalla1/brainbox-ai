"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import "@/css/home.css";

const stats = [
  { value: "6+", label: "AI Features" },
  { value: "3", label: "User Roles" },
  { value: "∞", label: "Scalability" },
];

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const hero = heroRef.current;
      if (!hero) return;

      const img = hero.querySelector(".hero-img") as HTMLElement;
      if (!img) return;

      const y = window.scrollY * 0.25;
      img.style.top = `calc(-8% + ${y}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={heroRef} className="hero-section">

      {/* Background */}
      <div className="hero-img-wrap">
        <img
  src="https://images.pexels.com/photos/6549344/pexels-photo-6549344.jpeg?_gl=1*137rfbf*_ga*NTcwMzU1MTg2LjE3NzkyMDM0MzE.*_ga_8JE65Q40S6*czE3NzkyMDM0MzEkbzEkZzEkdDE3NzkyMDM0NDIkajQ5JGwwJGgw"
  alt="image"
  style={{ width: "100%", height: "auto" }}
/>
      </div>

      <div className="hero-overlay" />

      {/* Content */}
      <div className="hero-container">

      

        {/* Title */}
        <h1 className="f-display hero-title anim-2">
          The smartest way <br />
          to <em className="text-gold">learn</em> <br />
          &amp; <em className="italic-white">teach.</em>
        </h1>

        {/* Subtext */}
        <p className="f-body hero-sub anim-3">
          A complete university LMS with AI tutoring, smart quizzes, exam management,
          video learning, and real-time analytics — all in one beautiful platform.
        </p>

        {/* Buttons */}

<div className="hero-buttons anim-4">

  <Link href="/register" className="hero-btn-primary">
    Get Started Free →
  </Link>

  <Link href="/features" className="hero-btn-secondary">
    Explore Features
  </Link>

</div>

        {/* Stats */}
        <div className="hero-stats anim-4">
          {stats.map((s, i) => (
            <div key={i} className="hero-stat">
              <div className="hero-stat-value f-display">{s.value}</div>
              <div className="hero-stat-label">{s.label}</div>

              {i < stats.length - 1 && <div className="divider" />}
            </div>
          ))}
        </div>

      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <div className="scroll-line" />
        <span>Scroll</span>
      </div>

    </section>
  );
}