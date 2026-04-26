// lib/enrollment-service.ts
// Works with your EXISTING Enrollment model.
// Key difference from a fresh design:
//   - Your Enrollment has a `role` field (STUDENT/TEACHER) 
//   - Teacher assignment = Enrollment with role: TEACHER
//   - Student enrollment = Enrollment with role: STUDENT
//   - We added `status` field (ACTIVE/DROPPED/COMPLETED)

import { prisma } from "@/lib/prisma";
import { Role, EnrollmentStatus } from "@prisma/client";

export type EnrollResult = {
  enrolled: number;
  skipped: number;
  reactivated: number;
};

// ─── ENROLL STUDENT IN ONE COURSE ────────────────────────────

export async function enrollStudent(
  userId: string,
  courseId: string
): Promise<"enrolled" | "reactivated" | "already_active"> {
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existing) {
    if (existing.status === EnrollmentStatus.ACTIVE && existing.role === Role.STUDENT) {
      return "already_active";
    }
    await prisma.enrollment.update({
      where: { id: existing.id },
      data: { status: EnrollmentStatus.ACTIVE, role: Role.STUDENT },
    });
    return "reactivated";
  }

  await prisma.enrollment.create({
    data: { userId, courseId, role: Role.STUDENT, status: EnrollmentStatus.ACTIVE },
  });
  return "enrolled";
}

// ─── ASSIGN TEACHER TO COURSE ─────────────────────────────────
// Uses Enrollment.role = TEACHER — no separate table.
// A user can only have ONE role per course (unique constraint).

export async function assignTeacher(
  teacherId: string,
  courseId: string
): Promise<"assigned" | "already_assigned" | "role_conflict"> {
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: teacherId, courseId } },
  });

  if (existing) {
    if (existing.role === Role.TEACHER && existing.status === EnrollmentStatus.ACTIVE) {
      return "already_assigned";
    }
    // If they were a student in this course (shouldn't happen but handle it)
    if (existing.role === Role.STUDENT) {
      return "role_conflict";
    }
    await prisma.enrollment.update({
      where: { id: existing.id },
      data: { role: Role.TEACHER, status: EnrollmentStatus.ACTIVE },
    });
    return "assigned";
  }

  await prisma.enrollment.create({
    data: { userId: teacherId, courseId, role: Role.TEACHER, status: EnrollmentStatus.ACTIVE },
  });
  return "assigned";
}

// ─── REMOVE TEACHER FROM COURSE ──────────────────────────────

export async function removeTeacher(
  teacherId: string,
  courseId: string
): Promise<boolean> {
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: teacherId, courseId, role: Role.TEACHER },
  });
  if (!enrollment) return false;

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { status: EnrollmentStatus.DROPPED },
  });
  return true;
}

// ─── AUTO-ENROLL ALL DEPT STUDENTS IN A COURSE ───────────────
// Called when admin creates a new course for a department.

export async function enrollDepartmentInCourse(
  courseId: string,
  departmentId: string
): Promise<EnrollResult> {
  const students = await prisma.user.findMany({
    where: { departmentId, role: Role.STUDENT },
    select: { id: true },
  });

  if (students.length === 0) return { enrolled: 0, skipped: 0, reactivated: 0 };

  const existing = await prisma.enrollment.findMany({
    where: {
      courseId,
      userId: { in: students.map((s) => s.id) },
      role: Role.STUDENT,
    },
    select: { userId: true, status: true, id: true },
  });

  const existingMap = new Map(existing.map((e) => [e.userId, e]));
  const toCreate: string[] = [];
  const toReactivate: string[] = [];
  let skipped = 0;

  for (const s of students) {
    const e = existingMap.get(s.id);
    if (!e) {
      toCreate.push(s.id);
    } else if (e.status !== EnrollmentStatus.ACTIVE) {
      toReactivate.push(e.id);
    } else {
      skipped++;
    }
  }

  if (toCreate.length > 0) {
    await prisma.enrollment.createMany({
      data: toCreate.map((userId) => ({
        userId,
        courseId,
        role: Role.STUDENT,
        status: EnrollmentStatus.ACTIVE,
      })),
      skipDuplicates: true,
    });
  }

  if (toReactivate.length > 0) {
    await prisma.enrollment.updateMany({
      where: { id: { in: toReactivate } },
      data: { status: EnrollmentStatus.ACTIVE },
    });
  }

  return { enrolled: toCreate.length, skipped, reactivated: toReactivate.length };
}

