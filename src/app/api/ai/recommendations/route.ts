// src/app/api/ai/recommendations/route.ts — AI Smart Recommendations

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import openai, { AI_CONFIG } from "@/lib/openai";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    // Gather student data for personalized recommendations
    const [quizAttempts, videoProgress, recentActivity] = await Promise.all([
      prisma.quizAttempt.findMany({
        where: { userId: session.user.id, submittedAt: { not: null } },
        include: { quiz: { select: { title: true } }, answers: { include: { question: { select: { question: true } } } } },
        orderBy: { submittedAt: "desc" },
        take: 5,
      }),
      prisma.videoProgress.findMany({
        where: { userId: session.user.id },
        include: { video: { select: { title: true } } },
      }),
      prisma.activity.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // Build context for AI
    const weakAreas = quizAttempts
      .flatMap((a) => a.answers.filter((ans) => !ans.isCorrect).map((ans) => ans.question.question))
      .slice(0, 10);

    const recentTopics = quizAttempts.map((a) => a.quiz.title);
    const incompleteVideos = videoProgress.filter((v) => !v.completed).map((v) => v.video.title);

    const response = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      temperature: 0.7,
      max_tokens: 1500,
      messages: [
        {
          role: "system",
          content: "You are an academic advisor AI. Analyze student performance and suggest personalized study recommendations. Return ONLY valid JSON, no markdown.",
        },
        {
          role: "user",
          content: `Student data:
- Recent quizzes: ${recentTopics.join(", ") || "none"}
- Questions they got wrong: ${weakAreas.join("; ") || "none"}
- Incomplete videos: ${incompleteVideos.join(", ") || "none"}
- Recent activity types: ${recentActivity.map((a) => a.type).join(", ") || "none"}

Generate personalized recommendations. Return JSON:
{
  "weakTopics": ["topic1", "topic2"],
  "recommendations": [
    { "type": "REVIEW" | "PRACTICE" | "WATCH" | "READ", "title": "...", "reason": "...", "priority": "high" | "medium" | "low" }
  ],
  "studyTip": "personalized study tip",
  "encouragement": "motivational message based on their progress"
}`,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json\s?|```/g, "").trim();
    const recommendations = JSON.parse(cleaned);

    return NextResponse.json({ success: true, data: recommendations });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
