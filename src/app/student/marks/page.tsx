// src/app/(dashboard)/student/marks/page.tsx — Student Marks & Performance

"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import type { TooltipProps } from "recharts";
import StatCard from "@/components/ui/StatCard";

interface Performance {
  quizScores: { title: string; percentage: number; date: string }[];
  examScores: { title: string; percentage: number; date: string }[];
  allScores: { title: string; percentage: number; date: string }[];
  quizAvg: number;
  examAvg: number;
  overallAvg: number;
  totalQuizzes: number;
  totalExams: number;
  videosCompleted: number;
  totalVideos: number;
  totalWatchTime: number;
  distribution: { range: string; count: number }[];
}

const COLORS = ["#4ade80", "#60a5fa", "#c9a84c", "#fbbf24", "#f87171"];

const getGradeInfo = (pct: number) => {
  if (pct >= 90) return { letter: "A+", color: "#4ade80", label: "Excellent" };
  if (pct >= 80) return { letter: "A", color: "#4ade80", label: "Great" };
  if (pct >= 70) return { letter: "B", color: "#60a5fa", label: "Good" };
  if (pct >= 60) return { letter: "C", color: "#fbbf24", label: "Average" };
  return { letter: "F", color: "#f87171", label: "Needs Work" };
};

const formatWatchTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

export default function StudentMarksPage() {
  const [data, setData] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "quizzes" | "exams">("overview");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/analytics");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="font-serif text-2xl font-bold mb-6">Marks & Performance</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-shimmer" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-muted animate-shimmer" />
      </div>
    );
  }

  if (!data || (data.totalQuizzes === 0 && data.totalExams === 0)) {
    return (
      <div>
        <h1 className="font-serif text-2xl font-bold mb-6">Marks & Performance</h1>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-3xl mb-3">📊</p>
          <p className="text-sm text-muted-foreground">
            No performance data yet. Complete quizzes and exams to see your analytics.
          </p>
        </div>
      </div>
    );
  }

  const grade = getGradeInfo(data.overallAvg);

  const trendData = data.allScores.map((s, i) => ({
    name: `#${i + 1}`,
    score: s.percentage,
    title: s.title,
  }));

  const comparisonData = [
    { name: "Quiz Avg", value: data.quizAvg },
    { name: "Exam Avg", value: data.examAvg },
    { name: "Overall", value: data.overallAvg },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold">Marks & Performance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your academic progress
        </p>
      </div>

      {/* Grade + Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="col-span-2 lg:col-span-1 p-5 rounded-2xl border border-border bg-card text-center">
          <p className="text-xs text-muted-foreground mb-1">Overall Grade</p>
          <p className="font-serif text-4xl font-bold" style={{ color: grade.color }}>
            {grade.letter}
          </p>
          <p className="text-xs mt-1" style={{ color: grade.color }}>
            {grade.label}
          </p>
          <p className="text-lg font-bold font-serif mt-2">
            {data.overallAvg}%
          </p>
        </div>

        <StatCard icon="📝" label="Quizzes" value={data.totalQuizzes} subtitle={`Avg: ${data.quizAvg}%`} />
        <StatCard icon="🎓" label="Exams" value={data.totalExams} subtitle={`Avg: ${data.examAvg}%`} />
        <StatCard icon="🎥" label="Videos" value={`${data.videosCompleted}/${data.totalVideos}`} subtitle={formatWatchTime(data.totalWatchTime)} />
        <StatCard icon="📊" label="Total Attempts" value={data.allScores.length} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["overview", "quizzes", "exams"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border capitalize ${
              tab === t
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="font-semibold text-sm mb-4">Score Trend</h3>

            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />

               <Tooltip
  labelFormatter={(label, payload) =>
    payload?.[0]?.payload?.title ?? label
  }
  formatter={(value: unknown) => {
    const num = typeof value === "number" ? value : 0;
    return [`${num}%`, ""];
  }}
/>

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border border-border bg-card">
              <h3 className="font-semibold text-sm mb-4">Score Distribution</h3>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Bar dataKey="count">
                    {data.distribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card">
              <h3 className="font-semibold text-sm mb-4">Average Comparison</h3>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={comparisonData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" />

<Tooltip
  formatter={(value) => {
    if (typeof value !== "number") return ["0%", ""];
    return [`${value}%`, ""];
  }}
/>
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* QUIZZES */}
      {tab === "quizzes" && (
        <div className="space-y-3">
          {data.quizScores.map((q, i) => (
            <div key={i} className="p-4 border rounded-xl bg-card">
              <h4 className="font-semibold">{q.title}</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(q.date).toLocaleDateString()}
              </p>
              <p className="font-bold">{q.percentage}%</p>
            </div>
          ))}
        </div>
      )}

      {/* EXAMS */}
      {tab === "exams" && (
        <div className="space-y-3">
          {data.examScores.map((e, i) => (
            <div key={i} className="p-4 border rounded-xl bg-card">
              <h4 className="font-semibold">{e.title}</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(e.date).toLocaleDateString()}
              </p>
              <p className="font-bold">{e.percentage}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}