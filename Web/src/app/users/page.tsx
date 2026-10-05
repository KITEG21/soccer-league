import type { Metadata } from "next";
import { UserContainer } from "@/features/users";
import { serverCan } from "@/shared/auth/server-session";
import { AccessDenied } from "@/shared/components/AccessDenied";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Users", description: "Manage application users and access roles." },
    es: { title: "Usuarios", description: "Gestiona los usuarios y roles de acceso de la aplicación." },
  });
}

export default async function Page() {
  if (!(await serverCan("users:read"))) {
    return <AccessDenied message="No tienes permisos para gestionar usuarios." />;
  }

  return <UserContainer />;
}
