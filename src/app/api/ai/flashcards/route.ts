// src/app/api/ai/flashcards/route.ts — AI Flashcard Generator

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import openai, { AI_CONFIG } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { topic, count, content } = await req.json();
    if (!topic && !content) return NextResponse.json({ success: false, error: "Topic or content required" }, { status: 400 });

    const response = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      temperature: 0.7,
      max_tokens: 2500,
      messages: [
        {
          role: "system",
          content: "You create study flashcards. Each card has a front (question/term) and back (answer/definition). Group by category. Return ONLY valid JSON, no markdown.",
        },
        {
          role: "user",
          content: `Create ${count || 12} flashcards about "${topic}"${content ? ` based on these notes: ${content.slice(0, 5000)}` : ""}.

Return JSON array:
[
  { "front": "question or term", "back": "answer or definition", "category": "sub-topic" }
]`,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content || "[]";
    const cleaned = raw.replace(/```json\s?|```/g, "").trim();
    const flashcards = JSON.parse(cleaned);

 return NextResponse.json({ success: true, data: { flashcards } });
} catch (error: unknown) {
  const message =
    error instanceof Error ? error.message : "Failed";

  return NextResponse.json(
    { success: false, error: message },
    { status: 500 }
  );
}}