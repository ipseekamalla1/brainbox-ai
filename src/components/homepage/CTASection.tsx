"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import "@/css/home.css";

const trustBadges = [
  "🔒 SOC 2 Compliant",
  "🌍 GDPR Ready",
  "⚡ 99.9% Uptime",
];

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);

  /* ── Ken-Burns kick-off + reveal observer ── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Trigger the Ken-Burns zoom-out on mount
    requestAnimationFrame(() => section.classList.add("bg-loaded"));

    // Reveal each .reveal element when it enters the viewport
    const revealEls = section.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);

  /* ── Floating particle canvas ── */
  useEffect(() => {
    const canvas  = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const resize = () => {
      canvas.width  = section.offsetWidth;
      canvas.height = section.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    interface Particle {
      x: number; y: number; r: number;
      sx: number; sy: number;
      alpha: number; flicker: number;
    }

    const NUM = 50;
    const particles: Particle[] = Array.from({ length: NUM }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      r:       Math.random() * 1.4 + 0.3,
      sx:      (Math.random() - 0.5) * 0.22,
      sy:      -(Math.random() * 0.35 + 0.08),
      alpha:   Math.random() * 0.45 + 0.12,
      flicker: Math.random() * Math.PI * 2,
    }));

    const GOLD = "201,148,58"; // matches var(--primary) hue; adjust if needed

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.flicker += 0.022;
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.flicker));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GOLD},${a})`;
        ctx.fill();

        p.x += p.sx;
        p.y += p.sy;

        if (p.y < -6)                   { p.y = canvas.height + 6; p.x = Math.random() * canvas.width; }
        if (p.x < -6)                   p.x = canvas.width + 6;
        if (p.x > canvas.width + 6)     p.x = -6;
      });

      animId = requestAnimationFrame(tick);
    };
    tick();

    // Cursor burst: spawns extra particles at mouse position
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (let i = 0; i < 3; i++) {
        particles.push({
          x:       mx + (Math.random() - 0.5) * 18,
          y:       my + (Math.random() - 0.5) * 18,
          r:       Math.random() * 1.8 + 0.4,
          sx:      (Math.random() - 0.5) * 0.7,
          sy:      -(Math.random() * 1.1 + 0.3),
          alpha:   Math.random() * 0.6 + 0.25,
          flicker: Math.random() * Math.PI * 2,
        });
      }
      // Keep pool bounded
      if (particles.length > NUM + 50) particles.splice(0, 3);
    };
    canvas.addEventListener("mousemove", onMove);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <section className="cta-section" ref={sectionRef}>

      {/* Background image (Ken-Burns via CSS) */}
      <img
        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1800&q=80"
        alt=""
        className="cta-bg-img"
        aria-hidden="true"
      />

      {/* Floating gold particles */}
      <canvas
        className="cta-particle-canvas"
        ref={canvasRef}
        aria-hidden="true"
      />

      {/* Pulsing ambient rings */}
      <div className="cta-rings" aria-hidden="true">
        <div className="cta-ring" />
        <div className="cta-ring" />
        <div className="cta-ring" />
      </div>

      {/* Overlay + content */}
      <div className="cta-overlay">
        <div className="cta-container">

          {/* Label */}
          <div className="cta-label reveal">
            <span className="line" />
            Start Today — Its Free
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
              Get Started — Its Free →
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