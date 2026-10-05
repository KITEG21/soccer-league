import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";

interface RowActionsProps {
  readonly onEdit?: () => void;
  readonly onDelete?: () => void;
  readonly editLabel?: string;
  readonly deleteLabel?: string;
}

export const RowActions = ({
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
}: RowActionsProps) => {
  const t = useTranslations("Common");
  const resolvedEditLabel = editLabel ?? t("edit");
  const resolvedDeleteLabel = deleteLabel ?? t("delete");
  if (!onEdit && !onDelete) return null;

  return (
    <div className="flex items-center justify-end gap-1">
      {onEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
          aria-label={resolvedEditLabel}
          title={resolvedEditLabel}
          onClick={onEdit}
        >
          <Pencil className="size-4" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label={resolvedDeleteLabel}
          title={resolvedDeleteLabel}
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  );
};
