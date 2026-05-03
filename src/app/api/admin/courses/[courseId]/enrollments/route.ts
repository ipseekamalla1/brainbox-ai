import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { enrollStudent, assignTeacher } from "@/services/enrollement.service";
import { z } from "zod";

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("enroll_student"), userId: z.string().cuid() }),
  z.object({ action: z.literal("assign_teacher"), userId: z.string().cuid() }),
  z.object({ action: z.literal("enroll_students_bulk"), userIds: z.array(z.string().cuid()).min(1) }),
]);

// ✅ FIXED: params must be awaited
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const roleFilter = searchParams.get("role") as Role | null;

  const enrollments = await prisma.enrollment.findMany({
    where: {
      courseId,
      status: "ACTIVE",
      ...(roleFilter ? { role: roleFilter } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          department: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: [{ role: "asc" }, { user: { name: "asc" } }],
  });

  const teacher = enrollments.find((e) => e.role === Role.TEACHER)?.user ?? null;
  const students = enrollments.filter((e) => e.role === Role.STUDENT).map((e) => e.user);

  return NextResponse.json({ teacher, students, total: students.length });
}

// ─────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 422 });
  }

  if (parsed.data.action === "assign_teacher") {
    const user = await prisma.user.findUnique({
      where: { id: parsed.data.userId },
    });

    if (!user || user.role !== Role.TEACHER) {
      return NextResponse.json({ error: "User is not a TEACHER" }, { status: 422 });
    }

    await prisma.enrollment.updateMany({
      where: { courseId, role: Role.TEACHER, status: "ACTIVE" },
      data: { status: "DROPPED" },
    });

    const result = await assignTeacher(parsed.data.userId, courseId);
    return NextResponse.json({ result });
  }

  if (parsed.data.action === "enroll_student") {
    const result = await enrollStudent(parsed.data.userId, courseId);
    return NextResponse.json({ result });
  }

  if (parsed.data.action === "enroll_students_bulk") {
    let enrolled = 0,
      skipped = 0,
      reactivated = 0;

    for (const userId of parsed.data.userIds) {
      const r = await enrollStudent(userId, courseId);

      if (r === "enrolled") enrolled++;
      else if (r === "reactivated") reactivated++;
      else skipped++;
    }

    return NextResponse.json({ enrolled, skipped, reactivated });
  }
}

// ─────────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const role = searchParams.get("role") as Role | null;

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 422 });
  }

  await prisma.enrollment.updateMany({
    where: {
      userId,
      courseId,
      status: "ACTIVE",
      ...(role ? { role } : {}),
    },
    data: { status: "DROPPED" },
  });

  return NextResponse.json({ success: true });
}