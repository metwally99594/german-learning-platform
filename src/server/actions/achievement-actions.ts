"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth/session";
import { Achievement } from "@prisma/client";

export type AchievementWithStatus = Achievement & { earned: boolean; awardedAt: Date | null };

export async function getAchievements(): Promise<AchievementWithStatus[]> {
  let userId: string | null;
  try {
    userId = await requireUserId();
  } catch {
    userId = null;
  }

  try {
    const achievements = await prisma.achievement.findMany({ orderBy: { points: "desc" } });

    if (!userId) {
      return achievements.map((achievement) => ({ ...achievement, earned: false, awardedAt: null }));
    }

    const earned = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true, awardedAt: true },
    });
    const earnedMap = new Map(earned.map((e) => [e.achievementId, e.awardedAt]));

    return achievements.map((achievement) => ({
      ...achievement,
      earned: earnedMap.has(achievement.id),
      awardedAt: earnedMap.get(achievement.id) ?? null,
    }));
  } catch {
    return [];
  }
}
