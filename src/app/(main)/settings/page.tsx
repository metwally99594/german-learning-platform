import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LocaleToggle } from "@/components/locale/locale-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { getUser } from "@/server/actions/auth-actions";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account and preferences.",
};

export default async function SettingsPage() {
  let user: Awaited<ReturnType<typeof getUser>> = null;
  try {
    user = await getUser();
  } catch {
    // Supabase credentials are not configured yet; render in signed-out state.
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Card className="border-border/50 bg-card/70 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>{user ? user.email : "Not signed in"}</CardDescription>
        </CardHeader>
        {user && (
          <CardContent>
            <LogoutButton />
          </CardContent>
        )}
      </Card>

      <Card className="border-border/50 bg-card/70 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
          <CardDescription>Theme and language.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Language</span>
            <LocaleToggle />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
