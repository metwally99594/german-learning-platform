"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "./locale-provider";

export function LocaleToggle() {
  const { locale, toggleLocale } = useLocale();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={toggleLocale}
      aria-label="Toggle language"
    >
      <Languages className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">{locale === "en" ? "Switch to Arabic" : "Switch to English"}</span>
    </Button>
  );
}
