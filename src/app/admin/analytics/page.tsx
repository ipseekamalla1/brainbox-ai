// src/app/(dashboard)/admin/analytics/page.tsx

"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import StatCard from "@/components/ui/StatCard";

interface SystemData {
  totalUsers: number;
  roleDistribution: {
    students: number;
    teachers: number;
    admins: number;
  };
  content: {
    courses: number;
    notes: number;
    videos: number;
    quizzes: number;
    exams: number;
  };
  activity: {
    quizAttempts: number;
    examAttempts: number;
    chatSessions: number;
    chatMessages: number;
  };
  recentUsers: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }[];
  recentActivity: {
    id: string;
    percentage: number;
    submittedAt: string;
    user: { name: string };
    quiz: { title: string };
  }[];
  growthData: {
    month: string;
    users: number;
  }[];
}

const COLORS = ["#4ade80", "#60a5fa", "#f87171"];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        const json = await res.json();

        if (json.success) {
          setData({
            totalUsers: 0,
            roleDistribution: {
              students: 0,
              teachers: 0,
              admins: 0,
            },
            content: {
              courses: 0,
              notes: 0,
              videos: 0,
              quizzes: 0,
              exams: 0,
            },
            activity: {
              quizAttempts: 0,
              examAttempts: 0,
              chatSessions: 0,
              chatMessages: 0,
            },
            recentUsers: [],
            recentActivity: [],
            growthData: [],
            ...json.data,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="font-serif text-2xl font-bold mb-6">System Analytics</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Failed to load analytics.
      </div>
    );
  }

  // ✅ SAFE DEFAULTS (NO CRASH EVER)
  const recentUsers = data.recentUsers ?? [];
  const recentActivity = data.recentActivity ?? [];
  const growthData = data.growthData ?? [];

  const roleData = [
    { name: "Students", value: data.roleDistribution.students },
    { name: "Teachers", value: data.roleDistribution.teachers },
    { name: "Admins", value: data.roleDistribution.admins },
  ].filter((d) => d.value > 0);

  const contentData = [
    { name: "Notes", count: data.content.notes },
    { name: "Videos", count: data.content.videos },
    { name: "Quizzes", count: data.content.quizzes },
    { name: "Exams", count: data.content.exams },
  ];

  const roleColors: Record<string, string> = {
    STUDENT: "bg-emerald-500/10 text-emerald-500",
    TEACHER: "bg-blue-500/10 text-blue-500",
    ADMIN: "bg-red-500/10 text-red-500",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold">System Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform-wide metrics and usage data
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="👥" label="Total Users" value={data.totalUsers} />
        <StatCard
          icon="📚"
          label="Content Items"
          value={data.content.notes + data.content.videos}
          subtitle={`${data.content.notes} notes · ${data.content.videos} videos`}
        />
        <StatCard
          icon="📝"
          label="Assessments"
          value={data.content.quizzes + data.content.exams}
          subtitle={`${data.content.quizzes} quizzes · ${data.content.exams} exams`}
        />
        <StatCard
          icon="🧠"
          label="AI Sessions"
          value={data.activity.chatSessions}
          subtitle={`${data.activity.chatMessages} messages`}
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Role Distribution */}
        <div className="p-5 rounded-2xl border bg-card">
          <h3 className="font-semibold text-sm mb-4">User Roles</h3>

          {roleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {roleData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No users yet
            </p>
          )}
        </div>

        {/* Content Overview */}
        <div className="p-5 rounded-2xl border bg-card">
          <h3 className="font-semibold text-sm mb-4">Content Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={contentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth + Activity */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Growth */}
        <div className="p-5 rounded-2xl border bg-card">
          <h3 className="font-semibold text-sm mb-4">
            User Growth (Last 6 Months)
          </h3>

          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="users" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">
              No growth data
            </p>
          )}
        </div>

        {/* Activity */}
        <div className="p-5 rounded-2xl border bg-card">
          <h3 className="font-semibold text-sm mb-4">Platform Activity</h3>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Quiz Attempts",
                value: data.activity.quizAttempts,
                icon: "📝",
              },
              {
                label: "Exam Attempts",
                value: data.activity.examAttempts,
                icon: "🎓",
              },
              {
                label: "AI Sessions",
                value: data.activity.chatSessions,
                icon: "🧠",
              },
              {
                label: "Messages",
                value: data.activity.chatMessages,
                icon: "💬",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3 border rounded-xl text-center"
              >
                <div className="text-xl">{item.icon}</div>
                <div className="font-bold">{item.value}</div>
                <div className="text-xs text-muted-foreground">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-5 border rounded-2xl bg-card">
          <h3 className="font-semibold text-sm mb-4">Recent Signups</h3>

          {recentUsers.length > 0 ? (
            recentUsers.map((u) => (
              <div key={u.id} className="flex gap-3 p-2">
                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                  {u.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{u.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {u.email}
                  </p>
                </div>
                <span className="text-xs">{u.role}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">
              No recent users
            </p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="p-5 border rounded-2xl bg-card">
          <h3 className="font-semibold text-sm mb-4">
            Recent Quiz Activity
          </h3>

          {recentActivity.length > 0 ? (
            recentActivity.map((a) => (
              <div key={a.id} className="flex gap-3 p-2">
                <div>{Math.round(a.percentage || 0)}%</div>
                <div>
                  <p className="text-sm">{a.quiz.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.user.name}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">
              No activity
            </p>
          )}
        </div>
      </div>
    </div>
  );
}