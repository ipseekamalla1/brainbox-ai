// src/services/video.service.ts — Video Business Logic

import prisma from "@/lib/prisma";

export async function getVideos(filters?: {
  courseId?: string;
  uploadedBy?: string;
}) {
  return prisma.video.findMany({
    where: {
      ...(filters?.courseId && { courseId: filters.courseId }),
      ...(filters?.uploadedBy && { uploadedBy: filters.uploadedBy }),
    },
    include: {
      uploader: { select: { id: true, name: true, role: true } },
      course: { select: { id: true, title: true, code: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVideosWithProgress(userId: string, courseId?: string) {
  const videos = await prisma.video.findMany({
    where: courseId ? { courseId } : {},
    include: {
      uploader: { select: { id: true, name: true } },
      course: { select: { id: true, title: true, code: true } },
      progress: {
        where: { userId },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return videos.map((v) => ({
    ...v,
    progress: v.progress[0] || null,
  }));
}

export async function getVideoById(id: string, userId?: string) {
  const video = await prisma.video.findUnique({
    where: { id },
    include: {
      uploader: { select: { id: true, name: true } },
      course: { select: { id: true, title: true } },
      progress: userId ? { where: { userId }, take: 1 } : false,
    },
  });

  if (!video) return null;

  return {
    ...video,
    progress: userId && Array.isArray(video.progress) ? video.progress[0] || null : null,
  };
}

export async function createVideo(data: {
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  uploadedBy: string;
  courseId?: string;
}) {
  return prisma.video.create({
    data,
    include: {
      uploader: { select: { id: true, name: true } },
    },
  });
}

export async function updateVideoProgress(
  userId: string,
  videoId: string,
  watchedSeconds: number,
  duration?: number
) {
  const completed = duration ? watchedSeconds >= duration * 0.9 : false;

  return prisma.videoProgress.upsert({
    where: {
      userId_videoId: { userId, videoId },
    },
    update: {
      watchedSeconds,
      completed,
      lastWatchedAt: new Date(),
    },
    create: {
      userId,
      videoId,
      watchedSeconds,
      completed,
    },
  });
}

export async function deleteVideo(id: string) {
  return prisma.video.delete({ where: { id } });
}