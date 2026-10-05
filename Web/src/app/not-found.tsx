import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Page not found", description: "The requested page could not be found." },
    es: { title: "Página no encontrada", description: "No se encontró la página solicitada." },
  });
}

export default function NotFound() {
  const t = useTranslations("Common");
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-6xl font-black tracking-tighter text-primary">404</p>
      <h1 className="text-2xl font-bold text-foreground">{t("notFound")}</h1>
      <p className="text-muted-foreground max-w-md">
        {t("notFoundDescription")}
      </p>
      <Button asChild className="mt-2">
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </div>
  );
}
