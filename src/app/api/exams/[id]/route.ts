import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getExamById,
  publishExam,
  startExamAttempt,
  submitExamAttempt,
  getExamAnalytics,
} from "@/services/exam.service";

// helper to safely extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

/* ─────────────────────────────────────────────
   GET EXAM BY ID
───────────────────────────────────────────── */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing exam id" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const includeAnswers = session.user.role !== "STUDENT";

    const exam = await getExamById(id, includeAnswers);

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 }
      );
    }

    let analytics = null;

    if (session.user.role === "TEACHER") {
      analytics = await getExamAnalytics(id);
    }

    return NextResponse.json({
      success: true,
      data: { ...exam, analytics },
    });
  } catch (error) {
    console.error("GET exam error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────────────────────────
   START EXAM ATTEMPT
───────────────────────────────────────────── */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const attempt = await startExamAttempt(id, session.user.id);

    return NextResponse.json(
      { success: true, data: attempt },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}

/* ─────────────────────────────────────────────
   SUBMIT EXAM ATTEMPT
───────────────────────────────────────────── */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { attemptId, answers, autoSubmit } = await req.json();

    if (!attemptId || !answers) {
      return NextResponse.json(
        { success: false, error: "attemptId and answers required" },
        { status: 400 }
      );
    }

    const result = await submitExamAttempt(
      attemptId,
      answers,
      autoSubmit || false
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

/* ─────────────────────────────────────────────
   PUBLISH / UNPUBLISH EXAM
───────────────────────────────────────────── */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);

    if (!session || session.user.role === "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { isPublished } = await req.json();

    const exam = await publishExam(id, isPublished);

    return NextResponse.json({
      success: true,
      data: exam,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}