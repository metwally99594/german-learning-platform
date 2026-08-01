import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">This page could not be found.</p>
      <Button asChild className="mt-8">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
