"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import "@/css/components/Navbar.css";

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

  const isTransparent = !scrolled;

  return (
    <header
      className="navbar-header"
      style={{
        background: scrolled ? "hsl(var(--background) / 0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled
          ? "1px solid hsl(var(--border))"
          : "1px solid transparent",
      }}
    >
      <nav className="navbar-nav">

        {/* Logo */}
        <Link href="/" className="navbar-logo-link">
          <div className="navbar-logo-box">B</div>

          <span
            className="navbar-brand"
            style={{
              color: isTransparent ? "#FFFEF9" : "hsl(var(--foreground))",
            }}
          >
            Brainbox<span style={{ color: "#C9943A" }}>AI</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links hidden-mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="navbar-link"
              style={{
                color: isTransparent
                  ? "rgba(255,254,249,0.75)"
                  : "hsl(var(--muted-foreground))",
              }}
              onMouseEnter={(e) =>
                (e.target as HTMLElement).style.color = isTransparent
                  ? "#FFFEF9"
                  : "hsl(var(--foreground))"
              }
              onMouseLeave={(e) =>
                (e.target as HTMLElement).style.color = isTransparent
                  ? "rgba(255,254,249,0.75)"
                  : "hsl(var(--muted-foreground))"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="navbar-auth hidden-mobile">
          <ThemeToggle />

          <Link
            href="/login"
            className="navbar-login"
            style={{
              color: isTransparent
                ? "rgba(255,254,249,0.75)"
                : "hsl(var(--muted-foreground))",
            }}
          >
            Log in
          </Link>

          <Link href="/register" className="navbar-button">
            Get Started
          </Link>
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="navbar-mobile-btn show-mobile"
          style={{
            color: isTransparent
              ? "#FFFEF9"
              : "hsl(var(--foreground))",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {mobileOpen ? (
              <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" />
            ) : (
              <path d="M3 7h16M3 11h16M3 15h16" stroke="currentColor" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="navbar-mobile-menu">
          <div className="navbar-mobile-content">

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="navbar-mobile-link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="navbar-mobile-actions">
              <ThemeToggle />

              <Link href="/login" className="navbar-login">
                Log in
              </Link>

              <Link href="/register" className="navbar-button">
                Get Started
              </Link>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}