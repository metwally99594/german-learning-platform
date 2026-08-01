"use client";

import { logout } from "@/server/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="ghost" className="w-full justify-start gap-2">
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    </form>
  );
}
