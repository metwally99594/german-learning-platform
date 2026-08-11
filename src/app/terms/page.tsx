import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using DeutschLernen.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This is placeholder content for the Phase 1 build — it will be replaced with real terms
          before launch.
        </p>
      </div>

      <div className="space-y-4 text-sm text-muted-foreground">
        <section className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">Using the app</h2>
          <p>
            DeutschLernen is provided for personal, non-commercial German-learning use. Content
            (lessons, exercises, model answers) is for study purposes and shouldn&apos;t be
            redistributed.
          </p>
        </section>
        <section className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">Your account</h2>
          <p>Keep your login credentials private. You&apos;re responsible for activity on your account.</p>
        </section>
        <section className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">No warranty</h2>
          <p>
            The app is provided &quot;as is&quot; during this early phase — features may change or
            be temporarily unavailable.
          </p>
        </section>
        <section className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">Contact</h2>
          <p>
            Questions about these terms? Reach out via the{" "}
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
