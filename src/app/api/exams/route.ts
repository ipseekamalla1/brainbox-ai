import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getExams, createExam } from "@/services/exam.service";

// ✅ Proper types
type QuestionInput = {
  type?: "MCQ" | "SHORT_ANSWER" | "LONG_ANSWER";
  question: string;
  options?: string[];
  correctAnswer?: string;
  points?: number;
};

type SectionInput = {
  title: string;
  description?: string;
  questions?: QuestionInput[];
};

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
      const exams = await getExams({
        createdById: session.user.id,
        courseId,
      });

      return NextResponse.json({ success: true, data: exams });
    }

    const exams = await getExams({
      isPublished: true,
      courseId,
    });

    return NextResponse.json({ success: true, data: exams });
  } catch (error) {
    console.error("GET /api/exams error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      title,
      description,
      courseId,
      timeLimit,
      startTime,
      endTime,
      sections,
    } = body;

    if (!title || !timeLimit || !sections?.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, timeLimit, and at least one section are required",
        },
        { status: 400 }
      );
    }

    const exam = await createExam({
      title,
      description,
      courseId,
      createdById: session.user.id,
      timeLimit,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,

      // ✅ FIXED: no `any`
      sections: (sections as SectionInput[]).map((s, si) => ({
        title: s.title,
        description: s.description,
        order: si,
        questions: (s.questions ?? []).map((q, qi) => ({
          type: q.type || "MCQ",
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points || 1,
          order: qi,
        })),
      })),
    });

    return NextResponse.json(
      { success: true, data: exam },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/exams error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create exam" },
      { status: 500 }
    );
  }
}