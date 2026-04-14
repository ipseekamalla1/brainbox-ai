"use client";

import { useEffect } from "react";

export default function ThemeToggle() {
  // initialize theme once on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved !== "light";

    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");

    root.classList.toggle("dark", !isDark);
    localStorage.setItem("theme", isDark ? "light" : "dark");
  };

  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-2 rounded-lg border border-border bg-card text-foreground hover:shadow-md transition-all"
    >
      {isDark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}