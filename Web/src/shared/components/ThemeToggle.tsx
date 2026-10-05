"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useTheme } from "@/shared/contexts/ThemeContext";

interface ThemeToggleProps {
  readonly showTooltip?: boolean;
}

export const ThemeToggle = ({ showTooltip = false }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations("Header");
  const label = theme === "dark" ? t("switchToLight") : t("switchToDark");

  const button = (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={label}
    >
      <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
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
