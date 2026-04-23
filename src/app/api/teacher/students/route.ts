// src/app/api/teacher/students/route.ts — Teacher Student Progress API

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "STUDENT") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    // Get all students who have attempted teacher's quizzes or exams
    const teacherQuizzes = await prisma.quiz.findMany({
      where: { createdById: session.user.id },
      select: { id: true },
    });
    const teacherExams = await prisma.exam.findMany({
      where: { createdById: session.user.id },
      select: { id: true },
    });

    const quizIds = teacherQuizzes.map((q) => q.id);
    const examIds = teacherExams.map((e) => e.id);

    // Get unique students from attempts
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { quizId: { in: quizIds }, submittedAt: { not: null } },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    const examAttempts = await prisma.examAttempt.findMany({
      where: { examId: { in: examIds }, submittedAt: { not: null } },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Aggregate per student
    const studentMap = new Map<string, any>();

    quizAttempts.forEach((a) => {
      if (!studentMap.has(a.userId)) {
        studentMap.set(a.userId, {
          id: a.userId,
          name: a.user.name,
          email: a.user.email,
          quizScores: [],
          examScores: [],
          lastActive: a.submittedAt,
        });
      }
      const s = studentMap.get(a.userId)!;
      if (a.percentage) s.quizScores.push(a.percentage);
      if (a.submittedAt && (!s.lastActive || a.submittedAt > s.lastActive)) {
        s.lastActive = a.submittedAt;
      }
    });

    examAttempts.forEach((a) => {
      if (!studentMap.has(a.userId)) {
        studentMap.set(a.userId, {
          id: a.userId,
          name: a.user.name,
          email: a.user.email,
          quizScores: [],
          examScores: [],
          lastActive: a.submittedAt,
        });
      }
      const s = studentMap.get(a.userId)!;
      if (a.percentage) s.examScores.push(a.percentage);
      if (a.submittedAt && (!s.lastActive || a.submittedAt > s.lastActive)) {
        s.lastActive = a.submittedAt;
      }
    });

    // Get video progress
    const studentIds = [...studentMap.keys()];
    const videoProgress = await prisma.videoProgress.groupBy({
      by: ["userId"],
      where: { userId: { in: studentIds }, completed: true },
      _count: true,
    });

    const vpMap = new Map(videoProgress.map((v) => [v.userId, v._count]));

    const result = [...studentMap.values()].map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      quizAvg: s.quizScores.length > 0
        ? Math.round((s.quizScores.reduce((a: number, b: number) => a + b, 0) / s.quizScores.length) * 100) / 100
        : 0,
      examAvg: s.examScores.length > 0
        ? Math.round((s.examScores.reduce((a: number, b: number) => a + b, 0) / s.examScores.length) * 100) / 100
        : 0,
      quizCount: s.quizScores.length,
      examCount: s.examScores.length,
      videosCompleted: vpMap.get(s.id) || 0,
      lastActive: s.lastActive?.toISOString() || null,
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Teacher students error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}