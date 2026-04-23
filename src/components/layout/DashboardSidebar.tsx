// src/components/layout/DashboardSidebar.tsx — UPDATED with all new pages
// REPLACE your existing DashboardSidebar.tsx with this version

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

interface MenuItem {
  label: string;
  href: string;
  icon: string;
}

const menuConfig: Record<string, MenuItem[]> = {
  STUDENT: [
    { label: "Dashboard", href: "/student", icon: "◆" },
    { label: "Notes", href: "/student/notes", icon: "📚" },
    { label: "Videos", href: "/student/videos", icon: "🎥" },
    { label: "Quizzes", href: "/student/quizzes", icon: "📝" },
    { label: "Exams", href: "/student/exams", icon: "🎓" },
    { label: "Practice", href: "/student/practice", icon: "🎯" },
    { label: "Flashcards", href: "/student/flashcards", icon: "🃏" },
    { label: "Marks", href: "/student/marks", icon: "📊" },
    { label: "AI Tutor", href: "/student/ai-tutor", icon: "🧠" },
    { label: "Leaderboard", href: "/student/leaderboard", icon: "🏆" },
  ],
  TEACHER: [
    { label: "Dashboard", href: "/teacher", icon: "◆" },
    { label: "Notes", href: "/teacher/notes", icon: "📚" },
    { label: "Videos", href: "/teacher/videos", icon: "🎥" },
    { label: "Quizzes", href: "/teacher/quizzes", icon: "📝" },
    { label: "Exams", href: "/teacher/exams", icon: "🎓" },
    { label: "Students", href: "/teacher/students", icon: "👥" },
    { label: "Analytics", href: "/teacher/analytics", icon: "📊" },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: "◆" },
    { label: "Users", href: "/admin/users", icon: "👥" },
    { label: "Analytics", href: "/admin/analytics", icon: "📊" },
  ],
};

interface SidebarProps {
  role: string;
  userName: string;
  userEmail: string;
}

export default function DashboardSidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const items = menuConfig[role] || menuConfig.STUDENT;

  const isActive = (href: string) => {
    if (href === `/${role.toLowerCase()}`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 border-r border-border bg-card transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-[240px]"
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                B
              </div>
              <span className="font-serif font-bold text-sm">
                Brainbox<span className="text-primary">AI</span>
              </span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              {collapsed ? <path d="M6 3l5 5-5 5" /> : <path d="M10 3L5 8l5 5" />}
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className="text-base flex-shrink-0 w-5 text-center">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
                {active && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-border p-3">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
              {userName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={`mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 glass border-t border-border safe-bottom">
        <div className="flex justify-around py-2">
          {items.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-[9px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}