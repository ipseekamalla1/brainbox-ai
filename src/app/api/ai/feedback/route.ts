// src/app/api/ai/feedback/route.ts — AI Answer Feedback

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateFeedback } from "@/services/ai.service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { question, studentAnswer, correctAnswer } = await req.json();

    if (!question || !studentAnswer || !correctAnswer) {
      return NextResponse.json(
        { success: false, error: "question, studentAnswer, and correctAnswer are required" },
        { status: 400 }
      );
    }

    const feedback = await generateFeedback(question, studentAnswer, correctAnswer);

    return NextResponse.json({ success: true, data: { feedback } });
  } catch (error: unknown) {
  console.error("AI Feedback error:", error);

  const errorMessage =
    error instanceof Error ? error.message : "Failed to generate feedback";

  return NextResponse.json(
    { success: false, error: errorMessage },
    { status: 500 }
  );
}
}