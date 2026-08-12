import { Metadata } from "next";
import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about DeutschLernen.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold">Contact</h1>
        <p className="mt-1 text-muted-foreground">
          Questions, bug reports, or feedback about DeutschLernen — we&apos;d like to hear it.
        </p>
      </div>

      <Card className="border-border/50 bg-card/70 backdrop-blur-md">
        <CardContent className="flex items-center gap-3 py-6">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <a
            href="mailto:support@deutschlernen.example"
            className="text-primary underline underline-offset-4"
          >
            support@deutschlernen.example
          </a>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        This is a placeholder address for the Phase 1 build — an in-app contact form is planned for
        a later release.
      </p>
    </div>
  );
}
