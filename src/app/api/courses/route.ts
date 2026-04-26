// app/api/courses/route.ts — UPDATED
// Admin creates course → auto-enrolls dept students + optionally assigns teacher

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { enrollDepartmentInCourse, assignTeacher } from "@/services/enrollement.service";
import { z } from "zod";

const createCourseSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  subject: z.string().min(1).max(100),   // top-level subject label
  code: z.string().min(2).max(20).toUpperCase(),
  imageUrl: z.string().url().optional(),
  departmentId: z.string().cuid().optional(), // optional: not all courses need a dept
  teacherId: z.string().cuid().optional(),    // optional: assign teacher immediately
});

// GET /api/courses
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const departmentId = searchParams.get("departmentId");
  const subject = searchParams.get("subject");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

  let where: Record<string, unknown> = {};

  if (session.user.role === Role.STUDENT) {
    where = {
      enrollments: {
        some: { userId: session.user.id, role: Role.STUDENT, status: "ACTIVE" },
      },
    };
  } else if (session.user.role === Role.TEACHER) {
    where = {
      enrollments: {
        some: { userId: session.user.id, role: Role.TEACHER, status: "ACTIVE" },
      },
    };
  }

  if (departmentId) where.departmentId = departmentId;
  if (subject) where.subject = { contains: subject, mode: "insensitive" };

  const [courses, total] = await prisma.$transaction([
    prisma.course.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { title: "asc" },
      include: {
        department: { select: { id: true, name: true } },
        // Get teacher from enrollment
        enrollments: {
          where: { role: Role.TEACHER, status: "ACTIVE" },
          include: { user: { select: { id: true, name: true, email: true } } },
          take: 1,
        },
        _count: {
          select: {
            enrollments: { where: { role: Role.STUDENT, status: "ACTIVE" } },
            subjects: true,
          },
        },
      },
    }),
    prisma.course.count({ where }),
  ]);

  // Flatten teacher out of enrollments array for clean response
  const formatted = courses.map((c) => ({
    ...c,
    teacher: c.enrollments[0]?.user ?? null,
    enrollments: undefined,
    studentCount: c._count.enrollments,
    subjectCount: c._count.subjects,
    _count: undefined,
  }));

  return NextResponse.json({
    courses: formatted,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}

// POST /api/courses — Admin only
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createCourseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 422 });
  }

  // Verify department if provided
  if (parsed.data.departmentId) {
    const dept = await prisma.department.findUnique({ where: { id: parsed.data.departmentId } });
    if (!dept) return NextResponse.json({ error: "Department not found" }, { status: 404 });
  }

  // Verify teacher if provided
  if (parsed.data.teacherId) {
    const teacher = await prisma.user.findFirst({
      where: { id: parsed.data.teacherId, role: Role.TEACHER },
    });
    if (!teacher) return NextResponse.json({ error: "Teacher not found or not a TEACHER" }, { status: 404 });
  }

  // Check code uniqueness
  const codeConflict = await prisma.course.findUnique({ where: { code: parsed.data.code } });
  if (codeConflict) {
    return NextResponse.json({ error: `Course code ${parsed.data.code} already exists` }, { status: 409 });
  }

  const { teacherId, ...courseData } = parsed.data;

  // Create the course
  const course = await prisma.course.create({
    data: courseData,
    include: { department: { select: { id: true, name: true } } },
  });

  // Assign teacher (creates TEACHER enrollment)
  let teacherResult = null;
  if (teacherId) {
    teacherResult = await assignTeacher(teacherId, course.id);
  }

  // Auto-enroll all students in the department
  let enrollResult = null;
  if (parsed.data.departmentId) {
    enrollResult = await enrollDepartmentInCourse(course.id, parsed.data.departmentId);
  }

  return NextResponse.json(
    { course, teacherAssignment: teacherResult, enrollment: enrollResult },
    { status: 201 }
  );
}