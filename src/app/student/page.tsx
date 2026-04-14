// src/app/(dashboard)/student/page.tsx — Student Dashboard

"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import StatCard from "@/components/ui/StatCard";

const quickActions = [
  { label: "Browse Notes", href: "/student/notes", icon: "📚", color: "bg-blue-500/10 text-blue-500" },
  { label: "Take a Quiz", href: "/student/quizzes", icon: "📝", color: "bg-amber-500/10 text-amber-500" },
  { label: "Watch Videos", href: "/student/videos", icon: "🎥", color: "bg-purple-500/10 text-purple-500" },
  { label: "Ask AI Tutor", href: "/student/ai-tutor", icon: "🧠", color: "bg-emerald-500/10 text-emerald-500" },
];

export default function StudentDashboard() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "Student";

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-bold">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here&apos;s your learning overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="📝" label="Quizzes Taken" value={0} subtitle="This semester" />
        <StatCard icon="🎓" label="Exams Completed" value={0} />
        <StatCard icon="📊" label="Average Score" value="—" subtitle="No data yet" />
        <StatCard icon="🎥" label="Videos Watched" value={0} />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="font-semibold text-base mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center text-lg mb-3`}>
                {action.icon}
              </div>
              <p className="text-sm font-medium group-hover:text-primary transition-colors">
                {action.label}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div>
        <h2 className="font-semibold text-base mb-4">Recent Activity</h2>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-3xl mb-3">📖</p>
          <p className="text-sm text-muted-foreground">
            No activity yet. Start by exploring your courses!
          </p>
          <Link
            href="/student/notes"
            className="inline-block mt-4 text-sm text-primary font-medium hover:underline"
          >
            Browse Notes →
          </Link>
        </div>
      </div>
    </div>
  );
}