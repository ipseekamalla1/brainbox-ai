// src/app/(dashboard)/admin/page.tsx — Admin Dashboard

"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import StatCard from "@/components/ui/StatCard";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "Admin";

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="font-serif text-2xl md:text-3xl font-bold">
            Admin Panel
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-red-500/10 text-red-500 border border-red-500/20">
            Admin
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          System overview and platform management
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="👥" label="Total Users" value={0} subtitle="Students + Teachers" />
        <StatCard icon="📚" label="Total Courses" value={0} />
        <StatCard icon="📝" label="Total Quizzes" value={0} />
        <StatCard icon="🎓" label="Total Exams" value={0} />
      </div>

      {/* Management Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* User Management */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-base">User Management</h2>
            <Link
              href="/admin/users"
              className="text-xs text-primary font-medium hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="p-8 text-center">
            <p className="text-3xl mb-3">👥</p>
            <p className="text-sm text-muted-foreground mb-4">
              Manage users, assign roles, and control access
            </p>
            <Link
              href="/admin/users"
              className="inline-block px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Manage Users
            </Link>
          </div>
        </div>

        {/* System Analytics */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-base">System Analytics</h2>
            <Link
              href="/admin/analytics"
              className="text-xs text-primary font-medium hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="p-8 text-center">
            <p className="text-3xl mb-3">📊</p>
            <p className="text-sm text-muted-foreground mb-4">
              Platform-wide performance metrics and usage data
            </p>
            <Link
              href="/admin/analytics"
              className="inline-block px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              View Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Role Distribution Placeholder */}
      <div>
        <h2 className="font-semibold text-base mb-4">User Roles Distribution</h2>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { role: "Students", icon: "🎓", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" },
              { role: "Teachers", icon: "👨‍🏫", color: "bg-blue-500/10 border-blue-500/20 text-blue-600" },
              { role: "Admins", icon: "🛡️", color: "bg-red-500/10 border-red-500/20 text-red-600" },
            ].map((item) => (
              <div
                key={item.role}
                className={`p-4 rounded-xl border ${item.color} text-center`}
              >
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="font-serif text-xl font-bold">0</p>
                <p className="text-xs mt-0.5 opacity-80">{item.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}