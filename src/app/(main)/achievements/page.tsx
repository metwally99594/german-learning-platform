import { Metadata } from "next";
import { Trophy, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAchievements } from "@/server/actions/achievement-actions";

export const metadata: Metadata = {
  title: "Achievements",
  description: "Badges you've earned on your German learning journey.",
};

export default async function AchievementsPage() {
  const achievements = await getAchievements();

  return (
    <div className="space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">Badges you unlock as you keep practising.</p>
      </div>

      {achievements.length === 0 ? (
        <p className="text-muted-foreground">No achievements are available yet. Check back soon.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={cn(
                "border-border/50 bg-card/70 backdrop-blur-md",
                !achievement.earned && "opacity-60"
              )}
            >
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    achievement.earned
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {achievement.earned ? <Trophy className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                </div>
                <div>
                  <CardTitle className="text-base">{achievement.title}</CardTitle>
                  <CardDescription>{achievement.points} points</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {achievement.description}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
