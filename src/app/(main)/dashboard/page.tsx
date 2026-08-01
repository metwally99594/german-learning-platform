"use client";

import { motion } from "framer-motion";
import { BookOpen, Clock, Flame, GraduationCap } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const stats = [
  { title: "Current Level", value: "A2", description: "Elementary German", trend: "up" as const, icon: GraduationCap },
  { title: "Lessons Completed", value: "24", description: "+3 this week", trend: "up" as const, icon: BookOpen },
  { title: "Vocabulary Learned", value: "342", description: "+28 new words", trend: "up" as const, icon: BookOpen },
  { title: "Study Streak", value: "12 days", description: "Keep it going!", trend: "neutral" as const, icon: Flame },
];

const recentLessons = [
  { title: "Introducing yourself", progress: 100, duration: "15 min" },
  { title: "Articles: der, die, das", progress: 80, duration: "20 min" },
  { title: "Common verbs in present tense", progress: 45, duration: "25 min" },
  { title: "Numbers and dates", progress: 0, duration: "18 min" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and pick up where you left off.</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              description={stat.description}
              trend={stat.trend}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/50 bg-card/70 backdrop-blur-md lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Lessons</CardTitle>
            <CardDescription>Continue your CEFR learning path.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {recentLessons.map((lesson) => (
              <div key={lesson.title} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{lesson.title}</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {lesson.duration}
                  </span>
                </div>
                <Progress value={lesson.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Weekly Goal</CardTitle>
            <CardDescription>You are on track this week.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Study time</span>
              <span className="font-semibold">3.5 / 5 hrs</span>
            </div>
            <Progress value={70} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span>Lessons</span>
              <span className="font-semibold">8 / 10</span>
            </div>
            <Progress value={80} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span>Flashcards</span>
              <span className="font-semibold">45 / 60</span>
            </div>
            <Progress value={75} className="h-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
