"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);

    const saved = localStorage.getItem("theme");
    const dark = saved !== "light";

    document.documentElement.classList.toggle("dark", dark);
    setIsDark(dark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;

    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
    setIsDark(newDark);
  };

  // 👇 prevents hydration mismatch
  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-2 rounded-lg border border-border bg-card text-foreground hover:shadow-md transition-all"
    >
      {isDark ? "🌙 " : "☀️"}
    </button>
  );
}