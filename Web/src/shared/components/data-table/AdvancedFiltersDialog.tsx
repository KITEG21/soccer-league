import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { FilterField } from "./FilterField";
import { filterParamKeys, type FilterDefinition, type ListQueryState } from "./list-query";

interface AdvancedFiltersDialogProps {
  readonly query: ListQueryState;
  readonly filters: readonly FilterDefinition[];
}

export const AdvancedFiltersDialog = ({ query, filters }: AdvancedFiltersDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const paramKeys = filters.flatMap(filterParamKeys);
  const activeCount = paramKeys.filter((key) => query.filterValues[key]).length;
  const hasDraftFilters = paramKeys.some((key) => draft[key]);

  const open = () => {
    setDraft(Object.fromEntries(paramKeys.map((key) => [key, query.filterValues[key] ?? ""])));
    setIsOpen(true);
  };

  const apply = () => {
    query.setFilters(draft);
    setIsOpen(false);
  };

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={open}>
        <SlidersHorizontal className="size-4" />
        Avanzados
        {activeCount > 0 && (
          <Badge className="h-5 min-w-5 justify-center px-1.5 tabular-nums">{activeCount}</Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Filtros avanzados</DialogTitle>
            <DialogDescription>
              Los cambios se aplican al pulsar &quot;Aceptar&quot;.
            </DialogDescription>
          </DialogHeader>

          <div className="-mx-2 grid max-h-[60vh] gap-5 overflow-y-auto px-2 py-2">
            {filters.map((filter) => (
              <FilterField
                key={filter.key}
                filter={filter}
                values={draft}
                onChange={(paramKey, value) =>
                  setDraft((current) => ({ ...current, [paramKey]: value }))
                }
                showLabel
              />
            ))}
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            {hasDraftFilters && (
              <Button
                variant="ghost"
                className="sm:mr-auto"
                onClick={() => setDraft(Object.fromEntries(paramKeys.map((key) => [key, ""])))}
              >
                Limpiar
              </Button>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={apply}>Aceptar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
