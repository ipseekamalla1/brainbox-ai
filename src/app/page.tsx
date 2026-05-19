"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useEffect, useRef } from "react";
import Image from "next/image";
import "../css/brainbox.css"
import TrustedBy from "@/components/homepage/Trustedby";
import  MissionSection  from '@/components/homepage/MissionSection';
import FeaturesSection from "@/components/homepage/FeatureSection";
import AnalyticsSection from "@/components/homepage/AnalyticsSection";
import HowItWorksSection from "@/components/homepage/HowItWorksSection";
import Testimonials from '../components/homepage/Testimonials';
import StatsTrustSection from "@/components/homepage/StatsTrustSection";
import CTASection from "@/components/homepage/CTASection";


const stats = [
  { value: "6+", label: "AI Features" },
  { value: "3",  label: "User Roles"  },
  { value: "∞",  label: "Scalability" },
];



export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll reveal
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.07 }
    );
    els.forEach((el) => io.observe(el));

    // Parallax hero on scroll
    const handleScroll = () => {
      const hero = heroRef.current;
      if (!hero) return;
      const img = hero.querySelector(".hero-img") as HTMLElement;
      if (!img) return;
      const y = window.scrollY * 0.25;
      img.style.top = `calc(-8% + ${y}px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="site-bg">
        {/* ══════════════════════════════
            HERO — Full bleed photography
        ══════════════════════════════ */}
        <section
          ref={heroRef}
          style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "flex-end", overflow: "hidden" }}
        >
          {/* Photo background */}
          <div className="hero-img-wrap">
  <Image
    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&q=80"
    alt="Hero background"
    fill
    priority
    sizes="100vw"
    className="hero-img"
  />
</div>
          <div className="hero-overlay" />

          {/* Content — bottom-anchored, editorial style */}
          <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 1200, margin: "0 auto", padding: "64px 48px 100px" }}>

            {/* Eyebrow */}
            <div className="anim-1" style={{ marginBottom: 28 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 400, letterSpacing: "3px", textTransform: "uppercase", color: "var(--gold-light)" }}>
                <span style={{ display: "inline-block", width: 32, height: 1, background: "var(--gold-light)" }} />
                AI-Powered Education Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="f-display anim-2" style={{ fontSize: "clamp(52px, 8vw, 108px)", fontWeight: 700, lineHeight: 1.0, letterSpacing: "-3px", color: "#FFFEF9", marginBottom: 32, maxWidth: 900 }}>
              The smartest way
              <br />
              to <em className="text-gold">learn</em>
              <br />
              &amp; <em style={{ fontStyle: "italic", color: "#FFFEF9" }}>teach.</em>
            </h1>

            {/* Sub */}
            <p className="f-body anim-3" style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.7, color: "rgba(255,254,249,0.72)", maxWidth: 520, marginBottom: 44 }}>
              A complete university LMS with AI tutoring, smart quizzes, exam management,
              video learning, and real-time analytics — all in one beautiful platform.
            </p>

            {/* CTAs */}
            <div className="anim-4" style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 72 }}>
              <Link href="/register" className="btn-primary">
                Get Started Free <span style={{ opacity: 0.7 }}>→</span>
              </Link>
              <Link href="/features" className="btn-ghost">
                Explore Features
              </Link>
            </div>

            {/* Stats row */}
            <div className="anim-4 stats-row" style={{ display: "flex", gap: 56, alignItems: "center" }}>
              {stats.map((s, i) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 56 }}>
                  <div>
                    <div className="f-display text-gold" style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, letterSpacing: "-1px" }}>
                      {s.value}
                    </div>
                    <div className="f-body" style={{ fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,254,249,0.5)", marginTop: 6 }}>
                      {s.label}
                    </div>
                  </div>
                  {i < stats.length - 1 && (
                    <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.2)" }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{ position: "absolute", bottom: 40, right: 48, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 1, height: 56, background: "linear-gradient(to bottom, transparent, rgba(255,254,249,0.4))" }} />
            <span className="f-body" style={{ fontSize: 9, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,254,249,0.4)", writingMode: "vertical-rl" }}>Scroll</span>
          </div>
        </section>

        <TrustedBy></TrustedBy>
        <MissionSection></MissionSection>
        <FeaturesSection></FeaturesSection>
        <AnalyticsSection></AnalyticsSection>
        <HowItWorksSection></HowItWorksSection>
        <Testimonials></Testimonials>
        <StatsTrustSection></StatsTrustSection>
        <CTASection></CTASection>

    
      
      </main>
      <Footer />
    </>
  );
}