import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserFormData } from "../schemas/userSchema";
import { usersApiService } from "../services/api";
import { ApiError } from "@/shared/utils/api-client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
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

interface UserFormProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const UserForm = ({ isOpen, onClose }: UserFormProps) => {
  const t = useTranslations("User");
  const common = useTranslations("Common");
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit: handleFormSubmit,
    reset,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: "", password: "", role: "visitante" },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserFormData) => usersApiService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
      reset();
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) return;
      Object.entries(error.errors).forEach(([field, message]) => {
        if (field === "email" || field === "password" || field === "role") {
          setError(field, { message });
        }
      });
    },
  });

  const onSubmit = (data: CreateUserFormData) => createMutation.mutate(data);

  const isLoading = isSubmitting || createMutation.isPending;

  const getErrorMessage = (error: unknown) => {
    if (error instanceof ApiError) return error.message;
    if (error instanceof Error) return error.message;
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t("new")}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{common("email")} *</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{common("password")} *</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("passwordHint")}
              {...register("password")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
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
                  disabled={isLoading}
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

          {createMutation.isError && (
            <p className="text-sm text-destructive font-medium">
              {getErrorMessage(createMutation.error)}
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
              {isLoading ? common("saving") : common("create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
