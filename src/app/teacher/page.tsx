// src/app/(dashboard)/teacher/page.tsx — Teacher Dashboard

"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import StatCard from "@/components/ui/StatCard";

const quickActions = [
  
  { label: "Upload Notes", href: "/teacher/notes", icon: "📚", color: "bg-blue-500/10 text-blue-500" },
  { label: "Create Quiz", href: "/teacher/quizzes", icon: "📝", color: "bg-amber-500/10 text-amber-500" },
  { label: "Create Exam", href: "/teacher/exams", icon: "🎓", color: "bg-red-500/10 text-red-500" },
  { label: "View Analytics", href: "/teacher/analytics", icon: "📊", color: "bg-emerald-500/10 text-emerald-500" },
];

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "Teacher";
  

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-bold">
          Welcome, {firstName}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your courses, assessments, and student performance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="📚" label="Notes Uploaded" value={0} />
        <StatCard icon="📝" label="Quizzes Created" value={0} />
        <StatCard icon="🎓" label="Exams Created" value={0} />
        <StatCard icon="👥" label="Students Enrolled" value={0} />
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

      {/* Class Overview Placeholder */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-base mb-4">Recent Submissions</h2>
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-sm text-muted-foreground">
              No student submissions yet. Create your first quiz to get started.
            </p>
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-base mb-4">Class Performance</h2>
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-3xl mb-3">📊</p>
            <p className="text-sm text-muted-foreground">
              Performance data will appear here once students complete assessments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

