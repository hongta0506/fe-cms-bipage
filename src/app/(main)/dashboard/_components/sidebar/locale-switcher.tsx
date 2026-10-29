"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/providers/locale-provider";

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();
  return (
    <fieldset className="flex items-center rounded-md border p-0.5" aria-label="Language">
      {(["vi", "en"] as const).map((value) => (
        <Button
          key={value}
          type="button"
          size="sm"
          variant={locale === value ? "secondary" : "ghost"}
          className="h-7 px-2 text-xs"
          onClick={() => setLocale(value)}
          aria-pressed={locale === value}
        >
          {value.toUpperCase()}
        </Button>
      ))}
    </fieldset>
  );
}
