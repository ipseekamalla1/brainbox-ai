// src/app/api/videos/route.ts — Videos API

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getVideos, getVideosWithProgress, createVideo, updateVideoProgress } from "@/services/video.service";

// GET /api/videos — fetch videos (with progress for students)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId") || undefined;

    // Students get videos with their progress
    if (session.user.role === "STUDENT") {
      const videos = await getVideosWithProgress(session.user.id, courseId);
      return NextResponse.json({ success: true, data: videos });
    }

    // Teachers get videos they uploaded
    const uploadedBy = session.user.role === "TEACHER" ? session.user.id : undefined;
    const videos = await getVideos({ courseId, uploadedBy });

    return NextResponse.json({ success: true, data: videos });
  } catch (error) {
    console.error("GET /api/videos error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch videos" }, { status: 500 });
  }
}

// POST /api/videos — create a new video
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "STUDENT") {
      return NextResponse.json({ success: false, error: "Students cannot upload videos" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, url, thumbnailUrl, duration, courseId } = body;

    if (!title || !url) {
      return NextResponse.json(
        { success: false, error: "Title and URL are required" },
        { status: 400 }
      );
    }

    const video = await createVideo({
      title,
      description: description || undefined,
      url,
      thumbnailUrl: thumbnailUrl || undefined,
      duration: duration || undefined,
      uploadedBy: session.user.id,
      courseId: courseId || undefined,
    });

    return NextResponse.json({ success: true, data: video }, { status: 201 });
  } catch (error) {
    console.error("POST /api/videos error:", error);
    return NextResponse.json({ success: false, error: "Failed to create video" }, { status: 500 });
  }
}

// PATCH /api/videos — update watch progress
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { videoId, watchedSeconds, duration } = body;

    if (!videoId || watchedSeconds === undefined) {
      return NextResponse.json(
        { success: false, error: "videoId and watchedSeconds are required" },
        { status: 400 }
      );
    }

    const progress = await updateVideoProgress(
      session.user.id,
      videoId,
      watchedSeconds,
      duration || undefined
    );

    return NextResponse.json({ success: true, data: progress });
  } catch (error) {
    console.error("PATCH /api/videos error:", error);
    return NextResponse.json({ success: false, error: "Failed to update progress" }, { status: 500 });
  }
}