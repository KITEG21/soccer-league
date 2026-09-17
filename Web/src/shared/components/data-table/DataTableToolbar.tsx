import { Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { DebouncedInput } from "./DebouncedInput";
import { FilterField } from "./FilterField";
import { filterParamKeys, type ListQueryState } from "./list-query";

interface DataTableToolbarProps {
  readonly query: ListQueryState;
  readonly searchPlaceholder?: string;
  readonly searchable?: boolean;
}

export const DataTableToolbar = ({
  query,
  searchPlaceholder = "Buscar…",
  searchable = true,
}: DataTableToolbarProps) => {
  const quickFilters = query.filters.filter((filter) => !filter.advanced);
  const advancedFilters = query.filters.filter((filter) => filter.advanced);
  const advancedKeys = new Set(advancedFilters.flatMap(filterParamKeys));
  const activeAdvancedCount = query.activeFilters.filter((filter) =>
    advancedKeys.has(filter.paramKey),
  ).length;
  const hasActiveCriteria = query.activeFilters.length > 0 || query.search.trim() !== "";

  if (!searchable && query.filters.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {searchable && (
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <DebouncedInput
              type="search"
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="pl-9"
              value={query.search}
              onValueChange={query.setSearch}
            />
          </div>
        )}

        {quickFilters.map((filter) => (
          <FilterField key={filter.key} filter={filter} query={query} />
        ))}

        {advancedFilters.length > 0 && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="size-4" />
                Filtros avanzados
                {activeAdvancedCount > 0 && (
                  <Badge className="ml-1 h-5 min-w-5 justify-center px-1.5 tabular-nums">
                    {activeAdvancedCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col gap-0 sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>Filtros avanzados</SheetTitle>
                <SheetDescription>
                  Los resultados se actualizan automáticamente al cambiar un filtro.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-5 overflow-y-auto px-4 py-2">
                {advancedFilters.map((filter) => (
                  <FilterField key={filter.key} filter={filter} query={query} showLabel />
                ))}
              </div>
              <SheetFooter>
                <Button
                  variant="outline"
                  disabled={activeAdvancedCount === 0}
                  onClick={() =>
                    advancedFilters
                      .flatMap(filterParamKeys)
                      .forEach((key) => query.setFilter(key, ""))
                  }
                >
                  Limpiar filtros avanzados
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {hasActiveCriteria && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Filtros activos:</span>
          {query.search.trim() && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Búsqueda: {query.search}
              <button
                type="button"
                aria-label="Quitar búsqueda"
                className="rounded-sm p-0.5 hover:bg-background/60"
                onClick={() => query.setSearch("")}
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
          {query.activeFilters.map((filter) => (
            <Badge key={filter.paramKey} variant="secondary" className="gap-1 pr-1">
              {filter.label}: {filter.value}
              <button
                type="button"
                aria-label={`Quitar filtro ${filter.label}`}
                className="rounded-sm p-0.5 hover:bg-background/60"
                onClick={() => query.setFilter(filter.paramKey, "")}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={query.clearFilters}>
            Limpiar todo
          </Button>
        </div>
      )}
    </div>
  );
};
