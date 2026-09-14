import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/shared/utils";

interface AppLinkProps {
  readonly href: string;
  readonly className?: string;
  readonly children: ReactNode;
}

export const AppLink = ({ href, className, children }: AppLinkProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "relative z-10 rounded-sm underline-offset-4 transition-colors",
        "hover:text-primary hover:underline",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {children}
    </Link>
  );
};
