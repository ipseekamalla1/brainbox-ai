// ============================================================
// FILE LOCATION: app/api/departments/[id]/route.ts
// ACTION: CREATE NEW
// PURPOSE: GET one department detail + PATCH edit + DELETE remove
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const department = await prisma.department.findUnique({
    where: { id: params.id },
    include: {
      courses: {
        include: {
          enrollments: {
            where: { role: "TEACHER", status: "ACTIVE" },
            include: { user: { select: { id: true, name: true, email: true } } },
            take: 1,
          },
          _count: {
            select: {
              enrollments: { where: { role: "STUDENT", status: "ACTIVE" } },
              subjects: true,
            },
          },
        },
        orderBy: { title: "asc" },
      },
      _count: { select: { students: { where: { role: "STUDENT" } } } },
    },
  });

  if (!department) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Flatten teacher out of enrollments for each course
  const formatted = {
    ...department,
    courses: department.courses.map((c) => ({
      ...c,
      teacher: c.enrollments[0]?.user ?? null,
      studentCount: c._count.enrollments,
      subjectCount: c._count.subjects,
      enrollments: undefined,
      _count: undefined,
    })),
  };

  return NextResponse.json({ department: formatted });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 422 });
  }

  const department = await prisma.department.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json({ department });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const studentCount = await prisma.user.count({
    where: { departmentId: params.id },
  });
  if (studentCount > 0) {
    return NextResponse.json(
      { error: `${studentCount} students still assigned. Reassign them first.` },
      { status: 409 }
    );
  }

  const courseCount = await prisma.course.count({ where: { departmentId: params.id } });
  if (courseCount > 0) {
    return NextResponse.json(
      { error: `${courseCount} courses still belong to this department.` },
      { status: 409 }
    );
  }

  await prisma.department.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}