import type { SVGProps } from "react";
import { cn } from "@/shared/utils";

export const SoccerLeagueMark = ({
  className,
  ...props
}: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 120"
    fill="none"
    aria-hidden="true"
    focusable="false"
    className={cn("shrink-0 text-primary", className)}
    {...props}
  >
    <path
      fill="currentColor"
      d="M50 2 98 20v34c0 28-17 49-48 64C19 103 2 82 2 54V20L50 2Z"
    />
    <g fill="#fff">
      <path d="M36 27Q50 20 64 27L59 38H41L36 27Z" />
      <path d="m41 50 18 0 7 20-16 12-16-12 7-20Z" />
      <path d="m26 35 7 9-5 21-13-2q-1-15 11-28Z" />
      <path d="m74 35-7 9 5 21 13-2q1-15-11-28Z" />
      <path d="m23 77 19 12-1 11Q25 94 19 81l4-4Z" />
      <path d="M77 77 58 89l1 11q16-6 22-19l-4-4Z" />
    </g>
  </svg>
);

export const SoccerLeagueWordmark = ({
  className,
}: {
  readonly className?: string;
}) => (
  <span
    className={cn(
      "font-bold tracking-tight text-foreground dark:text-white",
      className,
    )}
  >
    Soccer<span className="text-primary dark:text-white">League</span>
  </span>
);
