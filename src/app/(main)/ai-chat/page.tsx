import { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "AI Chat",
  description: "Practise German with an AI conversation partner.",
};

export default function AiChatPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Card className="border-border/50 bg-card/70 backdrop-blur-md">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">AI Chat is coming soon</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Free-form conversation practice with an AI partner is planned but not connected yet —
            this feature needs an AI provider configured on the server. Check back soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
