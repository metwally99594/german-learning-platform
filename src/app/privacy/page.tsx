import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How DeutschLernen handles your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This is placeholder content for the Phase 1 build — it will be replaced with a real
          policy before launch.
        </p>
      </div>

      <div className="space-y-4 text-sm text-muted-foreground">
        <section className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">What we collect</h2>
          <p>
            We store your account email, learning progress (completed lessons, quiz scores,
            flashcard review history, speaking practice), and preferences (theme, language). We do
            not store audio recordings made during speaking practice — they stay in your browser
            for the duration of the session only.
          </p>
        </section>
        <section className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">How we use it</h2>
          <p>Solely to run the app: showing your progress, personalising review schedules, and authenticating you.</p>
        </section>
        <section className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">Third parties</h2>
          <p>Authentication is handled by Supabase. We don&apos;t sell or share your data with anyone else.</p>
        </section>
        <section className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">Contact</h2>
          <p>
            Questions about your data? Reach out via the{" "}
            <a href="/contact" className="text-primary underline underline-offset-4">
              contact page
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
