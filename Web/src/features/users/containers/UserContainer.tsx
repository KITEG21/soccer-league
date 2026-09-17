"use client";

import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { User } from "../types";
import { usersApiService } from "../services/api";
import { USER_FILTERS, UserList } from "../components/UserList";
import { UserForm } from "../components/UserForm";
import { UserRoleDialog } from "../components/UserRoleDialog";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { useListQuery } from "@/shared/components/data-table";
import { ApiError } from "@/shared/utils/api-client";
import { useAuth } from "@/shared/contexts/AuthContext";

const getErrorMessage = (err: unknown) => {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Error al eliminar";
};

export const UserContainer = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [userToDelete, setUserToDelete] = useState<number | undefined>();
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const query = useListQuery({ filters: USER_FILTERS });

  const {
    data: usersPage,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["users", "list", query.apiParams],
    queryFn: () => usersApiService.getUsersPage(query.apiParams),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApiService.deleteUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setUserToDelete(undefined);
    },
  });

  const handleDelete = (id: number) => {
    deleteMutation.reset();
    setUserToDelete(id);
  };

  return (
    <div className="space-y-6">
      <UserList
        users={usersPage?.data ?? []}
        total={usersPage?.total ?? 0}
        query={query}
        currentUserId={userId}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onCreate={() => setIsFormOpen(true)}
        onEdit={setEditingUser}
        onDelete={handleDelete}
      />
      <UserForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
      <UserRoleDialog
        user={editingUser}
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(undefined)}
      />
      <ConfirmDialog
        isOpen={userToDelete !== undefined}
        onClose={() => {
          setUserToDelete(undefined);
          deleteMutation.reset();
        }}
        onConfirm={() => userToDelete !== undefined && deleteMutation.mutate(userToDelete)}
        title="Eliminar usuario"
        description="¿Seguro que quieres eliminar este usuario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={deleteMutation.isPending}
        error={deleteMutation.isError ? getErrorMessage(deleteMutation.error) : null}
      />
    </div>
  );
};
