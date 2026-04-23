// src/app/api/ai/practice/route.ts — AI Practice Questions Generator

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import openai, { AI_CONFIG } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { topic, type, count } = await req.json();
    if (!topic) return NextResponse.json({ success: false, error: "Topic required" }, { status: 400 });

    const qType = type || "mixed";
    const qCount = Math.min(count || 5, 15);

    const response = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      temperature: 0.7,
      max_tokens: 3000,
      messages: [
        {
          role: "system",
          content: `You generate university-level practice questions. For each question include a hint that guides the student without giving the answer. Return ONLY valid JSON array, no markdown.`,
        },
        {
          role: "user",
          content: `Generate ${qCount} ${qType} practice questions about "${topic}".

Return JSON array:
[
  {
    "type": "MCQ" | "OPEN_ENDED",
    "question": "...",
    "options": ["A","B","C","D"] (MCQ only),
    "correctAnswer": "...",
    "hint": "a helpful hint without giving the answer",
    "explanation": "why the answer is correct",
    "difficulty": "easy" | "medium" | "hard"
  }
]`,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content || "[]";
    const cleaned = raw.replace(/```json\s?|```/g, "").trim();
    const questions = JSON.parse(cleaned);

 return NextResponse.json({ success: true, data: { questions } });
} catch (error: unknown) {
  console.error("Practice questions error:", error);

  const message =
    error instanceof Error ? error.message : "Failed";

  return NextResponse.json(
    { success: false, error: message },
    { status: 500 }
  );
}}