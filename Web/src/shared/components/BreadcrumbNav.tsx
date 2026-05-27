import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { Home, type LucideIcon } from "lucide-react";
import React from "react";

interface BreadcrumbItemType {
  label: string;
  to?: string;
  icon?: LucideIcon;
}

interface BreadcrumbNavProps {
  readonly items?: BreadcrumbItemType[];
}

export const BreadcrumbNav = ({ items = [] }: BreadcrumbNavProps) => {
  const allItems: BreadcrumbItemType[] = [
    { label: "Inicio", to: "/", icon: Home },
    ...items,
  ];

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          
          return (
            <React.Fragment key={item.label}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-1">
                    {item.icon && <item.icon size={14} />}
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className="flex items-center gap-1">
                    <Link to={item.to || "#"}>
                      {item.icon && <item.icon size={14} />}
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
