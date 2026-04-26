// ============================================================
// FILE LOCATION: app/api/courses/[courseId]/subjects/[subjectId]/route.ts
// ACTION: CREATE NEW
// PURPOSE: GET + PATCH + DELETE for one single subject
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  order: z.number().int().min(0).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { courseId: string; subjectId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subject = await prisma.subject.findFirst({
    where: { id: params.subjectId, courseId: params.courseId },
    include: {
      _count: { select: { notes: true, videos: true, quizzes: true, exams: true } },
    },
  });

  if (!subject) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ subject });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { courseId: string; subjectId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === Role.STUDENT) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 422 });

  const subject = await prisma.subject.update({
    where: { id: params.subjectId },
    data: parsed.data,
  });

  return NextResponse.json({ subject });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { courseId: string; subjectId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === Role.STUDENT) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.subject.delete({ where: { id: params.subjectId } });
  return NextResponse.json({ success: true });
}