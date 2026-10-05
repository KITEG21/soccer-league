"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { loginAction, type LoginState } from "./actions/login";

const initialState: LoginState = { error: null, email: "" };

export const LoginForm = () => {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations("Auth");

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" name="email" type="email" placeholder={t("emailPlaceholder")} autoComplete="username" defaultValue={state.email} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("password")}</Label>
        <div className="relative">
          <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder={t("passwordPlaceholder")} autoComplete="current-password" className="pr-10" required />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? t("hidePassword") : t("showPassword")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      {state.error && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>{isPending ? t("signingIn") : t("signIn")}</Button>
    </form>
  );
};
