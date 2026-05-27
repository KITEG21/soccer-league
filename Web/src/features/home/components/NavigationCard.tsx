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
      className="group relative bg-card hover:bg-accent/30 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 border border-border"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <Icon className="w-12 h-12 text-primary" />
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm grow">{description}</p>
      </div>
    </Link>
  );
};
