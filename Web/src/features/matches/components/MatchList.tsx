import type { Match } from "../types";
import type { Season } from "../../seasons/types";
import { Button } from "@/shared/components/ui/button";
import { Pagination } from "@/shared/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Loading } from "@/shared/components/Loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface MatchListProps {
  readonly matches: Match[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly onCreate: () => void;
  readonly onEdit: (match: Match) => void;
  readonly onDelete: (id: number) => void;
  readonly page: number;
  readonly total: number;
  readonly pageSize: number;
  readonly onPageChange: (page: number) => void;
  readonly seasons: Season[];
  readonly selectedSeason: string;
  readonly onSeasonChange: (season: string) => void;
}

function getSeasonLabel(s: Season) {
  if (s.start_date && s.end_date) {
    try {
      return `${format(parseISO(s.start_date), "dd/MM/yyyy")} - ${format(parseISO(s.end_date), "dd/MM/yyyy")}`;
    } catch {
      return `Temporada ${s.id}`;
    }
  }
  return `Temporada ${s.id}`;
}

export function MatchList({
  matches,
  isLoading,
  error,
  onCreate,
  onEdit,
  onDelete,
  page,
  total,
  pageSize,
  onPageChange,
  seasons,
  selectedSeason,
  onSeasonChange,
}: MatchListProps) {
  const navigate = useNavigate();
  if (isLoading) return <Loading />;
  if (error)
    return (
      <div className="text-center py-8 text-destructive">
        Error al cargar partidos
      </div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Partidos</h1>
        <div className="flex items-center gap-3">
          <div className="w-64">
            <Select
              value={selectedSeason || "all"}
              onValueChange={(value) => onSeasonChange(value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las temporadas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las temporadas</SelectItem>
                {seasons.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {getSeasonLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="flex items-center gap-2" onClick={onCreate}>
            <Plus size={16} />
            Nuevo Partido
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Local</TableHead>
              <TableHead className="text-center">Resultado</TableHead>
              <TableHead>Visitante</TableHead>
              <TableHead>Estadio</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No hay partidos registrados
                </TableCell>
              </TableRow>
            ) : (
              matches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell>
                    {format(new Date(match.match_date), "dd/MM/yyyy HH:mm", { locale: es })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {match.home_team?.name || `Equipo ${match.home_team_id}`}
                  </TableCell>
                  <TableCell className="text-center font-bold text-lg">
                    {match.home_goals} - {match.away_goals}
                  </TableCell>
                  <TableCell className="font-medium">
                    {match.away_team?.name || `Equipo ${match.away_team_id}`}
                  </TableCell>
                  <TableCell>
                    {match.stadium?.name || `Estadio ${match.stadium_id}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/matches/${match.id}`)}
                        title="Ver detalles y estadísticas"
                      >
                        <Plus size={14} className="text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(match)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(match.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6">
        <Pagination page={page} total={total} pageSize={pageSize} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
