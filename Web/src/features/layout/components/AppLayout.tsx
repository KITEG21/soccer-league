import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "@/shared/components/Footer";

interface AppLayoutProps {
  readonly children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto py-8 px-6 flex-grow">{children}</main>
      <Footer />
    </div>
  );
};
