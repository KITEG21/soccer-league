import type { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface AppLayoutProps {
  readonly children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};
