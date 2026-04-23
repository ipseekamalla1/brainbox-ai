// src/services/activity.service.ts — Activity Tracking

import prisma from "@/lib/prisma";

// ─── Log Activity ───────────────────────────────────

export type ActivityType =
  | "QUIZ_COMPLETED"
  | "EXAM_COMPLETED"
  | "NOTE_VIEWED"
  | "VIDEO_WATCHED"
  | "AI_CHAT"
  | "FLASHCARD_SESSION"
  | "LOGIN";

export async function logActivity(
  userId: string,
  type: ActivityType,
  metadata?: { title?: string; score?: number; duration?: number; entityId?: string }
) {
  return prisma.activity.create({
    data: {
      userId,
      type,
      title: metadata?.title,
      score: metadata?.score,
      duration: metadata?.duration,
      entityId: metadata?.entityId,
    },
  });
}

// ─── Get User Activity ──────────────────────────────

export async function getUserActivity(userId: string, limit = 30) {
  return prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// ─── Get Streak Data ────────────────────────────────

export async function getUserStreak(userId: string) {
  const activities = await prisma.activity.findMany({
    where: { userId },
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  if (activities.length === 0) return { currentStreak: 0, longestStreak: 0, totalDays: 0, heatmap: [] };

  // Get unique active dates
  const activeDates = new Set<string>();
  activities.forEach((a) => {
    activeDates.add(a.createdAt.toISOString().split("T")[0]);
  });

  const sortedDates = [...activeDates].sort().reverse();

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (sortedDates[0] === today || sortedDates[0] === yesterday) {
    for (let i = 0; i < sortedDates.length; i++) {
      const expected = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
      if (sortedDates.includes(expected)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  const allDates = [...activeDates].sort();
  for (let i = 1; i < allDates.length; i++) {
    const prev = new Date(allDates[i - 1]);
    const curr = new Date(allDates[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Heatmap data (last 90 days)
  const heatmap: { date: string; count: number }[] = [];
  for (let i = 89; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
    const count = activities.filter((a) => a.createdAt.toISOString().split("T")[0] === date).length;
    heatmap.push({ date, count });
  }

  return {
    currentStreak,
    longestStreak,
    totalDays: activeDates.size,
    heatmap,
  };
}