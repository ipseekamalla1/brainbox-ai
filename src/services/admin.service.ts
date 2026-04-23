// src/services/admin.service.ts

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma, Role } from "@prisma/client";

// ─── TYPES ─────────────────────────────────────────

type GetUsersFilters = {
  role?: Role;
  search?: string;
  page?: number;
  pageSize?: number;
};

// ─── User Management ────────────────────────────────

export async function getAllUsers(filters?: GetUsersFilters) {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const where: Prisma.UserWhereInput = {};

  // ✅ Role filter
  if (filters?.role) {
    where.role = filters.role;
  }

  // ✅ Search filter
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            quizAttempts: true,
            examAttempts: true,
            notes: true,
            quizzesCreated: true,
            examsCreated: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ─── Update Role ───────────────────────────────────

export async function updateUserRole(userId: string, role: Role) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
}

// ─── Delete User ───────────────────────────────────

export async function deleteUser(userId: string) {
  return prisma.user.delete({ where: { id: userId } });
}

// ─── Create User ───────────────────────────────────

export async function createUserByAdmin(data: {
  name: string;
  email: string;
  password: string;
  role: Role;
}) {
  const passwordHash = await bcrypt.hash(data.password, 12);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

// ─── System Analytics (✅ FIXED YOUR ERROR) ─────────

export async function getSystemAnalytics() {
  const [
    totalUsers,
    students,
    teachers,
    admins,
    totalCourses,
    totalNotes,
    totalVideos,
    totalQuizzes,
    totalExams,
    totalQuizAttempts,
    totalExamAttempts,
    totalChatSessions,
    totalMessages,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.course.count(),
    prisma.note.count(),
    prisma.video.count(),
    prisma.quiz.count(),
    prisma.exam.count(),
    prisma.quizAttempt.count({ where: { submittedAt: { not: null } } }),
    prisma.examAttempt.count({ where: { submittedAt: { not: null } } }),
    prisma.chatSession.count(),
    prisma.chatMessage.count(),
  ]);

  return {
    totalUsers,

    roleDistribution: {
      students,
      teachers,
      admins,
    },

    content: {
      courses: totalCourses,
      notes: totalNotes,
      videos: totalVideos,
      quizzes: totalQuizzes,
      exams: totalExams,
    },

    activity: {
      quizAttempts: totalQuizAttempts,
      examAttempts: totalExamAttempts,
      chatSessions: totalChatSessions,
      chatMessages: totalMessages,
    },
  };
}