// src/app/api/activity/route.ts — Activity Tracking API

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserActivity, getUserStreak, logActivity } from "@/services/activity.service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const [activities, streak] = await Promise.all([
      getUserActivity(session.user.id),
      getUserStreak(session.user.id),
    ]);

    return NextResponse.json({ success: true, data: { activities, streak } });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { type, title, score, duration, entityId } = await req.json();
    if (!type) return NextResponse.json({ success: false, error: "Type required" }, { status: 400 });

    const activity = await logActivity(session.user.id, type, { title, score, duration, entityId });
    return NextResponse.json({ success: true, data: activity }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}