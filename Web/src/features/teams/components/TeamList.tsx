import type { Team } from "../types";
import { Button } from "@/shared/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Loading } from "@/shared/components/Loading";

interface TeamListProps {
  readonly teams: Team[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly onCreate: () => void;
  readonly onEdit: (team: Team) => void;
  readonly onDelete: (id: number) => void;
}

export function TeamList({
  teams,
  isLoading,
  error,
  onCreate,
  onEdit,
  onDelete,
}: TeamListProps) {
  if (isLoading) return <Loading />;
  if (error)
    return (
      <div className="text-center py-8 text-destructive">
        Error al cargar equipos
      </div>
    );

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Equipos</h1>
        <Button className="flex items-center gap-2" onClick={onCreate}>
          <Plus size={16} />
          Nuevo Equipo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team: Team) => (
          <div
            key={team.id}
            className="bg-card text-card-foreground rounded-lg shadow-md p-6 border"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{team.name}</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(team)}
                >
                  <Edit size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(team.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              {team.province && (
                <p>
                  <span className="font-medium">Provincia:</span>{" "}
                  {team.province}
                </p>
              )}
              {team.mascot && (
                <p>
                  <span className="font-medium">Mascota:</span> {team.mascot}
                </p>
              )}
              {team.color && (
                <p>
                  <span className="font-medium">Color:</span>
                  <span
                    className="inline-block w-4 h-4 ml-2 rounded border-2 border-gray-400 dark:border-gray-600"
                    style={{ backgroundColor: team.color }}
                  />
                </p>
              )}
              {team.championships_played !== undefined && (
                <p>
                  <span className="font-medium">Campeonatos jugados:</span>{" "}
                  {team.championships_played}
                </p>
              )}
              {team.championships_won !== undefined && (
                <p>
                  <span className="font-medium">Campeonatos ganados:</span>{" "}
                  {team.championships_won}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12 text-muted-foreground animate-in fade-in duration-300">
          <p className="text-lg mb-4">No hay equipos registrados</p>
          <Button onClick={onCreate}>Crear primer equipo</Button>
        </div>
      )}
    </div>
  );
}
