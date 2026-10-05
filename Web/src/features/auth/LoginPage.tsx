import { Trophy } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LanguageToggle } from "@/shared/components/LanguageToggle";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { LoginBackground } from "./LoginBackground";
import { LoginForm } from "./LoginForm";
import { LoginParallax } from "./LoginParallax";

export const LoginPage = async () => {
  const t = await getTranslations("Auth");

  return (
    <TooltipProvider delayDuration={300}>
      <LoginParallax>
        <LoginBackground />
        <Card className="login-card relative z-10 w-full max-w-sm border-white/30 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur-sm dark:border-white/10">
          <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-45 transition-opacity hover:opacity-100 focus-within:opacity-100">
            <LanguageToggle compact showTooltip />
            <ThemeToggle showTooltip />
          </div>
          <CardHeader className="items-center space-y-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Trophy className="size-6" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl">SoccerLeague</CardTitle>
              <CardDescription>{t("adminPanel")}</CardDescription>
            </div>
          </CardHeader>

          <CardContent><LoginForm /></CardContent>
        </Card>
      </LoginParallax>
    </TooltipProvider>
  );
};
