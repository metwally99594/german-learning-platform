import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/70 py-6 backdrop-blur-xl">
      <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} DeutschLernen. All rights reserved.
        </p>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
