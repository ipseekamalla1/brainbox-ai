import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getNotes, createNote } from "@/services/note.service";

// ✅ GET NOTES
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const uploadedBy = searchParams.get("uploadedBy") || undefined;
    const subject = searchParams.get("subject") || undefined;
    const courseId = searchParams.get("courseId") || undefined;

    const notes = await getNotes({
      uploadedBy: uploadedBy || session.user.id, // ✅ FIXED FALLBACK
      subject,
      courseId,
    });

    return NextResponse.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error("GET /api/notes error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// ✅ CREATE NOTE
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role === "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Students cannot upload notes" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const { title, subject, topic, fileUrl, fileType, fileSize, courseId } =
      body;

    if (!title || !subject || !fileUrl || !fileType) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const note = await createNote({
      title,
      subject,
      topic,
      fileUrl,
      fileType,
      fileSize,
      uploadedBy: session.user.id,
      courseId,
    });

    return NextResponse.json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error("POST /api/notes error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create note" },
      { status: 500 }
    );
  }
}