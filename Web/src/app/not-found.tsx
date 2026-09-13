import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-6xl font-black tracking-tighter text-primary">404</p>
      <h1 className="text-2xl font-bold text-foreground">Página no encontrada</h1>
      <p className="text-muted-foreground max-w-md">
        La página que buscas no existe o fue movida.
      </p>
      <Button asChild className="mt-2">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
