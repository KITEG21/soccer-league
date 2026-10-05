"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { type Locale, localeCookieName } from "@/i18n/config";

interface LanguageToggleProps {
  readonly compact?: boolean;
  readonly showTooltip?: boolean;
}

export const LanguageToggle = ({
  compact = false,
  showTooltip = false,
}: LanguageToggleProps) => {
  const locale = useLocale() as Locale;
  const t = useTranslations("Language");
  const nextLocale: Locale = locale === "es" ? "en" : "es";

  const changeLocale = () => {
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  };

  const label = `${t("label")}: ${locale === "en" ? t("english") : t("spanish")}`;
  const button = (
    <Button
      variant="ghost"
      size={compact ? "icon" : "sm"}
      onClick={changeLocale}
      aria-label={label}
    >
      <Languages className={compact ? "size-4" : "mr-2 size-4"} />
      {!compact && (locale === "en" ? "EN" : "ES")}
    </Button>
  );

  if (!showTooltip) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};
