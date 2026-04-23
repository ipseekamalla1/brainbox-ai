// src/services/analytics.service.ts — Analytics Business Logic

import prisma from "@/lib/prisma";

// ─── Student Performance ────────────────────────────

export async function getStudentPerformance(userId: string) {
  const [quizAttempts, examAttempts, videoProgress, totalVideos] = await Promise.all([
    prisma.quizAttempt.findMany({
      where: { userId, submittedAt: { not: null } },
      include: { quiz: { select: { title: true } } },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.examAttempt.findMany({
      where: { userId, submittedAt: { not: null } },
      include: { exam: { select: { title: true } } },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.videoProgress.findMany({
      where: { userId },
      include: { video: { select: { title: true, duration: true } } },
    }),
    prisma.video.count(),
  ]);

  // Quiz scores over time
  const quizScores = quizAttempts.map((a) => ({
    title: a.quiz.title,
    score: a.score || 0,
    maxScore: a.maxScore || 0,
    percentage: a.percentage || 0,
    date: a.submittedAt!.toISOString(),
  }));

  // Exam scores over time
  const examScores = examAttempts.map((a) => ({
    title: a.exam.title,
    score: a.score || 0,
    maxScore: a.maxScore || 0,
    percentage: a.percentage || 0,
    date: a.submittedAt!.toISOString(),
  }));

  // Combined scores for trend line
  const allScores = [...quizScores, ...examScores]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Averages
  const quizAvg = quizScores.length > 0
    ? quizScores.reduce((s, q) => s + q.percentage, 0) / quizScores.length : 0;
  const examAvg = examScores.length > 0
    ? examScores.reduce((s, e) => s + e.percentage, 0) / examScores.length : 0;
  const overallAvg = allScores.length > 0
    ? allScores.reduce((s, a) => s + a.percentage, 0) / allScores.length : 0;

  // Video completion
  const videosCompleted = videoProgress.filter((v) => v.completed).length;
  const totalWatchTime = videoProgress.reduce((s, v) => s + v.watchedSeconds, 0);

  // Score distribution
  const distribution = [
    { range: "90-100%", count: allScores.filter((s) => s.percentage >= 90).length },
    { range: "80-89%", count: allScores.filter((s) => s.percentage >= 80 && s.percentage < 90).length },
    { range: "70-79%", count: allScores.filter((s) => s.percentage >= 70 && s.percentage < 80).length },
    { range: "60-69%", count: allScores.filter((s) => s.percentage >= 60 && s.percentage < 70).length },
    { range: "Below 60%", count: allScores.filter((s) => s.percentage < 60).length },
  ];

  return {
    quizScores,
    examScores,
    allScores,
    quizAvg: Math.round(quizAvg * 100) / 100,
    examAvg: Math.round(examAvg * 100) / 100,
    overallAvg: Math.round(overallAvg * 100) / 100,
    totalQuizzes: quizScores.length,
    totalExams: examScores.length,
    videosCompleted,
    totalVideos,
    totalWatchTime,
    distribution,
  };
}

// ─── Teacher Class Analytics ────────────────────────

export async function getClassAnalytics(teacherId: string) {
  // Get all quizzes and exams by teacher
  const [quizzes, exams] = await Promise.all([
    prisma.quiz.findMany({
      where: { createdById: teacherId },
      include: {
        attempts: {
          where: { submittedAt: { not: null } },
          include: { user: { select: { id: true, name: true } } },
        },
        _count: { select: { questions: true } },
      },
    }),
    prisma.exam.findMany({
      where: { createdById: teacherId },
      include: {
        attempts: {
          where: { submittedAt: { not: null } },
          include: { user: { select: { id: true, name: true } } },
        },
        sections: { include: { _count: { select: { questions: true } } } },
      },
    }),
  ]);

  // Per-quiz performance
  const quizPerformance = quizzes.map((q) => {
    const scores = q.attempts.map((a) => a.percentage || 0);
    const avg = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
    return {
      id: q.id,
      title: q.title,
      attempts: q.attempts.length,
      questionCount: q._count.questions,
      averageScore: Math.round(avg * 100) / 100,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
    };
  });

  // Per-exam performance
  const examPerformance = exams.map((e) => {
    const scores = e.attempts.filter((a) => a.percentage !== null).map((a) => a.percentage!);
    const avg = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
    const totalQs = e.sections.reduce((s, sec) => s + sec._count.questions, 0);
    return {
      id: e.id,
      title: e.title,
      attempts: e.attempts.length,
      questionCount: totalQs,
      averageScore: Math.round(avg * 100) / 100,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
      autoSubmitRate: e.attempts.length > 0
        ? Math.round((e.attempts.filter((a) => a.autoSubmit).length / e.attempts.length) * 100) : 0,
    };
  });

  // All unique students
  const allStudentIds = new Set([
    ...quizzes.flatMap((q) => q.attempts.map((a) => a.userId)),
    ...exams.flatMap((e) => e.attempts.map((a) => a.userId)),
  ]);

  // Top performers
  const studentScores: Record<string, { name: string; scores: number[] }> = {};
  quizzes.forEach((q) => q.attempts.forEach((a) => {
    if (!studentScores[a.userId]) studentScores[a.userId] = { name: a.user.name, scores: [] };
    if (a.percentage) studentScores[a.userId].scores.push(a.percentage);
  }));
  exams.forEach((e) => e.attempts.forEach((a) => {
    if (!studentScores[a.userId]) studentScores[a.userId] = { name: a.user.name, scores: [] };
    if (a.percentage) studentScores[a.userId].scores.push(a.percentage);
  }));

  const topPerformers = Object.entries(studentScores)
    .map(([id, data]) => ({
      id,
      name: data.name,
      average: Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 100) / 100,
      attempts: data.scores.length,
    }))
    .sort((a, b) => b.average - a.average)
    .slice(0, 10);

  // Overall class average
  const allPercentages = [
    ...quizzes.flatMap((q) => q.attempts.map((a) => a.percentage || 0)),
    ...exams.flatMap((e) => e.attempts.filter((a) => a.percentage !== null).map((a) => a.percentage!)),
  ];
  const classAverage = allPercentages.length > 0
    ? Math.round((allPercentages.reduce((a, b) => a + b, 0) / allPercentages.length) * 100) / 100 : 0;

  // Score distribution
  const distribution = [
    { range: "90-100%", count: allPercentages.filter((s) => s >= 90).length },
    { range: "80-89%", count: allPercentages.filter((s) => s >= 80 && s < 90).length },
    { range: "70-79%", count: allPercentages.filter((s) => s >= 70 && s < 80).length },
    { range: "60-69%", count: allPercentages.filter((s) => s >= 60 && s < 70).length },
    { range: "Below 60%", count: allPercentages.filter((s) => s < 60).length },
  ];

  return {
    totalStudents: allStudentIds.size,
    totalQuizzes: quizzes.length,
    totalExams: exams.length,
    totalAttempts: allPercentages.length,
    classAverage,
    quizPerformance,
    examPerformance,
    topPerformers,
    distribution,
  };
}