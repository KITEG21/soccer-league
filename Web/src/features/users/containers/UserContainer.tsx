"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "../types";
import { usersApiService } from "../services/api";
import { UserList } from "../components/UserList";
import { UserForm } from "../components/UserForm";
import { UserRoleDialog } from "../components/UserRoleDialog";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { ApiError } from "@/shared/utils/api-client";
import { useAuth } from "@/shared/contexts/AuthContext";

const PAGE_SIZE = 10;

export const UserContainer = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | undefined>();
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();
  const { userId } = useAuth();

  const {
    data: usersPage,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", page],
    queryFn: () => usersApiService.getUsersPage(page, PAGE_SIZE),
    refetchOnWindowFocus: false,
  });

  const users = usersPage?.data ?? [];
  const total = usersPage?.total ?? 0;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApiService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (users.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      }
      setDeleteDialogOpen(false);
      setUserToDelete(undefined);
    },
  });

  const handleCreate = () => setIsFormOpen(true);
  const handleEdit = (user: User) => setEditingUser(user);
  const handleDelete = (id: number) => {
    deleteMutation.reset();
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const getErrorMessage = (err: unknown) => {
    if (err instanceof ApiError) return err.message;
    if (err instanceof Error) return err.message;
    return "Error al eliminar";
  };

  return (
    <div className="space-y-6">
      <UserList
        users={users}
        currentUserId={userId}
        isLoading={isLoading}
        error={error instanceof Error ? error : null}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        page={page}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
      <UserForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
      <UserRoleDialog
        user={editingUser}
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(undefined)}
      />
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
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
