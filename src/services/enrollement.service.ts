// lib/enrollment-service.ts
// ✅ MANUAL ENROLLMENT ONLY (NO AUTO SYNC, NO DEPARTMENT LOGIC)

import { prisma } from "@/lib/prisma";
import { Role, EnrollmentStatus } from "@prisma/client";

// ─── ENROLL STUDENT IN ONE COURSE ────────────────────────────

export async function enrollStudent(
  userId: string,
  courseId: string
): Promise<"enrolled" | "reactivated" | "already_active"> {
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existing) {
    if (
      existing.status === EnrollmentStatus.ACTIVE &&
      existing.role === Role.STUDENT
    ) {
      return "already_active";
    }

    await prisma.enrollment.update({
      where: { id: existing.id },
      data: {
        status: EnrollmentStatus.ACTIVE,
        role: Role.STUDENT,
      },
    });

    return "reactivated";
  }

  await prisma.enrollment.create({
    data: {
      userId,
      courseId,
      role: Role.STUDENT,
      status: EnrollmentStatus.ACTIVE,
    },
  });

  return "enrolled";
}

// ─── ASSIGN TEACHER ─────────────────────────────────────────

export async function assignTeacher(
  teacherId: string,
  courseId: string
): Promise<"assigned" | "already_assigned" | "role_conflict"> {
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: teacherId, courseId } },
  });

  if (existing) {
    if (
      existing.role === Role.TEACHER &&
      existing.status === EnrollmentStatus.ACTIVE
    ) {
      return "already_assigned";
    }

    if (existing.role === Role.STUDENT) {
      return "role_conflict";
    }

    await prisma.enrollment.update({
      where: { id: existing.id },
      data: {
        role: Role.TEACHER,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    return "assigned";
  }

  await prisma.enrollment.create({
    data: {
      userId: teacherId,
      courseId,
      role: Role.TEACHER,
      status: EnrollmentStatus.ACTIVE,
    },
  });

  return "assigned";
}

// ─── REMOVE TEACHER ─────────────────────────────────────────

export async function removeTeacher(
  teacherId: string,
  courseId: string
): Promise<boolean> {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: teacherId,
      courseId,
      role: Role.TEACHER,
    },
  });

  if (!enrollment) return false;

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { status: EnrollmentStatus.DROPPED },
  });

  return true;
}

// ─── GET COURSE TEACHER ─────────────────────────────────────

export async function getCourseTeacher(courseId: string) {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      courseId,
      role: Role.TEACHER,
      status: EnrollmentStatus.ACTIVE,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  return enrollment?.user ?? null;
}

// ─── GET STUDENTS FOR TEACHER ───────────────────────────────

export async function getTeacherStudents(
  teacherId: string,
  courseId?: string
) {
  const taughtCourses = await prisma.enrollment.findMany({
    where: {
      userId: teacherId,
      role: Role.TEACHER,
      status: EnrollmentStatus.ACTIVE,
      ...(courseId ? { courseId } : {}),
    },
    select: { courseId: true },
  });

  const courseIds = taughtCourses.map((e) => e.courseId);
  if (courseIds.length === 0) return [];

  const studentEnrollments = await prisma.enrollment.findMany({
    where: {
      courseId: { in: courseIds },
      role: Role.STUDENT,
      status: EnrollmentStatus.ACTIVE,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          department: { select: { name: true } },
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          code: true,
        },
      },
    },
    orderBy: [
      { course: { title: "asc" } },
      { user: { name: "asc" } },
    ],
  });

  const map = new Map<
    string,
    { user: typeof studentEnrollments[0]["user"]; courses: string[] }
  >();

  for (const e of studentEnrollments) {
    if (!map.has(e.userId)) {
      map.set(e.userId, { user: e.user, courses: [] });
    }
    map.get(e.userId)!.courses.push(e.course.title);
  }

  return Array.from(map.values());
}

export async function enrollStudentInDepartmentCourses(
  userId: string,
  departmentId: string
) {
  const courses = await prisma.course.findMany({
    where: { departmentId },
    select: { id: true },
  });

  const results = [];

  for (const course of courses) {
    const res = await enrollStudent(userId, course.id);
    results.push({ courseId: course.id, status: res });
  }

  return results;
}

export async function handleDepartmentChange(
  userId: string,
  oldDeptId: string | null,
  newDeptId: string
) {
  let dropped = 0;

  if (oldDeptId) {
    const oldCourses = await prisma.course.findMany({
      where: { departmentId: oldDeptId },
      select: { id: true },
    });

    const result = await prisma.enrollment.updateMany({
      where: {
        userId,
        courseId: { in: oldCourses.map(c => c.id) },
        status: EnrollmentStatus.ACTIVE,
        role: Role.STUDENT,
      },
      data: { status: EnrollmentStatus.DROPPED },
    });

    dropped = result.count;
  }

  const enrollment = await enrollStudentInDepartmentCourses(userId, newDeptId);

  return { dropped, result: enrollment };
}