// src/app/api/quizzes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getQuizzes, createQuiz } from "@/services/quiz.service";

// ─── Types ──────────────────────────────────────────

type QuestionInput = {
  type?: "MCQ" | "SHORT_ANSWER" | "LONG_ANSWER";
  question: string;
  options?: string[];
  correctAnswer: string;
  points?: number;
};

type CreateQuizBody = {
  title: string;
  description?: string;
  courseId?: string;
  timeLimit?: number;
  questions: QuestionInput[];
};

// ─── GET ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId") || undefined;

    if (session.user.role === "TEACHER") {
      const quizzes = await getQuizzes({
        createdById: session.user.id,
        courseId,
      });

      return NextResponse.json({ success: true, data: quizzes });
    }

    const quizzes = await getQuizzes({
      isPublished: true,
      courseId,
    });

    return NextResponse.json({ success: true, data: quizzes });

  } catch (error) {
    console.error("GET /api/quizzes error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

// ─── POST ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role === "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Students cannot create quizzes" },
        { status: 403 }
      );
    }

    const body: CreateQuizBody = await req.json();
    const { title, description, courseId, timeLimit, questions } = body;

    // ─── Validation ─────────────────────────────

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Title and at least one question are required",
        },
        { status: 400 }
      );
    }

    for (const q of questions) {
      if (!q.question || !q.correctAnswer) {
        return NextResponse.json(
          {
            success: false,
            error: "Each question needs question + correct answer",
          },
          { status: 400 }
        );
      }

      if (q.type === "MCQ" && (!q.options || q.options.length < 2)) {
        return NextResponse.json(
          {
            success: false,
            error: "MCQ needs at least 2 options",
          },
          { status: 400 }
        );
      }
    }

    // ─── Normalize Type (FIX 🔥) ────────────────

    const normalizedQuestions = questions.map((q, i) => {
      let type: "MCQ" | "SHORT_ANSWER";

      if (q.type === "MCQ") {
        type = "MCQ";
      } else {
        // SHORT_ANSWER + LONG_ANSWER → SHORT_ANSWER
        type = "SHORT_ANSWER";
      }

      return {
        type,
        question: q.question,
        options: type === "MCQ" ? q.options : undefined,
        correctAnswer: q.correctAnswer,
        points: q.points || 1,
        order: i,
      };
    });

    // ─── Create Quiz ───────────────────────────

    const quiz = await createQuiz({
      title,
      description: description || undefined,
      courseId: courseId || undefined,
      createdById: session.user.id,
      timeLimit: timeLimit || undefined,
      questions: normalizedQuestions,
    });

    return NextResponse.json(
      { success: true, data: quiz },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST /api/quizzes error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}