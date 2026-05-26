"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Load theme on mount
  useEffect(() => {
    setMounted(true);

    const saved = localStorage.getItem("theme");

    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const dark = saved ? saved === "dark" : systemDark;

    document.documentElement.classList.toggle("dark", dark);
    setIsDark(dark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;

    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
    setIsDark(newDark);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        padding: "9px 12px",
        borderRadius: "10px",

        border: "1px solid hsl(var(--border))",
        background: "hsl(var(--card))",
        color: "hsl(var(--foreground))",

        cursor: "pointer",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        fontSize: "14px",

        transition: "all 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow =
          "0 8px 20px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "scale(0.95)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}