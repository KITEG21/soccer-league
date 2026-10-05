import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { RowActions } from "@/shared/components/RowActions";
import { coachesApiService } from "../services/api";
import { CoachForm } from "./CoachForm";
import type { Coach } from "../types";
import { usePermission } from "@/shared/hooks/use-permission";
import { useTranslations } from "next-intl";

interface CoachListProps {
  readonly teamId: number;
  readonly coaches: Coach[];
  readonly autoCreate?: boolean;
  readonly onFormClose?: () => void;
}

export const CoachList = ({
  teamId,
  coaches,
  autoCreate = false,
  onFormClose,
}: CoachListProps) => {
  const t = useTranslations("TeamDetail");
  const common = useTranslations("Common");
  const lists = useTranslations("Lists");
  const team = useTranslations("Team");
  const canEdit = usePermission("coaches:write");
  const [isFormOpen, setIsFormOpen] = useState(autoCreate && canEdit);
  const [editingCoach, setEditingCoach] = useState<Coach | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [coachToDelete, setCoachToDelete] = useState<number | undefined>();

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => coachesApiService.deleteCoach(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", teamId] });
      setDeleteDialogOpen(false);
    },
  });

  const handleCreate = () => {
    setEditingCoach(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (coach: Coach) => {
    setEditingCoach(coach);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setCoachToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">{t("coaches")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("coachesAssigned", { count: coaches.length })}
          </p>
        </div>
        {canEdit && (
          <Button size="sm" onClick={handleCreate}>
            <Plus />
            {lists("newCoach")}
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>{common("name")}</TableHead>
              <TableHead>{lists("years")}</TableHead>
              <TableHead>{team("championshipsWon")}</TableHead>
              <TableHead>{common("yearsInTeam")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {coaches.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t("noCoaches")}
                </TableCell>
              </TableRow>
            ) : (
              coaches.map((coach) => (
                <TableRow key={coach.id}>
                  <TableCell className="font-medium">{coach.name}</TableCell>
                  <TableCell className="tabular-nums">
                    {coach.experience_years ?? 0} {lists("years")}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {coach.championships_won ?? 0}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {coach.years_in_team ?? 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <RowActions
                      onEdit={canEdit ? () => handleEdit(coach) : undefined}
                      onDelete={
                        canEdit ? () => handleDelete(coach.id) : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {canEdit && (
        <CoachForm
          teamId={teamId}
          coach={editingCoach}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            onFormClose?.();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          deleteMutation.reset();
        }}
        onConfirm={() => coachToDelete && deleteMutation.mutate(coachToDelete)}
        title={t("deleteCoach")}
        description={t("deleteCoachDescription")}
        confirmText={common("delete")}
        isLoading={deleteMutation.isPending}
        error={
          deleteMutation.isError
            ? deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : "Error al eliminar"
            : null
        }
      />
    </div>
  );
};
