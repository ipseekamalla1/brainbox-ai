// src/services/ai.service.ts — AI Business Logic (OpenAI)

import openai, { AI_CONFIG, SYSTEM_PROMPTS } from "@/lib/openai";
import type { QuestionType } from "@/types";

// ─── Types ─────────────────────────────────────────

interface GeneratedQuestion {
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
}

interface GeneratedSection {
  title: string;
  description?: string;
  questions: GeneratedQuestion[];
}

type RawQuestion = {
  type?: string;
  question?: string;
  options?: unknown;
  correctAnswer?: string;
  points?: number;
};

// ─── Note Summarizer ────────────────────────────────

export async function summarizeNote(
  content: string,
  title?: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: AI_CONFIG.model,
    temperature: 0.5,
    max_tokens: AI_CONFIG.maxTokens,
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.summarizer },
      {
        role: "user",
        content: `Summarize the following academic notes${
          title ? ` titled "${title}"` : ""
        }.
Create a structured summary with:
- Key concepts (bold important terms)
- Main takeaways (bullet points)
- Important formulas/definitions if any

Notes content:
${content.slice(0, 12000)}`,
      },
    ],
  });

  return (
    response.choices[0]?.message?.content ||
    "Unable to generate summary."
  );
}

// ─── AI Quiz Generator ──────────────────────────────

export async function generateQuizFromTopic(
  topic: string,
  questionCount: number = 5,
  difficulty: "easy" | "medium" | "hard" = "medium",
  questionType: "MCQ" | "SHORT_ANSWER" | "MIXED" = "MCQ"
): Promise<GeneratedQuestion[]> {
  const typeInstructions =
    questionType === "MIXED"
      ? "Mix of MCQ and SHORT_ANSWER questions"
      : `All questions should be ${questionType}`;

  const response = await openai.chat.completions.create({
    model: AI_CONFIG.model,
    temperature: 0.7,
    max_tokens: 3000,
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.quizGenerator },
      {
        role: "user",
        content: `Generate ${questionCount} ${difficulty}-difficulty university-level questions about: "${topic}"

${typeInstructions}

Return ONLY valid JSON array with this exact schema (no markdown, no backticks):
[
  {
    "type": "MCQ" or "SHORT_ANSWER",
    "question": "question text",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "exact correct answer",
    "points": 1 or 2
  }
]`,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content || "[]";

  try {
    const cleaned = raw.replace(/```json\s?|```/g, "").trim();
    const parsed: unknown = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid AI response format");
    }

    return parsed.map((q: RawQuestion): GeneratedQuestion => ({
      type: q.type === "SHORT_ANSWER" ? "SHORT_ANSWER" : "MCQ",
      question: q.question ?? "",
      options:
        q.type === "MCQ" && Array.isArray(q.options)
          ? q.options.slice(0, 4)
          : undefined,
      correctAnswer: q.correctAnswer ?? "",
      points: q.points ?? 1,
    }));
  } catch (err: unknown) {
    console.error("Failed to parse AI quiz response:", err);
    throw new Error("AI returned invalid quiz format. Please try again.");
  }
}

// ─── AI Exam Generator ──────────────────────────────

export async function generateExam(
  topic: string,
  sectionCount: number = 3,
  questionsPerSection: number = 5
): Promise<GeneratedSection[]> {
  const response = await openai.chat.completions.create({
    model: AI_CONFIG.premiumModel,
    temperature: 0.7,
    max_tokens: 4000,
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.examGenerator },
      {
        role: "user",
        content: `Create a university-level exam about: "${topic}"

Structure: ${sectionCount} sections, ~${questionsPerSection} questions each.

Return ONLY valid JSON array (no markdown):
[
  {
    "title": "Section A",
    "description": "Description",
    "questions": [
      {
        "type": "MCQ" | "SHORT_ANSWER" | "LONG_ANSWER",
        "question": "...",
        "options": [],
        "correctAnswer": "...",
        "points": 1-5
      }
    ]
  }
]`,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content || "[]";

  try {
    const cleaned = raw.replace(/```json\s?|```/g, "").trim();
    const parsed: unknown = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid AI response format");
    }

    return parsed as GeneratedSection[];
  } catch (err: unknown) {
    console.error("Failed to parse AI exam response:", err);
    throw new Error("AI returned invalid exam format. Please try again.");
  }
}

// ─── AI Tutor Chat ──────────────────────────────────

export async function tutorChat(
  messages: { role: "user" | "assistant"; content: string }[],
  context?: string
) {
  const systemMessage = context
    ? `${SYSTEM_PROMPTS.tutor}\n\nCurrent course/topic context: ${context}`
    : SYSTEM_PROMPTS.tutor;

  return openai.chat.completions.create({
    model: AI_CONFIG.model,
    temperature: AI_CONFIG.temperature,
    max_tokens: AI_CONFIG.maxTokens,
    stream: true,
    messages: [{ role: "system", content: systemMessage }, ...messages],
  });
}

// ─── AI Feedback ────────────────────────────────────

export async function generateFeedback(
  question: string,
  studentAnswer: string,
  correctAnswer: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: AI_CONFIG.model,
    temperature: 0.5,
    max_tokens: 500,
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.feedback },
      {
        role: "user",
        content: `Question: ${question}

Student's Answer: ${studentAnswer}

Correct Answer: ${correctAnswer}

Provide constructive feedback explaining:
1. What was correct/incorrect
2. Why the correct answer is right
3. A tip for remembering this concept`,
      },
    ],
  });

  return (
    response.choices[0]?.message?.content ||
    "Unable to generate feedback."
  );
}