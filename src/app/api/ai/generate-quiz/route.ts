// src/app/api/ai/generate-quiz/route.ts — AI Quiz Generator

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateQuizFromTopic } from "@/services/ai.service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "STUDENT") {
      return NextResponse.json({ success: false, error: "Only teachers can generate quizzes" }, { status: 403 });
    }

    const { topic, questionCount, difficulty, questionType } = await req.json();

    if (!topic) {
      return NextResponse.json({ success: false, error: "Topic is required" }, { status: 400 });
    }

    const questions = await generateQuizFromTopic(
      topic,
      Math.min(questionCount || 5, 20),
      difficulty || "medium",
      questionType || "MCQ"
    );

    return NextResponse.json({ success: true, data: { questions } });
  } catch (error: unknown) {
  console.error("AI Quiz Gen error:", error);

  const errorMessage =
    error instanceof Error ? error.message : "Failed to generate quiz";

  return NextResponse.json(
    { success: false, error: errorMessage },
    { status: 500 }
  );
}
}