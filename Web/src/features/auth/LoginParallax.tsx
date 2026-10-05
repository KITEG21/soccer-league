"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

interface LoginParallaxProps {
  readonly children: ReactNode;
}

export const LoginParallax = ({ children }: LoginParallaxProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const updateParallax = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

    containerRef.current?.style.setProperty("--pointer-x", x.toFixed(3));
    containerRef.current?.style.setProperty("--pointer-y", y.toFixed(3));
    containerRef.current?.style.setProperty("--gradient-x", `${x * 2.5}%`);
    containerRef.current?.style.setProperty("--gradient-y", `${y * 2.5}%`);
  };

  const resetParallax = () => {
    containerRef.current?.style.setProperty("--pointer-x", "0");
    containerRef.current?.style.setProperty("--pointer-y", "0");
    containerRef.current?.style.setProperty("--gradient-x", "0%");
    containerRef.current?.style.setProperty("--gradient-y", "0%");
  };

  return (
    <div
      ref={containerRef}
      className="login-background relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/40 p-4"
      onPointerMove={updateParallax}
      onPointerLeave={resetParallax}
    >
      {children}
    </div>
  );
};
