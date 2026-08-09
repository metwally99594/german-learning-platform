import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabasePlaceholderConfig } from "@/lib/supabase/config";
import { Shell } from "@/components/layout/shell";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isSupabasePlaceholderConfig()) {
    if (process.env.NODE_ENV === "production") {
      redirect("/login");
    }
    // Allow the app to render locally during Phase 1 before real Supabase credentials are configured.
    return <Shell>{children}</Shell>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <Shell>{children}</Shell>;
}
