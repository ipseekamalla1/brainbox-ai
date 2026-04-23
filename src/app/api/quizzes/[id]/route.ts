// src/app/api/quizzes/[id]/route.ts — Individual Quiz API

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getQuizById,
  publishQuiz,
  startQuizAttempt,
  submitQuizAttempt,
  getQuizAnalytics,
} from "@/services/quiz.service";

// Type for request body (PUT)
interface SubmitBody {
  attemptId: string;
  answers: { questionId: string; answer: string }[];
}

// GET /api/quizzes/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const includeAnswers = session.user.role !== "STUDENT";
    const quiz = await getQuizById(params.id, includeAnswers);

    if (!quiz) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 }
      );
    }

    let analytics = null;

    if (
      session.user.role === "TEACHER" &&
      quiz.createdBy.id === session.user.id
    ) {
      analytics = await getQuizAnalytics(params.id);
    }

    return NextResponse.json({
      success: true,
      data: { ...quiz, analytics },
    });
  } catch (error) {
    console.error("GET /api/quizzes/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

// POST /api/quizzes/[id] — start attempt
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const attempt = await startQuizAttempt(
      params.id,
      session.user.id
    );

    return NextResponse.json(
      { success: true, data: attempt },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/quizzes/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to start attempt" },
      { status: 500 }
    );
  }
}

// PUT /api/quizzes/[id] — submit answers
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: SubmitBody = await req.json();

    const { attemptId, answers } = body;

    if (!attemptId || !Array.isArray(answers)) {
      return NextResponse.json(
        {
          success: false,
          error: "attemptId and answers array are required",
        },
        { status: 400 }
      );
    }

    const result = await submitQuizAttempt(attemptId, answers);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error("PUT /api/quizzes/[id] error:", error);

    let message = "Failed to submit";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// PATCH /api/quizzes/[id] — publish/unpublish
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role === "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: { isPublished: boolean } = await req.json();

    const quiz = await publishQuiz(params.id, body.isPublished);

    return NextResponse.json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error("PATCH /api/quizzes/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update quiz" },
      { status: 500 }
    );
  }
}