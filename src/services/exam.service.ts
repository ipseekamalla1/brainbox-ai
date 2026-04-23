// src/services/exam.service.ts — Exam Business Logic

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ─── Exam CRUD ──────────────────────────────────────

export async function getExams(filters?: {
  courseId?: string;
  createdById?: string;
  isPublished?: boolean;
}) {
  return prisma.exam.findMany({
    where: {
      ...(filters?.courseId && { courseId: filters.courseId }),
      ...(filters?.createdById && { createdById: filters.createdById }),
      ...(filters?.isPublished !== undefined && { isPublished: filters.isPublished }),
    },
    include: {
      createdBy: { select: { id: true, name: true } },
      course: { select: { id: true, title: true, code: true } },
      sections: {
        include: { _count: { select: { questions: true } } },
        orderBy: { order: "asc" },
      },
      _count: { select: { attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getExamById(id: string, includeAnswers = false) {
  if (!id) throw new Error("Exam id is required");

  return prisma.exam.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true } },
      course: { select: { id: true, title: true } },
      sections: {
        orderBy: { order: "asc" },
        include: {
          questions: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              type: true,
              question: true,
              options: true,
              points: true,
              order: true,
              ...(includeAnswers && { correctAnswer: true }),
            },
          },
        },
      },
      _count: { select: { attempts: true } },
    },
  });
}
export async function createExam(data: {
  title: string;
  description?: string;
  courseId?: string;
  createdById: string;
  timeLimit: number;
  startTime?: Date;
  endTime?: Date;
  sections: {
    title: string;
    description?: string;
    order: number;
    questions: {
      type: "MCQ" | "SHORT_ANSWER" | "LONG_ANSWER";
      question: string;
      options?: string[];
      correctAnswer?: string;
      points: number;
      order: number;
    }[];
  }[];
}) {
  const { sections, ...examData } = data;

  return prisma.exam.create({
    data: {
      ...examData,
      sections: {
        create: sections.map((s) => ({
          title: s.title,
          description: s.description,
          order: s.order,
          questions: {
            create: s.questions.map((q) => ({
              type: q.type,
              question: q.question,
              options: q.options || undefined,
              correctAnswer: q.correctAnswer || undefined,
              points: q.points,
              order: q.order,
            })),
          },
        })),
      },
    },
    include: {
      sections: {
        include: { questions: true, _count: { select: { questions: true } } },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function publishExam(id: string, publish: boolean) {
  return prisma.exam.update({
    where: { id },
    data: { isPublished: publish },
  });
}

// ─── Exam Attempts & Grading ────────────────────────

export async function startExamAttempt(examId: string, userId: string) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) throw new Error("Exam not found");

  const now = new Date();
  if (exam.startTime && now < exam.startTime) {
    throw new Error("Exam has not started yet");
  }
  if (exam.endTime && now > exam.endTime) {
    throw new Error("Exam window has closed");
  }

  const existing = await prisma.examAttempt.findFirst({
    where: { examId, userId, submittedAt: null },
  });
  if (existing) return existing;

  const submitted = await prisma.examAttempt.findFirst({
    where: { examId, userId, submittedAt: { not: null } },
  });
  if (submitted) throw new Error("You have already submitted this exam");

  return prisma.examAttempt.create({
    data: { examId, userId },
  });
}

export async function submitExamAttempt(
  attemptId: string,
  answers: { questionId: string; answer: string }[],
  autoSubmit = false
) {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          sections: {
            include: { questions: true },
          },
        },
      },
    },
  });

  if (!attempt) throw new Error("Attempt not found");
  if (attempt.submittedAt) throw new Error("Already submitted");

  const allQuestions = attempt.exam.sections.flatMap((s) => s.questions);

  // ✅ FIXED: consistent Prisma type array
  const gradedAnswers: Prisma.ExamAnswerCreateManyInput[] = answers.map((ans) => {
    const question = allQuestions.find((q) => q.id === ans.questionId);

    const base: Prisma.ExamAnswerCreateManyInput = {
      attemptId,
      questionId: ans.questionId,
      answer: ans.answer,
      isCorrect: null,
      score: null,
    };

    if (!question) return base;

    if (question.type === "LONG_ANSWER" || !question.correctAnswer) {
      return base;
    }

    const isCorrect =
      question.correctAnswer.trim().toLowerCase() ===
      ans.answer.trim().toLowerCase();

    return {
      attemptId,
      questionId: ans.questionId,
      answer: ans.answer,
      isCorrect,
      score: isCorrect ? question.points : 0,
    };
  });

  const maxScore = allQuestions.reduce((sum, q) => sum + q.points, 0);
  const autoGradedScore = gradedAnswers.reduce(
    (sum, a) => sum + (a.score || 0),
    0
  );

  const pendingManualGrade = gradedAnswers.some((a) => a.isCorrect === null);
  const percentage = maxScore > 0 ? (autoGradedScore / maxScore) * 100 : 0;

  return prisma.$transaction(async (tx) => {
    await tx.examAnswer.createMany({ data: gradedAnswers });

    return tx.examAttempt.update({
      where: { id: attemptId },
      data: {
        score: autoGradedScore,
        maxScore,
        percentage: pendingManualGrade
          ? null
          : Math.round(percentage * 100) / 100,
        submittedAt: new Date(),
        autoSubmit,
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                correctAnswer: true,
                options: true,
                points: true,
                type: true,
              },
            },
          },
        },
        exam: { select: { title: true, timeLimit: true } },
      },
    });
  });
}

export async function getStudentExamAttempts(userId: string) {
  return prisma.examAttempt.findMany({
    where: { userId, submittedAt: { not: null } },
    include: {
      exam: { select: { id: true, title: true, timeLimit: true } },
    },
    orderBy: { submittedAt: "desc" },
  });
}

export async function getExamAnalytics(examId: string) {
  const attempts = await prisma.examAttempt.findMany({
    where: { examId, submittedAt: { not: null } },
    select: { percentage: true, userId: true, autoSubmit: true },
  });

  if (attempts.length === 0) return null;

  const scores = attempts
    .filter((a) => a.percentage !== null)
    .map((a) => a.percentage!);

  const average =
    scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

  return {
    totalAttempts: attempts.length,
    uniqueStudents: new Set(attempts.map((a) => a.userId)).size,
    averageScore: Math.round(average * 100) / 100,
    highestScore: scores.length > 0 ? Math.max(...scores) : 0,
    lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
    autoSubmitCount: attempts.filter((a) => a.autoSubmit).length,
  };
}