// ─── ENROLL STUDENT IN ALL DEPT COURSES ──────────────────────
// Called when admin assigns a student to a department.

export async function enrollStudentInDepartmentCourses(
  userId: string,
  departmentId: string
): Promise<EnrollResult> {
  const courses = await prisma.course.findMany({
    where: { departmentId },
    select: { id: true },
  });

  let enrolled = 0, skipped = 0, reactivated = 0;

  for (const course of courses) {
    const result = await enrollStudent(userId, course.id);
    if (result === "enrolled") enrolled++;
    else if (result === "reactivated") reactivated++;
    else skipped++;
  }

  return { enrolled, skipped, reactivated };
}

// ─── HANDLE DEPARTMENT CHANGE ─────────────────────────────────
// Student moves from dept A → dept B.
// Soft-drops old dept course enrollments, enrolls in new dept courses.

export async function handleDepartmentChange(
  userId: string,
  oldDepartmentId: string | null,
  newDepartmentId: string
): Promise<{ dropped: number; result: EnrollResult }> {
  let dropped = 0;

  if (oldDepartmentId && oldDepartmentId !== newDepartmentId) {
    const oldCourses = await prisma.course.findMany({
      where: { departmentId: oldDepartmentId },
      select: { id: true },
    });

    if (oldCourses.length > 0) {
      const { count } = await prisma.enrollment.updateMany({
        where: {
          userId,
          courseId: { in: oldCourses.map((c) => c.id) },
          role: Role.STUDENT,
          status: EnrollmentStatus.ACTIVE,
        },
        data: { status: EnrollmentStatus.DROPPED },
      });
      dropped = count;
    }
  }

  const result = await enrollStudentInDepartmentCourses(userId, newDepartmentId);
  return { dropped, result };
}

// ─── SYNC ENTIRE DEPARTMENT ───────────────────────────────────
// Admin repair tool — ensures all students enrolled in all courses.

export async function syncDepartmentEnrollments(departmentId: string) {
  const courses = await prisma.course.findMany({
    where: { departmentId },
    select: { id: true },
  });

  let totalEnrolled = 0, totalSkipped = 0, totalReactivated = 0;

  for (const course of courses) {
    const r = await enrollDepartmentInCourse(course.id, departmentId);
    totalEnrolled += r.enrolled;
    totalSkipped += r.skipped;
    totalReactivated += r.reactivated;
  }

  return { coursesSynced: courses.length, totalEnrolled, totalSkipped, totalReactivated };
}

// ─── GET TEACHER FOR COURSE ───────────────────────────────────
// Derived lookup — no extra table needed.

export async function getCourseTeacher(courseId: string) {
  const enrollment = await prisma.enrollment.findFirst({
    where: { courseId, role: Role.TEACHER, status: EnrollmentStatus.ACTIVE },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
  });
  return enrollment?.user ?? null;
}

// ─── GET ALL STUDENTS A TEACHER TEACHES ──────────────────────
// Derived: Teacher → TeacherEnrollments → courseIds → StudentEnrollments → Users

export async function getTeacherStudents(teacherId: string, courseId?: string) {
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
    where: { courseId: { in: courseIds }, role: Role.STUDENT, status: EnrollmentStatus.ACTIVE },
    include: {
      user: { select: { id: true, name: true, email: true, department: { select: { name: true } } } },
      course: { select: { id: true, title: true, code: true } },
    },
    orderBy: [{ course: { title: "asc" } }, { user: { name: "asc" } }],
  });

  // Deduplicate into student → [courses] map
  const map = new Map<string, { user: typeof studentEnrollments[0]["user"]; courses: string[] }>();
  for (const e of studentEnrollments) {
    if (!map.has(e.userId)) map.set(e.userId, { user: e.user, courses: [] });
    map.get(e.userId)!.courses.push(e.course.title);
  }

  return Array.from(map.values());
}