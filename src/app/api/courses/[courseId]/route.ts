// ============================================================
// FILE LOCATION: app/api/courses/[courseId]/subjects/route.ts
// ACTION: CREATE NEW
// PURPOSE: GET list subjects in a course + POST create subject
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  order: z.number().int().min(0).default(0),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Students must be enrolled
  if (session.user.role === Role.STUDENT) {
    const enrolled = await prisma.enrollment.findFirst({
      where: { userId: session.user.id, courseId: params.courseId, status: "ACTIVE" },
    });
    if (!enrolled) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  const subjects = await prisma.subject.findMany({
    where: { courseId: params.courseId },
    orderBy: { order: "asc" },
    include: {
      _count: { select: { notes: true, videos: true, quizzes: true, exams: true } },
    },
  });

  return NextResponse.json({ subjects });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === Role.STUDENT) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Teacher must teach this course
  if (session.user.role === Role.TEACHER) {
    const isTeacher = await prisma.enrollment.findFirst({
      where: { userId: session.user.id, courseId: params.courseId, role: Role.TEACHER, status: "ACTIVE" },
    });
    if (!isTeacher) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 422 });
  }

  const subject = await prisma.subject.create({
    data: { ...parsed.data, courseId: params.courseId },
  });

  return NextResponse.json({ subject }, { status: 201 });
}