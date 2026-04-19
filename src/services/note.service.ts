// src/services/note.service.ts — Notes Business Logic

import prisma from "@/lib/prisma";

export async function getNotes(filters?: {
  courseId?: string;
  subject?: string;
  uploadedBy?: string;
}) {
  return prisma.note.findMany({
    where: {
      ...(filters?.courseId && { courseId: filters.courseId }),
      ...(filters?.subject && { subject: filters.subject }),
      ...(filters?.uploadedBy && { uploadedBy: filters.uploadedBy }),
    },
    include: {
      uploader: { select: { id: true, name: true, role: true } },
      course: { select: { id: true, title: true, code: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getNoteById(id: string) {
  return prisma.note.findUnique({
    where: { id },
    include: {
      uploader: { select: { id: true, name: true, role: true } },
      course: { select: { id: true, title: true, code: true } },
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
      uploader: { select: { id: true, name: true, role: true } },
    },
  });
}

export async function updateNoteSummary(noteId: string, summary: string) {
  return prisma.note.update({
    where: { id: noteId },
    data: { summary },
  });
}

export async function deleteNote(id: string) {
  return prisma.note.delete({ where: { id } });
}