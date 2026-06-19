import { Landmark, Plus, Edit, Trash2, Users } from "lucide-react";
import type { Stadium } from "../types";
import { Button } from "@/shared/components/ui/button";
import { Pagination } from "@/shared/components/ui/pagination";
import { Loading } from "@/shared/components/Loading";

interface StadiumListProps {
  readonly stadiums: Stadium[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly onCreate: () => void;
  readonly onEdit: (stadium: Stadium) => void;
  readonly onDelete: (id: number) => void;
  readonly page: number;
  readonly total: number;
  readonly pageSize: number;
  readonly onPageChange: (page: number) => void;
}

export function StadiumList({
  stadiums,
  isLoading,
  error,
  onCreate,
  onEdit,
  onDelete,
  page,
  total,
  pageSize,
  onPageChange,
}: StadiumListProps) {
  if (isLoading) return <Loading />;
  if (error)
    return (
      <div className="text-center py-8 text-destructive">
        Error al cargar estadios
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
            <Landmark className="text-primary" />
            Estadios
        </h1>
        <Button className="flex items-center gap-2" onClick={onCreate}>
          <Plus size={16} />
          Nuevo Estadio
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stadiums.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
            No hay estadios registrados.
          </div>
        ) : (
          stadiums.map((stadium) => (
            <div
              key={stadium.id}
              className="group bg-card border rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Landmark className="text-primary w-6 h-6" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(stadium)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(stadium.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {stadium.name}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users size={14} />
                  <span className="text-sm">
                    Capacidad: <span className="font-semibold text-foreground">{stadium.capacity?.toLocaleString() || 0}</span>
                  </span>
                </div>
              </div>

              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150" />
            </div>
          ))
        )}
      </div>

      <Pagination page={page} total={total} pageSize={pageSize} onPageChange={onPageChange} />
    </div>
  );
}
