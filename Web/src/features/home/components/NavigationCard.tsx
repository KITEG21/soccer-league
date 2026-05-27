import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface NavigationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
}

export const NavigationCard = ({
  icon: Icon,
  title,
  description,
  to,
}: NavigationCardProps) => {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden bg-card hover:bg-accent/5 rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 border border-border/50"
    >
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <Icon className="w-8 h-8 transition-transform duration-500 group-hover:rotate-12" />
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed grow">{description}</p>
      </div>
    </Link>
  );
};
