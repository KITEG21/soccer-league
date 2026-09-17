import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { DebouncedInput } from "./DebouncedInput";
import {
  BOOLEAN_OPTIONS,
  filterParamKeys,
  type FilterDefinition,
  type ListQueryState,
} from "./list-query";

const ALL_VALUE = "__all__";

interface FilterFieldProps {
  readonly filter: FilterDefinition;
  readonly query: ListQueryState;
  readonly showLabel?: boolean;
}

export const FilterField = ({ filter, query, showLabel = false }: FilterFieldProps) => {
  const [firstKey, secondKey] = filterParamKeys(filter);
  const inputId = `filter-${filter.key}`;

  const renderControl = () => {
    switch (filter.type) {
      case "select":
      case "boolean": {
        const options = filter.type === "boolean" ? BOOLEAN_OPTIONS : filter.options ?? [];
        return (
          <Select
            value={query.filterValues[firstKey] || ALL_VALUE}
            onValueChange={(value) =>
              query.setFilter(firstKey, value === ALL_VALUE ? "" : value)
            }
          >
            <SelectTrigger id={inputId} className="w-full sm:w-44" aria-label={filter.label}>
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>
                {showLabel ? "Todos" : `${filter.label}: todos`}
              </SelectItem>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      case "number-range":
        return (
          <div className="flex items-center gap-2">
            <DebouncedInput
              id={inputId}
              type="number"
              inputMode="numeric"
              placeholder="Mín."
              aria-label={`${filter.label} mínimo`}
              className="w-full sm:w-24"
              value={query.filterValues[firstKey]}
              onValueChange={(value) => query.setFilter(firstKey, value)}
            />
            <span className="text-muted-foreground">–</span>
            <DebouncedInput
              type="number"
              inputMode="numeric"
              placeholder="Máx."
              aria-label={`${filter.label} máximo`}
              className="w-full sm:w-24"
              value={query.filterValues[secondKey]}
              onValueChange={(value) => query.setFilter(secondKey, value)}
            />
          </div>
        );
      case "date-range":
        return (
          <div className="flex items-center gap-2">
            <Input
              id={inputId}
              type="date"
              aria-label={`${filter.label} desde`}
              className="w-full sm:w-40"
              value={query.filterValues[firstKey]}
              max={query.filterValues[secondKey] || undefined}
              onChange={(event) => query.setFilter(firstKey, event.target.value)}
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="date"
              aria-label={`${filter.label} hasta`}
              className="w-full sm:w-40"
              value={query.filterValues[secondKey]}
              min={query.filterValues[firstKey] || undefined}
              onChange={(event) => query.setFilter(secondKey, event.target.value)}
            />
          </div>
        );
      default:
        return (
          <DebouncedInput
            id={inputId}
            placeholder={filter.placeholder ?? filter.label}
            aria-label={filter.label}
            className="w-full sm:w-44"
            value={query.filterValues[firstKey]}
            onValueChange={(value) => query.setFilter(firstKey, value)}
          />
        );
    }
  };

  if (!showLabel) return renderControl();

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{filter.label}</Label>
      {renderControl()}
    </div>
  );
};
