import type { Metadata } from "next";
import { UserContainer } from "@/features/users";
import { serverCan } from "@/shared/auth/server-session";
import { AccessDenied } from "@/shared/components/AccessDenied";

export const metadata: Metadata = { title: "Usuarios" };

export default async function Page() {
  if (!(await serverCan("users:read"))) {
    return <AccessDenied message="No tienes permisos para gestionar usuarios." />;
  }

  return <UserContainer />;
}
