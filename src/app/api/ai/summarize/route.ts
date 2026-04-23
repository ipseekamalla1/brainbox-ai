// src/app/api/ai/summarize/route.ts — AI Note Summarizer

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { summarizeNote } from "@/services/ai.service";
import { updateNoteSummary, getNoteById } from "@/services/note.service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { noteId, content } = await req.json();

    if (!noteId && !content) {
      return NextResponse.json(
        { success: false, error: "Either noteId or content is required" },
        { status: 400 }
      );
    }

    let textContent = content;
    let title: string | undefined;

    // If noteId provided, fetch note metadata
    if (noteId) {
      const note = await getNoteById(noteId);
      if (!note) {
        return NextResponse.json({ success: false, error: "Note not found" }, { status: 404 });
      }
      title = note.title;
      // If no content provided, use a placeholder
      // (In production, you'd extract text from the file using a PDF parser)
      if (!textContent) {
        textContent = `Academic notes titled: ${note.title}\nSubject: ${note.subject}\nTopic: ${note.topic || "General"}`;
      }
    }

    if (!textContent || textContent.trim().length < 20) {
      return NextResponse.json(
        { success: false, error: "Content is too short to summarize" },
        { status: 400 }
      );
    }

    // Generate summary via OpenAI
    const summary = await summarizeNote(textContent, title);

    // Save summary to database if noteId provided
    if (noteId) {
      await updateNoteSummary(noteId, summary);
    }

    return NextResponse.json({
      success: true,
      data: { summary, noteId },
    });
  } catch (error: unknown) {
  console.error("AI Summarize error:", error);

  const errorMessage =
    error instanceof Error ? error.message : "Failed to generate summary";

  return NextResponse.json(
    { success: false, error: errorMessage },
    { status: 500 }
  );
}
}