"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { type Locale, localeCookieName } from "@/i18n/config";

export const LanguageToggle = () => {
  const locale = useLocale() as Locale;
  const t = useTranslations("Language");
  const nextLocale: Locale = locale === "es" ? "en" : "es";

  const changeLocale = () => {
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={changeLocale}
      aria-label={`${t("label")}: ${nextLocale === "en" ? t("english") : t("spanish")}`}
    >
      <Languages className="mr-2 size-4" />
      {locale === "en" ? "EN" : "ES"}
    </Button>
  );
};
