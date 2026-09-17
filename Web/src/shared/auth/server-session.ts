import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from "./session";
import { hasPermission, type PermissionRequirement } from "./permissions";

export const getServerSession = async () => {
  const cookieStore = await cookies();
  return verifyAccessToken(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value);
};

export const serverCan = async (requirement: PermissionRequirement) => {
  const session = await getServerSession();
  return session ? hasPermission(session.permissions, requirement) : false;
};
