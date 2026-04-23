// src/app/api/teacher/students/route.ts — Teacher Student Progress API

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ✅ Proper type instead of `any`
type StudentProgress = {
  id: string;
  name: string;
  email: string;
  quizScores: number[];
  examScores: number[];
  lastActive: Date | null;
};

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role === "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const teacherId = session.user.id;

    const teacherQuizzes = await prisma.quiz.findMany({
      where: { createdById: teacherId },
      select: { id: true },
    });

    const teacherExams = await prisma.exam.findMany({
      where: { createdById: teacherId },
      select: { id: true },
    });

    const quizIds = teacherQuizzes.map((q) => q.id);
    const examIds = teacherExams.map((e) => e.id);

    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        quizId: { in: quizIds },
        submittedAt: { not: null },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const examAttempts = await prisma.examAttempt.findMany({
      where: {
        examId: { in: examIds },
        submittedAt: { not: null },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // ✅ FIXED: no `any`
    const studentMap = new Map<string, StudentProgress>();

    // ─── Quiz attempts ─────────────────────────────
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

      if (a.percentage !== null && a.percentage !== undefined) {
        s.quizScores.push(a.percentage);
      }

      if (!s.lastActive || (a.submittedAt && a.submittedAt > s.lastActive)) {
        s.lastActive = a.submittedAt;
      }
    });

    // ─── Exam attempts ─────────────────────────────
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

      if (a.percentage !== null && a.percentage !== undefined) {
        s.examScores.push(a.percentage);
      }

      if (!s.lastActive || (a.submittedAt && a.submittedAt > s.lastActive)) {
        s.lastActive = a.submittedAt;
      }
    });

    // ─── Video progress ────────────────────────────
    const studentIds = [...studentMap.keys()];

    const videoProgress = await prisma.videoProgress.groupBy({
      by: ["userId"],
      where: {
        userId: { in: studentIds },
        completed: true,
      },
      _count: {
        _all: true,
      },
    });

    const vpMap = new Map<string, number>(
      videoProgress.map((v) => [v.userId, v._count._all])
    );

    // ─── Final response ────────────────────────────
    const result = [...studentMap.values()].map((s) => {
      const quizAvg =
        s.quizScores.length > 0
          ? s.quizScores.reduce((a, b) => a + b, 0) / s.quizScores.length
          : 0;

      const examAvg =
        s.examScores.length > 0
          ? s.examScores.reduce((a, b) => a + b, 0) / s.examScores.length
          : 0;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        quizAvg: Math.round(quizAvg * 100) / 100,
        examAvg: Math.round(examAvg * 100) / 100,
        quizCount: s.quizScores.length,
        examCount: s.examScores.length,
        videosCompleted: vpMap.get(s.id) || 0,
        lastActive: s.lastActive ? s.lastActive.toISOString() : null,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Teacher students error:", error);
    return NextResponse.json(
      { success: false, error: "Failed" },
      { status: 500 }
    );
  }
}