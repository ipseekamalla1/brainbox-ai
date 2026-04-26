// ============================================================
// FILE LOCATION: app/api/teacher/students/route.ts
// ACTION: CREATE NEW
// PURPOSE: GET all students taught by the currently logged-in teacher
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  const taughtCourses = await prisma.enrollment.findMany({
    where: {
      userId: session.user.id,
      role: Role.TEACHER,
      status: "ACTIVE",
      ...(courseId ? { courseId } : {}),
    },
    select: { courseId: true },
  });

  const courseIds = taughtCourses.map((e) => e.courseId);
  if (courseIds.length === 0) return NextResponse.json({ students: [], total: 0 });

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: { in: courseIds }, role: Role.STUDENT, status: "ACTIVE" },
    include: {
      user: {
        select: {
          id: true, name: true, email: true,
          department: { select: { name: true } },
        },
      },
      course: { select: { id: true, title: true, code: true } },
    },
    orderBy: [{ course: { title: "asc" } }, { user: { name: "asc" } }],
  });

  const map = new Map<string, { user: (typeof enrollments)[0]["user"]; courses: string[] }>();
  for (const e of enrollments) {
    if (!map.has(e.userId)) map.set(e.userId, { user: e.user, courses: [] });
    map.get(e.userId)!.courses.push(e.course.title);
  }

  const students = Array.from(map.values());
  return NextResponse.json({ students, total: students.length });
}