// src/app/api/analytics/route.ts — Analytics API

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudentPerformance, getClassAnalytics } from "@/services/analytics.service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "STUDENT") {
      const data = await getStudentPerformance(session.user.id);
      return NextResponse.json({ success: true, data });
    }

    if (session.user.role === "TEACHER") {
      const data = await getClassAnalytics(session.user.id);
      return NextResponse.json({ success: true, data });
    }

    // Admin gets teacher-style analytics for all
    const data = await getClassAnalytics(session.user.id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 });
  }
}