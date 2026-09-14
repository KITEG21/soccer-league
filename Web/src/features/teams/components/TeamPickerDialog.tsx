"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { teamsApiService } from "../services/api";

interface TeamPickerDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSelect: (teamId: number) => void;
  readonly title: string;
  readonly description: string;
}

export const TeamPickerDialog = ({
  isOpen,
  onClose,
  onSelect,
  title,
  description,
}: TeamPickerDialogProps) => {
  const [search, setSearch] = useState("");

  const { data: teams = [], isPending } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApiService.getTeams(),
    enabled: isOpen,
  });

  const term = search.trim().toLowerCase();
  const results = term
    ? teams.filter(
        (team) =>
          team.name.toLowerCase().includes(term) ||
          (team.province ?? "").toLowerCase().includes(term),
      )
    : teams;

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    setSearch("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar equipo por nombre o provincia"
            className="pl-9"
          />
        </div>

        <div className="-mx-1 max-h-72 space-y-1 overflow-y-auto px-1">
          {isPending &&
            [1, 2, 3, 4].map((row) => (
              <Skeleton key={row} className="h-12 w-full" />
            ))}

          {!isPending && results.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No se encontraron equipos
            </p>
          )}

          {!isPending &&
            results.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => onSelect(team.id)}
                className="flex w-full items-center gap-3 rounded-lg border border-transparent p-2.5 text-left transition-colors hover:border-border hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className="size-3 shrink-0 rounded-full ring-1 ring-border"
                  style={{ backgroundColor: team.color || "transparent" }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {team.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {team.province || "Sin provincia"} ·{" "}
                    {team.players?.length ?? 0} jugadores
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
