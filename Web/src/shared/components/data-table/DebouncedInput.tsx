import { useState, type ComponentProps } from "react";
import { Input } from "@/shared/components/ui/input";
import { useDebouncedCallback } from "@/shared/hooks/use-debounced-callback";

export const SEARCH_DEBOUNCE_MS = 400;

interface DebouncedInputProps
  extends Omit<ComponentProps<typeof Input>, "value" | "onChange"> {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly delay?: number;
}

export const DebouncedInput = ({
  value,
  onValueChange,
  delay = SEARCH_DEBOUNCE_MS,
  ...props
}: DebouncedInputProps) => {
  const [draft, setDraft] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const commit = useDebouncedCallback(onValueChange, delay);

  if (value !== syncedValue) {
    setSyncedValue(value);
    setDraft(value);
  }

  return (
    <Input
      {...props}
      value={draft}
      onChange={(event) => {
        setDraft(event.target.value);
        commit(event.target.value);
      }}
    />
  );
};
