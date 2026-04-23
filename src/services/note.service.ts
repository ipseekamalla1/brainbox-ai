import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getNotes(filters?: {
  courseId?: string;
  subject?: string;
  uploadedBy?: string;
}) {
  const where: Prisma.NoteWhereInput = {};

  if (filters?.courseId) where.courseId = filters.courseId;
  if (filters?.subject) where.subject = filters.subject;
  if (filters?.uploadedBy) where.uploadedBy = filters.uploadedBy;

  return prisma.note.findMany({
    where,
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          role: true,
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
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createNote(data: {
  title: string;
  subject: string;
  topic?: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  uploadedBy: string;
  courseId?: string;
}) {
  return prisma.note.create({
    data,
    include: {
      uploader: true,
    },
  });
}