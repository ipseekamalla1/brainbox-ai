// src/app/api/notes/route.ts — Notes API

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getNotes, createNote } from "@/services/note.service";

// GET /api/notes — fetch all notes (with optional filters)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId") || undefined;
    const subject = searchParams.get("subject") || undefined;
    const uploadedBy = searchParams.get("uploadedBy") || undefined;

    const notes = await getNotes({ courseId, subject, uploadedBy });

    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    console.error("GET /api/notes error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch notes" }, { status: 500 });
  }
}

// POST /api/notes — create a new note (after file uploaded to Firebase)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Only teachers and admins can upload notes
    if (session.user.role === "STUDENT") {
      return NextResponse.json({ success: false, error: "Students cannot upload notes" }, { status: 403 });
    }

    const body = await req.json();
    const { title, subject, topic, fileUrl, fileType, fileSize, courseId } = body;

    if (!title || !subject || !fileUrl || !fileType) {
      return NextResponse.json(
        { success: false, error: "Title, subject, fileUrl, and fileType are required" },
        { status: 400 }
      );
    }

    const note = await createNote({
      title,
      subject,
      topic: topic || undefined,
      fileUrl,
      fileType,
      fileSize: fileSize || undefined,
      uploadedBy: session.user.id,
      courseId: courseId || undefined,
    });

    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error) {
    console.error("POST /api/notes error:", error);
    return NextResponse.json({ success: false, error: "Failed to create note" }, { status: 500 });
  }
}