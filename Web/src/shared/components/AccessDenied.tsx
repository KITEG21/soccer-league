import Link from "next/link";
import { useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

interface AccessDeniedProps {
  readonly message?: string;
}

export const AccessDenied = ({
  message,
}: AccessDeniedProps) => (
  <AccessDeniedContent message={message} />
);

const AccessDeniedContent = ({ message }: AccessDeniedProps) => {
  const t = useTranslations("Common");
  return (
  <Card>
    <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
      <ShieldAlert className="size-10 text-muted-foreground" />
      <p className="font-medium">{t("accessDenied")}</p>
      <p className="text-sm text-muted-foreground">{message ?? t("accessDenied")}</p>
      <Button asChild variant="outline" className="mt-2">
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </CardContent>
  </Card>
  );
};
