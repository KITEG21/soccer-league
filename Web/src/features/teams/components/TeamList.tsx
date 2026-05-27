import type { Team } from "../types";
import { Button } from "@/shared/components/ui/button";
import { Plus, Edit, Trash2, ChevronRight } from "lucide-react";
import { Loading } from "@/shared/components/Loading";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  if (isLoading) return <Loading />;
  if (error)
    return (
      <div className="text-center py-8 text-destructive">
        Error al cargar equipos
      </div>
    );

  return (
    <div>
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
            className="bg-card text-card-foreground rounded-lg shadow-md p-6 border group hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => navigate(`/teams/${team.id}`)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-border items-center justify-center flex">
                  <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: team.color || "#ccc" }} 
                />
                </div>
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {team.name}
                </h3>
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
                  <span className="font-medium text-foreground">Provincia:</span>{" "}
                  {team.province}
                </p>
              )}
              {team.mascot && (
                <p>
                  <span className="font-medium text-foreground">Mascota:</span> {team.mascot}
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between items-center text-primary text-sm font-medium">
              <span>Gestionar plantilla</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
