import { useCallback, useMemo } from "react";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

export type FilterType =
  | "text"
  | "select"
  | "boolean"
  | "number-range"
  | "date-range";

export interface FilterOption {
  readonly value: string;
  readonly label: string;
}

export interface FilterDefinition {
  readonly key: string;
  readonly label: string;
  readonly type: FilterType;
  readonly options?: readonly FilterOption[];
  readonly placeholder?: string;
  readonly advanced?: boolean;
}

export interface ActiveFilter {
  readonly paramKey: string;
  readonly label: string;
  readonly value: string;
}

export type SortOrder = "asc" | "desc";

export type ListApiParams = Record<string, string | number | undefined>;

const SORT_ORDERS = ["asc", "desc"] as const;

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export const BOOLEAN_OPTIONS: readonly FilterOption[] = [
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

export const filterParamKeys = (filter: FilterDefinition): string[] => {
  switch (filter.type) {
    case "number-range":
      return [`${filter.key}_min`, `${filter.key}_max`];
    case "date-range":
      return [`${filter.key}_from`, `${filter.key}_to`];
    default:
      return [filter.key];
  }
};

const paramLabel = (filter: FilterDefinition, paramKey: string) => {
  if (paramKey.endsWith("_min")) return `${filter.label} mín.`;
  if (paramKey.endsWith("_max")) return `${filter.label} máx.`;
  if (paramKey.endsWith("_from")) return `${filter.label} desde`;
  if (paramKey.endsWith("_to")) return `${filter.label} hasta`;
  return filter.label;
};

const displayValue = (filter: FilterDefinition, value: string) => {
  const options = filter.type === "boolean" ? BOOLEAN_OPTIONS : filter.options;
  return options?.find((option) => option.value === value)?.label ?? value;
};

interface ListQueryConfig {
  readonly filters?: readonly FilterDefinition[];
  readonly defaultPageSize?: number;
}

export const useListQuery = ({
  filters = [],
  defaultPageSize = 10,
}: ListQueryConfig) => {
  const filterKeys = useMemo(() => filters.flatMap(filterParamKeys), [filters]);

  const parsers = useMemo(
    () => ({
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(defaultPageSize),
      sort: parseAsString,
      order: parseAsStringLiteral(SORT_ORDERS),
      q: parseAsString.withDefault(""),
      ...Object.fromEntries(filterKeys.map((key) => [key, parseAsString])),
    }),
    [filterKeys, defaultPageSize],
  );

  const [state, setState] = useQueryStates(parsers, { history: "replace" });
  const values = state as Record<string, string | number | null>;

  const page = Math.max(1, Number(values.page) || 1);
  const pageSize = Math.max(1, Number(values.pageSize) || defaultPageSize);
  const sort = (values.sort as string | null) ?? null;
  const order = (values.order as SortOrder | null) ?? null;
  const search = (values.q as string | null) ?? "";

  const filterValues = useMemo(
    () =>
      Object.fromEntries(
        filterKeys.map((key) => [key, (values[key] as string | null) ?? ""]),
      ) as Record<string, string>,
    [filterKeys, values],
  );

  const activeFilters = useMemo<ActiveFilter[]>(
    () =>
      filters.flatMap((filter) =>
        filterParamKeys(filter)
          .filter((paramKey) => filterValues[paramKey])
          .map((paramKey) => ({
            paramKey,
            label: paramLabel(filter, paramKey),
            value: displayValue(filter, filterValues[paramKey]),
          })),
      ),
    [filters, filterValues],
  );

  const apiParams = useMemo<ListApiParams>(() => {
    const params: ListApiParams = {
      limit: pageSize,
      offset: (page - 1) * pageSize,
      sort: sort ?? undefined,
      order: sort ? (order ?? "asc") : undefined,
      q: search.trim() || undefined,
    };
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    return params;
  }, [page, pageSize, sort, order, search, filterValues]);

  const update = useCallback(
    (patch: Record<string, string | number | null>) =>
      setState(patch as Parameters<typeof setState>[0]),
    [setState],
  );

  const setPage = useCallback((next: number) => update({ page: next }), [update]);

  const setPageSize = useCallback(
    (next: number) => update({ pageSize: next, page: 1 }),
    [update],
  );

  const setSorting = useCallback(
    (nextSort: string | null, nextOrder: SortOrder | null) =>
      update({ sort: nextSort, order: nextSort ? nextOrder : null, page: 1 }),
    [update],
  );

  const setSearch = useCallback(
    (next: string) => update({ q: next.trim() ? next : null, page: 1 }),
    [update],
  );

  const setFilter = useCallback(
    (paramKey: string, value: string) =>
      update({ [paramKey]: value || null, page: 1 }),
    [update],
  );

  const clearFilters = useCallback(
    () =>
      update({
        q: null,
        page: 1,
        ...Object.fromEntries(filterKeys.map((key) => [key, null])),
      }),
    [update, filterKeys],
  );

  return {
    page,
    pageSize,
    sort,
    order,
    search,
    filters,
    filterValues,
    activeFilters,
    apiParams,
    setPage,
    setPageSize,
    setSorting,
    setSearch,
    setFilter,
    clearFilters,
  };
};

export type ListQueryState = ReturnType<typeof useListQuery>;
