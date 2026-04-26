// ============================================================
// FILE LOCATION: app/api/admin/users/[id]/department/route.ts
// ACTION: CREATE NEW
// PURPOSE: PATCH assign student to department + DELETE remove from department
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleDepartmentChange, enrollStudentInDepartmentCourses } from "@/services/enrollement.service";
import { EnrollmentStatus, Role } from "@prisma/client";
import { z } from "zod";

const assignSchema = z.object({ departmentId: z.string().cuid() });

// PATCH — assign or change department
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 422 });

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, role: true, departmentId: true, name: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.role !== Role.STUDENT) {
    return NextResponse.json({ error: "Department assignment only applies to STUDENTs" }, { status: 422 });
  }

  const dept = await prisma.department.findUnique({
    where: { id: parsed.data.departmentId },
    select: { id: true, name: true },
  });
  if (!dept) return NextResponse.json({ error: "Department not found" }, { status: 404 });

  const isSame = user.departmentId === parsed.data.departmentId;

  await prisma.user.update({
    where: { id: params.id },
    data: { departmentId: parsed.data.departmentId },
  });

  if (isSame) {
    const result = await enrollStudentInDepartmentCourses(params.id, parsed.data.departmentId);
    return NextResponse.json({ message: "Already in this department — enrollment synced.", isSame: true, enrollment: result });
  }

  const { dropped, result } = await handleDepartmentChange(params.id, user.departmentId, parsed.data.departmentId);
  return NextResponse.json({ message: `${user.name} moved to ${dept.name}.`, dropped, enrollment: result });
}

// DELETE — remove from department (soft-drops all enrollments)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, departmentId: true },
  });

  if (!user || !user.departmentId) {
    return NextResponse.json({ error: "User has no department" }, { status: 422 });
  }

  const deptCourses = await prisma.course.findMany({
    where: { departmentId: user.departmentId },
    select: { id: true },
  });

  const { count } = await prisma.enrollment.updateMany({
    where: {
      userId: params.id,
      courseId: { in: deptCourses.map((c) => c.id) },
      status: EnrollmentStatus.ACTIVE,
    },
    data: { status: EnrollmentStatus.DROPPED },
  });

  await prisma.user.update({ where: { id: params.id }, data: { departmentId: null } });
  return NextResponse.json({ success: true, enrollmentsDropped: count });
}