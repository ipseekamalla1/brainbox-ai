// src/services/quiz.service.ts — Quiz Business Logic

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ─── Quiz CRUD ──────────────────────────────────────

export async function getQuizzes(filters?: {
  courseId?: string;
  createdById?: string;
  isPublished?: boolean;
}) {
  return prisma.quiz.findMany({
    where: {
      ...(filters?.courseId && { courseId: filters.courseId }),
      ...(filters?.createdById && { createdById: filters.createdById }),
      ...(filters?.isPublished !== undefined && {
        isPublished: filters.isPublished,
      }),
    },
    include: {
      createdBy: { select: { id: true, name: true } },
      course: { select: { id: true, title: true, code: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getQuizById(id: string, includeAnswers = false) {
  return prisma.quiz.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true } },
      course: { select: { id: true, title: true } },
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
      _count: { select: { questions: true, attempts: true } },
    },
  });
}

export async function createQuiz(data: {
  title: string;
  description?: string;
  courseId?: string;
  createdById: string;
  timeLimit?: number;
  questions: {
    type: "MCQ" | "SHORT_ANSWER" | "LONG_ANSWER";
    question: string;
    options?: string[];
    correctAnswer: string;
    points: number;
    order: number;
  }[];
}) {
  const { questions, ...quizData } = data;

  return prisma.quiz.create({
    data: {
      ...quizData,
      questions: {
        create: questions.map((q) => ({
          type: q.type,
          question: q.question,
          options: q.type === "MCQ" ? q.options : undefined,
          correctAnswer: q.correctAnswer,
          points: q.points,
          order: q.order,
        })),
      },
    },
    include: {
      questions: { orderBy: { order: "asc" } },
      _count: { select: { questions: true } },
    },
  });
}

export async function publishQuiz(id: string, publish: boolean) {
  return prisma.quiz.update({
    where: { id },
    data: { isPublished: publish },
  });
}

export async function deleteQuiz(id: string) {
  return prisma.quiz.delete({ where: { id } });
}

// ─── Quiz Attempts & Grading ────────────────────────

export async function startQuizAttempt(quizId: string, userId: string) {
  const existing = await prisma.quizAttempt.findFirst({
    where: { quizId, userId, submittedAt: null },
  });

  if (existing) return existing;

  return prisma.quizAttempt.create({
    data: { quizId, userId },
  });
}

export async function submitQuizAttempt(
  attemptId: string,
  answers: { questionId: string; answer: string }[]
) {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          questions: true,
        },
      },
    },
  });

  if (!attempt) throw new Error("Attempt not found");
  if (attempt.submittedAt) throw new Error("Already submitted");

  // ✅ FIXED: strict typing + always include attemptId
  const gradedAnswers: Prisma.QuizAnswerCreateManyInput[] = answers.map(
    (ans) => {
      const question = attempt.quiz.questions.find(
        (q) => q.id === ans.questionId
      );

      let isCorrect = false;

      if (question) {
        // Auto grading only for MCQ + SHORT
        if (
          question.type === "MCQ" ||
          question.type === "SHORT_ANSWER"
        ) {
          isCorrect =
            question.correctAnswer.trim().toLowerCase() ===
            ans.answer.trim().toLowerCase();
        }

        // LONG_ANSWER → always false (manual grading later)
        if (question.type === "LONG_ANSWER") {
          isCorrect = false;
        }
      }

      return {
        attemptId, // ✅ ALWAYS present
        questionId: ans.questionId,
        answer: ans.answer,
        isCorrect,
      };
    }
  );

  // Calculate score
  const maxScore = attempt.quiz.questions.reduce(
    (sum, q) => sum + q.points,
    0
  );

  const score = gradedAnswers.reduce((sum, a) => {
    if (!a.isCorrect) return sum;

    const q = attempt.quiz.questions.find(
      (q) => q.id === a.questionId
    );

    return sum + (q?.points || 0);
  }, 0);

  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  const result = await prisma.$transaction(async (tx) => {
    await tx.quizAnswer.createMany({
      data: gradedAnswers,
    });

    const updated = await tx.quizAttempt.update({
      where: { id: attemptId },
      data: {
        score,
        maxScore,
        percentage: Math.round(percentage * 100) / 100,
        submittedAt: new Date(),
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
        quiz: { select: { title: true } },
      },
    });

    return updated;
  });

  return result;
}

export async function getStudentAttempts(
  userId: string,
  quizId?: string
) {
  return prisma.quizAttempt.findMany({
    where: {
      userId,
      submittedAt: { not: null },
      ...(quizId && { quizId }),
    },
    include: {
      quiz: { select: { id: true, title: true } },
    },
    orderBy: { submittedAt: "desc" },
  });
}

export async function getAttemptDetails(attemptId: string) {
  return prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: { select: { title: true } },
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
    },
  });
}

// ─── Teacher Analytics ──────────────────────────────

export async function getQuizAnalytics(quizId: string) {
  const attempts = await prisma.quizAttempt.findMany({
    where: { quizId, submittedAt: { not: null } },
    select: { percentage: true, userId: true },
  });

  if (attempts.length === 0) return null;

  const scores = attempts.map((a) => a.percentage || 0);

  const average =
    scores.reduce((a, b) => a + b, 0) / scores.length;

  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);

  return {
    totalAttempts: attempts.length,
    uniqueStudents: new Set(attempts.map((a) => a.userId)).size,
    averageScore: Math.round(average * 100) / 100,
    highestScore: highest,
    lowestScore: lowest,
  };
}