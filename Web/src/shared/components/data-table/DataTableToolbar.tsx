import { FilterX, Search, X } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { AdvancedFiltersDialog } from "./AdvancedFiltersDialog";
import { DebouncedInput } from "./DebouncedInput";
import { FilterField } from "./FilterField";
import type { ListQueryState } from "./list-query";

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
  const hasActiveCriteria = query.activeFilters.length > 0 || query.search.trim() !== "";

  if (!searchable && query.filters.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex w-full flex-col gap-2 md:flex-row md:items-center">
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
          {searchable && (
            <div className="relative min-w-0">
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
            <FilterField
              key={filter.key}
              filter={filter}
              values={query.filterValues}
              onChange={query.setFilter}
              debounced
              className={filter.type.endsWith("range") ? "sm:col-span-2" : undefined}
            />
          ))}
        </div>

        {advancedFilters.length > 0 && (
          <div className="flex shrink-0 justify-end md:ml-auto">
            <AdvancedFiltersDialog query={query} filters={advancedFilters} />
          </div>
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
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 gap-1.5 px-2"
            onClick={query.clearFilters}
          >
            <FilterX className="size-3.5" />
            Limpiar todo
          </Button>
        </div>
      )}
    </div>
  );
};
