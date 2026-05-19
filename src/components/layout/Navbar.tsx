// src/components/layout/Navbar.tsx — Public Site Navigation

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/theme/ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // When not scrolled: transparent bar over dark hero photo → white text
  // When scrolled: solid background → default theme text
  const isTransparent = !scrolled;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "background 0.4s ease, backdrop-filter 0.4s ease, border-bottom 0.4s ease",
        background: scrolled ? "hsl(var(--background) / 0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid hsl(var(--border))" : "1px solid transparent",
      }}
    >
      <nav
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 48px",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "#C9943A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              fontSize: 16,
              color: "#1A1208",
              transition: "transform 0.2s",
            }}
          >
            B
          </div>
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "-0.5px",
              color: isTransparent ? "#FFFEF9" : "hsl(var(--foreground))",
              transition: "color 0.4s",
            }}
          >
            Brainbox
            <span style={{ color: "#C9943A" }}>AI</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 36 }} className="hidden-mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: "0.3px",
                color: isTransparent ? "rgba(255,254,249,0.75)" : "hsl(var(--muted-foreground))",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = isTransparent ? "#FFFEF9" : "hsl(var(--foreground))";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = isTransparent ? "rgba(255,254,249,0.75)" : "hsl(var(--muted-foreground))";
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="hidden-mobile">
          <ThemeToggle />
          <Link
            href="/login"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 400,
              color: isTransparent ? "rgba(255,254,249,0.75)" : "hsl(var(--muted-foreground))",
              textDecoration: "none",
              padding: "8px 16px",
              transition: "color 0.2s",
            }}
          >
            Log in
          </Link>
          <Link
            href="/register"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 500,
              color: "#1A1208",
              background: "#E8C878",
              padding: "9px 22px",
              borderRadius: 2,
              textDecoration: "none",
              letterSpacing: "0.2px",
              transition: "background 0.2s",
              boxShadow: "0 2px 12px rgba(201,148,58,0.3)",
            }}
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="show-mobile"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
            color: isTransparent ? "#FFFEF9" : "hsl(var(--foreground))",
            display: "none",
          }}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
            {mobileOpen ? (
              <path d="M5 5l12 12M17 5L5 17" />
            ) : (
              <>
                <path d="M3 7h16M3 11h16M3 15h16" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          style={{
            background: "hsl(var(--background) / 0.96)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid hsl(var(--border))",
          }}
        >
          <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: "hsl(var(--muted-foreground))",
                  textDecoration: "none",
                  padding: "10px 0",
                  borderBottom: "1px solid hsl(var(--border))",
                }}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ display: "flex", gap: 12, paddingTop: 16, alignItems: "center" }}>
              <ThemeToggle />
              <Link
                href="/login"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "hsl(var(--muted-foreground))", textDecoration: "none", padding: "8px 0" }}
              >
                Log in
              </Link>
              <Link
                href="/register"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: "#1A1208", background: "#E8C878", padding: "9px 20px", borderRadius: 2, textDecoration: "none" }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  );
}