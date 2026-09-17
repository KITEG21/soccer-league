import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

interface AccessDeniedProps {
  readonly message?: string;
}

export const AccessDenied = ({
  message = "No tienes permisos para acceder a esta sección.",
}: AccessDeniedProps) => (
  <Card>
    <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
      <ShieldAlert className="size-10 text-muted-foreground" />
      <p className="font-medium">Acceso denegado</p>
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button asChild variant="outline" className="mt-2">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </CardContent>
  </Card>
);
