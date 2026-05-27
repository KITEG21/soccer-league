import type { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface AppLayoutProps {
  readonly children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-background transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto py-8 px-6">{children}</main>
    </div>
  );
};
