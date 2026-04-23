// src/app/(dashboard)/teacher/analytics/page.tsx — Teacher Analytics Dashboard

"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import StatCard from "@/components/ui/StatCard";

interface ClassData {
  totalStudents: number;
  totalQuizzes: number;
  totalExams: number;
  totalAttempts: number;
  classAverage: number;
  quizPerformance: {
    id: string; title: string; attempts: number;
    questionCount: number; averageScore: number;
    highestScore: number; lowestScore: number;
  }[];
  examPerformance: {
    id: string; title: string; attempts: number;
    questionCount: number; averageScore: number;
    highestScore: number; lowestScore: number; autoSubmitRate: number;
  }[];
  topPerformers: { id: string; name: string; average: number; attempts: number }[];
  distribution: { range: string; count: number }[];
}

const COLORS = ["#4ade80", "#60a5fa", "#c9a84c", "#fbbf24", "#f87171"];

export default function TeacherAnalyticsPage() {
  const [data, setData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "quizzes" | "exams" | "students">("overview");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/analytics");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div>
        <h1 className="font-serif text-2xl font-bold mb-6">Analytics</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-shimmer" />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h1 className="font-serif text-2xl font-bold mb-6">Analytics</h1>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-3xl mb-3">📊</p>
          <p className="text-sm text-muted-foreground">
            No data yet. Analytics will appear once students complete assessments.
          </p>
        </div>
      </div>
    );
  }

  const getGradeColor = (pct: number) => {
    if (pct >= 80) return "#4ade80";
    if (pct >= 60) return "#fbbf24";
    return "#f87171";
  };

  // Chart data
  const quizChartData = data.quizPerformance.map((q) => ({
    name: q.title.length > 20 ? q.title.slice(0, 20) + "…" : q.title,
    avg: q.averageScore,
    high: q.highestScore,
    low: q.lowestScore,
  }));

  const examChartData = data.examPerformance.map((e) => ({
    name: e.title.length > 20 ? e.title.slice(0, 20) + "…" : e.title,
    avg: e.averageScore,
    high: e.highestScore,
    low: e.lowestScore,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold">Class Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor student performance and identify weak areas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="col-span-2 lg:col-span-1 p-5 rounded-2xl border border-border bg-card text-center">
          <p className="text-xs text-muted-foreground mb-1">Class Average</p>
          <p className="font-serif text-3xl font-bold" style={{ color: getGradeColor(data.classAverage) }}>
            {data.classAverage}%
          </p>
        </div>
        <StatCard icon="👥" label="Students" value={data.totalStudents} />
        <StatCard icon="📝" label="Quizzes" value={data.totalQuizzes} />
        <StatCard icon="🎓" label="Exams" value={data.totalExams} />
        <StatCard icon="📋" label="Total Attempts" value={data.totalAttempts} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(["overview", "quizzes", "exams", "students"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors capitalize whitespace-nowrap ${
              tab === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Distribution */}
            <div className="p-5 rounded-2xl border border-border bg-card">
              <h3 className="font-semibold text-sm mb-4">Score Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.distribution.filter((d) => d.count > 0)} dataKey="count" nameKey="range" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {data.distribution.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Quiz Performance */}
            {quizChartData.length > 0 && (
              <div className="p-5 rounded-2xl border border-border bg-card">
                <h3 className="font-semibold text-sm mb-4">Quiz Averages</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={quizChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Average" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top Performers */}
          {data.topPerformers.length > 0 && (
            <div className="p-5 rounded-2xl border border-border bg-card">
              <h3 className="font-semibold text-sm mb-4">Top Performers</h3>
              <div className="space-y-2">
                {data.topPerformers.slice(0, 5).map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-background">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? "bg-amber-500/20 text-amber-500" : i === 1 ? "bg-gray-400/20 text-gray-400" : i === 2 ? "bg-amber-700/20 text-amber-700" : "bg-muted text-muted-foreground"
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.attempts} attempts</p>
                    </div>
                    <p className="text-sm font-bold" style={{ color: getGradeColor(s.average) }}>
                      {s.average}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quizzes Tab */}
      {tab === "quizzes" && (
        <div className="space-y-3">
          {data.quizPerformance.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No quiz data yet.</p>
            </div>
          ) : (
            data.quizPerformance.map((q) => (
              <div key={q.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold">{q.title}</h4>
                  <span className="text-xs text-muted-foreground">{q.attempts} attempts</span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Average</p>
                    <p className="text-sm font-bold" style={{ color: getGradeColor(q.averageScore) }}>{q.averageScore}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Highest</p>
                    <p className="text-sm font-bold text-emerald-500">{q.highestScore}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lowest</p>
                    <p className="text-sm font-bold text-red-500">{q.lowestScore}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Questions</p>
                    <p className="text-sm font-bold">{q.questionCount}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Exams Tab */}
      {tab === "exams" && (
        <div className="space-y-3">
          {data.examPerformance.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No exam data yet.</p>
            </div>
          ) : (
            data.examPerformance.map((e) => (
              <div key={e.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold">{e.title}</h4>
                  <span className="text-xs text-muted-foreground">{e.attempts} attempts</span>
                </div>
                <div className="grid grid-cols-5 gap-3 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Average</p>
                    <p className="text-sm font-bold" style={{ color: getGradeColor(e.averageScore) }}>{e.averageScore}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Highest</p>
                    <p className="text-sm font-bold text-emerald-500">{e.highestScore}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lowest</p>
                    <p className="text-sm font-bold text-red-500">{e.lowestScore}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Questions</p>
                    <p className="text-sm font-bold">{e.questionCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Timeout</p>
                    <p className="text-sm font-bold text-amber-500">{e.autoSubmitRate}%</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Students Tab */}
      {tab === "students" && (
        <div className="space-y-2">
          {data.topPerformers.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No student data yet.</p>
            </div>
          ) : (
            data.topPerformers.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  i < 3 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>{i + 1}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.attempts} total attempts</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: getGradeColor(s.average) }}>{s.average}%</p>
                  <p className="text-xs text-muted-foreground">avg</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}