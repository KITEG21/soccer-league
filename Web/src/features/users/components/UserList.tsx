import { format, parseISO } from "date-fns";
import { Plus } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { PageHeader } from "@/shared/components/PageHeader";
import { RowActions } from "@/shared/components/RowActions";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DataTableToolbar,
  ServerDataTable,
  type dataTableFeatures,
  type FilterDefinition,
  type ListQueryState,
} from "@/shared/components/data-table";
import { usePermission } from "@/shared/hooks/use-permission";
import type { User } from "../types";
import { useLocale, useTranslations } from "next-intl";

const ROLE_LABELS: Record<User["role"], string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  visitante: "Visitante",
};

export const USER_FILTERS: readonly FilterDefinition[] = [
  {
    key: "role",
    label: "Rol",
    type: "select",
    options: Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
  },
];

const columnHelper = createColumnHelper<typeof dataTableFeatures, User>();

interface UserListProps {
  readonly users: readonly User[];
  readonly total: number;
  readonly query: ListQueryState;
  readonly currentUserId: number | null;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly error: Error | null;
  readonly onCreate: () => void;
  readonly onEdit: (user: User) => void;
  readonly onDelete: (id: number) => void;
}

export function UserList({
  users,
  total,
  query,
  currentUserId,
  isLoading,
  isFetching,
  error,
  onCreate,
  onEdit,
  onDelete,
}: UserListProps) {
  const canWrite = usePermission("users:write");
  const t = useTranslations("User");
  const common = useTranslations("Common");
  const navigation = useTranslations("Navigation");
  const locale = useLocale();

  const columns = columnHelper.columns([
    columnHelper.accessor("email", {
      header: common("email"),
      cell: ({ row }) => (
        <>
          {row.original.email}
          {row.original.id === currentUserId && (
            <Badge variant="outline" className="ml-2">
              {locale === "es" ? "Tú" : "You"}
            </Badge>
          )}
        </>
      ),
      meta: { cellClassName: "font-medium" },
    }),
    columnHelper.accessor("role", {
      header: common("role"),
      cell: ({ getValue }) => <Badge variant="secondary">{ROLE_LABELS[getValue()]}</Badge>,
    }),
    columnHelper.accessor("created_at", {
      header: common("created"),
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? format(parseISO(value), "dd/MM/yyyy") : "—";
      },
      meta: { cellClassName: "tabular-nums text-muted-foreground" },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) =>
        canWrite && row.original.id !== currentUserId ? (
          <RowActions
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original.id)}
            editLabel={t("changeRole")}
          />
        ) : null,
      meta: { cellClassName: "text-right" },
    }),
  ]);

  return (
    <>
      <PageHeader
        title={navigation("users")}
        actions={
          canWrite && (
            <Button onClick={onCreate}>
              <Plus />
              {t("new")}
            </Button>
          )
        }
      />

      <DataTableToolbar query={query} searchPlaceholder={common("search")} />

      <ServerDataTable
        columns={columns}
        data={users}
        total={total}
        query={query}
        getRowId={(user) => String(user.id)}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        errorMessage={common("loadError")}
        emptyMessage={common("noRecords")}
      />
    </>
  );
}
