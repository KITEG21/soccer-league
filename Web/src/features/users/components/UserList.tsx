"use client";

import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { DataTable } from "@/shared/components/DataTable";
import { RowActions } from "@/shared/components/RowActions";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Pagination } from "@/shared/components/ui/pagination";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import type { User } from "../types";

const COLUMNS = ["Email", "Rol", ""];

const ROLE_LABELS: Record<User["role"], string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  visitante: "Visitante",
};

interface UserListProps {
  readonly users: User[];
  readonly currentUserId: number | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly onCreate: () => void;
  readonly onEdit: (user: User) => void;
  readonly onDelete: (id: number) => void;
  readonly page: number;
  readonly total: number;
  readonly pageSize: number;
  readonly onPageChange: (page: number) => void;
}

export function UserList({
  users,
  currentUserId,
  isLoading,
  error,
  onCreate,
  onEdit,
  onDelete,
  page,
  total,
  pageSize,
  onPageChange,
}: UserListProps) {
  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Gestiona quién puede acceder al panel y con qué rol"
        actions={
          <Button onClick={onCreate}>
            <Plus />
            Nuevo usuario
          </Button>
        }
      />

      <DataTable
        columns={COLUMNS}
        isLoading={isLoading}
        error={error}
        errorMessage="Error al cargar usuarios"
        isEmpty={users.length === 0}
        emptyMessage="No hay usuarios registrados"
        footer={
          <Pagination
            page={page}
            total={total}
            pageSize={pageSize}
            onPageChange={onPageChange}
          />
        }
      >
        {users.map((user) => {
          const isCurrentUser = user.id === currentUserId;
          return (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.email}
                {isCurrentUser && (
                  <Badge variant="outline" className="ml-2">
                    Tú
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {!isCurrentUser && (
                  <RowActions
                    onEdit={() => onEdit(user)}
                    onDelete={() => onDelete(user.id)}
                    editLabel="Cambiar rol"
                  />
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </DataTable>
    </>
  );
}
