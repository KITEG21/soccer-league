import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateUserSchema,
  type UpdateUserFormData,
} from "../schemas/userSchema";
import { usersApiService } from "../services/api";
import type { User } from "../types";
import { ApiError } from "@/shared/utils/api-client";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";

interface UserEditDialogProps {
  readonly user?: User;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly isCurrentUser: boolean;
}

export const UserEditDialog = ({ user, isOpen, onClose, isCurrentUser }: UserEditDialogProps) => {
  const t = useTranslations("User");
  const common = useTranslations("Common");
  const queryClient = useQueryClient();

  const { register, control, handleSubmit, reset, setError, formState: { errors, isSubmitting } } =
    useForm<UpdateUserFormData>({
      resolver: zodResolver(updateUserSchema),
      values: { first_name: user?.first_name ?? "", last_name: user?.last_name ?? "", role: user?.role ?? "visitante" },
    });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserFormData) =>
      usersApiService.updateUser(user!.id, isCurrentUser
        ? { first_name: data.first_name, last_name: data.last_name }
        : data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      onClose();
      reset();
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) return;
      Object.entries(error.errors).forEach(([field, message]) => {
        if (field === "first_name" || field === "last_name" || field === "role") {
          setError(field, { message });
        }
      });
    },
  });

  const isLoading = isSubmitting || updateMutation.isPending;

  const getErrorMessage = (error: unknown) => {
    if (error instanceof ApiError) return error.message;
    if (error instanceof Error) return error.message;
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t("edit")}</DialogTitle>
          <DialogDescription>{user?.email}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => updateMutation.mutate(data))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="edit-first-name">{t("firstName")} *</Label>
            <Input id="edit-first-name" autoComplete="given-name" maxLength={100} {...register("first_name")} disabled={isLoading} />
            {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-last-name">{t("lastName")} *</Label>
            <Input id="edit-last-name" autoComplete="family-name" maxLength={100} {...register("last_name")} disabled={isLoading} />
            {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">{common("role")} *</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading || isCurrentUser}
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visitante">{t("visitor")}</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Superadmin</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {updateMutation.isError && (
            <p className="text-sm text-destructive font-medium">
              {getErrorMessage(updateMutation.error)}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {common("cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? common("saving") : common("save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
