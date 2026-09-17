import type { ComponentProps } from "react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/utils/utils";
import { DebouncedInput } from "./DebouncedInput";
import { BOOLEAN_OPTIONS, filterParamKeys, type FilterDefinition } from "./list-query";

const ALL_VALUE = "__all__";

interface FilterFieldProps {
  readonly filter: FilterDefinition;
  readonly values: Record<string, string>;
  readonly onChange: (paramKey: string, value: string) => void;
  readonly debounced?: boolean;
  readonly showLabel?: boolean;
  readonly className?: string;
}

export const FilterField = ({
  filter,
  values,
  onChange,
  debounced = false,
  showLabel = false,
  className,
}: FilterFieldProps) => {
  const [firstKey, secondKey] = filterParamKeys(filter);
  const inputId = `filter-${filter.key}${showLabel ? "-advanced" : ""}`;

  const renderTextInput = ({
    paramKey,
    ...props
  }: Omit<ComponentProps<typeof Input>, "value" | "onChange"> & { readonly paramKey: string }) =>
    debounced ? (
      <DebouncedInput
        {...props}
        value={values[paramKey] ?? ""}
        onValueChange={(value) => onChange(paramKey, value)}
      />
    ) : (
      <Input
        {...props}
        value={values[paramKey] ?? ""}
        onChange={(event) => onChange(paramKey, event.target.value)}
      />
    );

  const renderControl = () => {
    switch (filter.type) {
      case "select":
      case "boolean": {
        const options = filter.type === "boolean" ? BOOLEAN_OPTIONS : filter.options ?? [];
        return (
          <Select
            value={values[firstKey] || ALL_VALUE}
            onValueChange={(value) => onChange(firstKey, value === ALL_VALUE ? "" : value)}
          >
            <SelectTrigger id={inputId} className="w-full" aria-label={filter.label}>
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
          <div className="flex w-full items-center gap-2">
            {renderTextInput({
              paramKey: firstKey,
              id: inputId,
              type: "number",
              inputMode: "numeric",
              placeholder: showLabel ? "Mín." : `${filter.label} mín.`,
              "aria-label": `${filter.label} mínimo`,
            })}
            <span className="text-muted-foreground">–</span>
            {renderTextInput({
              paramKey: secondKey,
              type: "number",
              inputMode: "numeric",
              placeholder: showLabel ? "Máx." : `${filter.label} máx.`,
              "aria-label": `${filter.label} máximo`,
            })}
          </div>
        );
      case "date-range":
        return (
          <div className="flex w-full items-center gap-2">
            <Input
              id={inputId}
              type="date"
              aria-label={`${filter.label} desde`}
              value={values[firstKey] ?? ""}
              max={values[secondKey] || undefined}
              onChange={(event) => onChange(firstKey, event.target.value)}
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="date"
              aria-label={`${filter.label} hasta`}
              value={values[secondKey] ?? ""}
              min={values[firstKey] || undefined}
              onChange={(event) => onChange(secondKey, event.target.value)}
            />
          </div>
        );
      default:
        return renderTextInput({
          paramKey: firstKey,
          id: inputId,
          placeholder: filter.placeholder ?? filter.label,
          "aria-label": filter.label,
        });
    }
  };

  if (!showLabel) return <div className={cn("min-w-0", className)}>{renderControl()}</div>;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={inputId}>{filter.label}</Label>
      {renderControl()}
    </div>
  );
};
