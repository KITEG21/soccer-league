import type { Season } from "../types";
import { Button } from "@/shared/components/ui/button";
import { Plus, Edit, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { Loading } from "@/shared/components/Loading";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface SeasonListProps {
  readonly seasons: Season[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly onCreate: () => void;
  readonly onEdit: (season: Season) => void;
  readonly onDelete: (id: number) => void;
}

export function SeasonList({
  seasons,
  isLoading,
  error,
  onCreate,
  onEdit,
  onDelete,
}: SeasonListProps) {
  if (isLoading) return <Loading />;
  if (error)
    return (
      <div className="text-center py-8 text-destructive">
        Error al cargar temporadas
      </div>
    );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy");
    } catch (e) {
      return "N/A";
    }
  };

  const getSeasonTitle = (season: Season) => {
    if (!season.start_date || !season.end_date) return `Temporada ${season.id}`;
    try {
      const start = parseISO(season.start_date);
      const end = parseISO(season.end_date);
      const startStr = format(start, "MMM/yy", { locale: es });
      const endStr = format(end, "MMM/yy", { locale: es });
      return `${startStr} - ${endStr}`;
    } catch (e) {
      return `Temporada ${season.id}`;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Temporadas</h1>
        <Button className="flex items-center gap-2" onClick={onCreate}>
          <Plus size={16} />
          Nueva Temporada
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {seasons.map((season: Season) => (
          <div
            key={season.id}
            className="bg-card text-card-foreground rounded-lg shadow-md p-6 border transition-all hover:shadow-lg"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <CalendarIcon size={20} />
                </div>
                <h3 className="text-xl font-semibold capitalize">
                  {getSeasonTitle(season)}
                </h3>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(season)}
                  title="Editar temporada"
                >
                  <Edit size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(season.id)}
                  title="Eliminar temporada"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Inicio:</span>
                <span className="font-semibold">{formatDate(season.start_date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Fin:</span>
                <span className="font-semibold">{formatDate(season.end_date)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {seasons.length === 0 && (
        <div className="text-center py-12 text-muted-foreground animate-in fade-in duration-300">
          <p className="text-lg mb-4">No hay temporadas registradas</p>
          <Button onClick={onCreate}>Crear primera temporada</Button>
        </div>
      )}
    </div>
  );
}
