import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Trophy, Shield, ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import { useState, useEffect } from "react";

import { matchesApiService } from "../services/api";
import { playerStatsApiService } from "../services/playerStatsApi";
import { teamsApiService } from "../../teams/services/api";
import { playersApiService } from "../../players/services/api";
import type { PlayerStat, CreatePlayerStatRequest } from "../types/playerStats";
import type { Team } from "../../teams/types";
import type { Player } from "../../players/types";
import { ApiError } from "@/shared/utils/api-client";
import { Loading } from "@/shared/components/Loading";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export const MatchDetailContainer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isStatDialogOpen, setIsStatDialogOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<PlayerStat | null>(null);

  const matchId = parseInt(id || "0");

  const { data: match, isLoading: isLoadingMatch } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => matchesApiService.getMatch(matchId),
    enabled: !!matchId,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApiService.getTeams(),
  });

  const { data: matchStats = [] } = useQuery({
    queryKey: ["player-stats", matchId],
    queryFn: () => playerStatsApiService.getPlayerStatsByMatch(matchId),
    enabled: !!matchId,
  });

  const { data: allPlayers = [] } = useQuery({
    queryKey: ["players"],
    queryFn: () => playersApiService.getPlayers(),
  });

  const getErrorMessage = (error: unknown) => {
    if (error instanceof ApiError) return error.message;
    if (error instanceof Error) return error.message;
    return null;
  };

  const homeTeam = teams.find(t => t.id === match?.home_team_id);
  const awayTeam = teams.find(t => t.id === match?.away_team_id);

  const homePlayers = allPlayers.filter(p => p.team_id === match?.home_team_id);
  const awayPlayers = allPlayers.filter(p => p.team_id === match?.away_team_id);
  const allMatchPlayers = [...homePlayers, ...awayPlayers];

  const createStatMutation = useMutation({
    mutationFn: (data: CreatePlayerStatRequest) => playerStatsApiService.createPlayerStat({ ...data, match_id: matchId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player-stats"] });
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      setIsStatDialogOpen(false);
    },
  });

  const updateStatMutation = useMutation({
    mutationFn: (data: PlayerStat) => playerStatsApiService.updatePlayerStat(data.id, { ...data, match_id: matchId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player-stats"] });
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      setIsStatDialogOpen(false);
    },
  });

  const deleteStatMutation = useMutation({
    mutationFn: (statId: number) => playerStatsApiService.deletePlayerStat(statId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player-stats"] });
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });

  if (isLoadingMatch) return <Loading />;
  if (!match) return <div className="p-8 text-center">Partido no encontrado</div>;

  const handleAddStat = () => {
    createStatMutation.reset();
    updateStatMutation.reset();
    setEditingStat(null);
    setIsStatDialogOpen(true);
  };

  const handleEditStat = (stat: PlayerStat) => {
    createStatMutation.reset();
    updateStatMutation.reset();
    setEditingStat(stat);
    setIsStatDialogOpen(true);
  };

  const handleDeleteStat = (statId: number) => {
    if (confirm("¿Estás seguro de eliminar esta estadística?")) {
      deleteStatMutation.reset();
      deleteStatMutation.mutate(statId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <Button variant="ghost" onClick={() => navigate("/matches")} className="flex items-center gap-2">
        <ArrowLeft size={16} /> Volver a Partidos
      </Button>

      {/* Header Container (FIFA Style) */}
      <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-4 flex-1">
              <div 
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/20 flex items-center justify-center shadow-lg"
                style={{ backgroundColor: homeTeam?.color || "#666" }}
              >
                <Shield size={48} className="text-white drop-shadow-md" />
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-center uppercase tracking-tighter">
                {homeTeam?.name || "Local"}
              </h2>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-6xl md:text-8xl font-black flex items-center gap-4 font-mono">
                <span>{match.home_goals}</span>
                <span className="text-white/30 text-4xl md:text-6xl">-</span>
                <span>{match.away_goals}</span>
              </div>
              <div className={`px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest border ${match.disputed ? "bg-primary/20 text-primary-foreground border-primary/30" : "bg-muted/20 text-muted-foreground border-muted/30"}`}>
                {match.disputed ? "Finalizado" : "Pendiente"}
              </div>
              <div className="text-white/60 text-xs md:text-sm font-medium mt-2 flex flex-col items-center">
                <span>{match.match_date ? format(new Date(match.match_date), "PPP", { locale: es }) : ""}</span>
                <span>{match.stadium?.name}</span>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-4 flex-1">
              <div 
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/20 flex items-center justify-center shadow-lg"
                style={{ backgroundColor: awayTeam?.color || "#666" }}
              >
                <Shield size={48} className="text-white drop-shadow-md" />
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-center uppercase tracking-tighter">
                {awayTeam?.name || "Visitante"}
              </h2>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Container */}
      <Card className="border-none shadow-xl bg-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">
            <Trophy size={20} /> Estadísticas de Jugadores
          </CardTitle>
          <Button onClick={handleAddStat} size="sm" className="font-bold flex items-center gap-2 rounded-lg" disabled={!match.disputed} title={!match.disputed ? "Debe marcar el partido como disputado para agregar estadísticas" : ""}>
            <Plus size={16} /> Agregar Estadísticas
          </Button>
        </CardHeader>
        {deleteStatMutation.isError && (
          <div className="px-6 pt-4 text-sm text-destructive font-medium">
            {getErrorMessage(deleteStatMutation.error)}
          </div>
        )}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Jugador</TableHead>
                  <TableHead className="font-bold">Equipo</TableHead>
                  <TableHead className="text-center font-bold">Goles</TableHead>
                  <TableHead className="text-center font-bold">Asist.</TableHead>
                  <TableHead className="text-center font-bold">Remates</TableHead>
                  <TableHead className="text-center font-bold">Pases</TableHead>
                  <TableHead className="text-center font-bold">Tackles</TableHead>
                  <TableHead className="text-right font-bold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground italic">
                      {match.disputed ? "No hay estadísticas registradas para este partido" : "El partido aún no se ha disputado. Marca el partido como disputado para poder agregar estadísticas."}
                    </TableCell>
                  </TableRow>
                ) : (
                  matchStats.map((stat) => {
                    const player = allPlayers.find(p => p.id === stat.player_id);
                    const playerTeam = teams.find(t => t.id === player?.team_id);
                    return (
                      <TableRow key={stat.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{player?.name || "Desconocido"}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-black">#{player?.number || "--"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: playerTeam?.color || "#666" }} />
                             <span className="text-xs font-medium">{playerTeam?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono font-bold text-lg">{stat.goals_scored}</TableCell>
                        <TableCell className="text-center font-mono">{stat.assists}</TableCell>
                        <TableCell className="text-center font-mono">{stat.shots_on_goal}</TableCell>
                        <TableCell className="text-center font-mono">{stat.passes_completed}</TableCell>
                        <TableCell className="text-center font-mono">{stat.tackles}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditStat(stat)} className="h-8 w-8 p-0">
                              <Edit size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteStat(stat.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stat Dialog */}
      <StatFormDialog 
        isOpen={isStatDialogOpen}
        onClose={() => setIsStatDialogOpen(false)}
        players={allMatchPlayers}
        teams={teams}
        stat={editingStat}
        onSubmit={(data: CreatePlayerStatRequest) => {
          if (editingStat) {
            updateStatMutation.mutate({ ...editingStat, ...data });
          } else {
            createStatMutation.mutate(data);
          }
        }}
        existingPlayerIds={matchStats.map(s => s.player_id).filter(id => id !== editingStat?.player_id)}
        isSubmitting={createStatMutation.isPending || updateStatMutation.isPending}
        error={getErrorMessage(createStatMutation.error || updateStatMutation.error)}
      />
    </div>
  );
};

interface StatFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  teams: Team[];
  stat: PlayerStat | null;
  onSubmit: (data: CreatePlayerStatRequest) => void;
  existingPlayerIds: number[];
  isSubmitting: boolean;
  error?: string | null;
}

const StatFormDialog = ({ isOpen, onClose, players, teams, stat, onSubmit, existingPlayerIds, isSubmitting, error }: StatFormDialogProps) => {
  const [formData, setFormData] = useState({
    player_id: "",
    goals_scored: 0,
    assists: 0,
    shots_on_goal: 0,
    passes_completed: 0,
    interceptions: 0,
    tackles: 0,
    blocks: 0,
    saves: 0,
    goals_conceded: 0,
  });

  useEffect(() => {
    if (stat) {
      setFormData({
        player_id: stat.player_id.toString(),
        goals_scored: stat.goals_scored,
        assists: stat.assists,
        shots_on_goal: stat.shots_on_goal,
        passes_completed: stat.passes_completed,
        interceptions: stat.interceptions,
        tackles: stat.tackles,
        blocks: stat.blocks,
        saves: stat.saves,
        goals_conceded: stat.goals_conceded,
      });
    } else {
      setFormData({
        player_id: "",
        goals_scored: 0,
        assists: 0,
        shots_on_goal: 0,
        passes_completed: 0,
        interceptions: 0,
        tackles: 0,
        blocks: 0,
        saves: 0,
        goals_conceded: 0,
      });
    }
  }, [stat, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      player_id: parseInt(formData.player_id),
      match_id: 0, // Will be overridden in mutation
      goals_scored: formData.goals_scored,
      assists: formData.assists,
      shots_on_goal: formData.shots_on_goal,
      passes_completed: formData.passes_completed,
      interceptions: formData.interceptions,
      tackles: formData.tackles,
      blocks: formData.blocks,
      saves: formData.saves,
      goals_conceded: formData.goals_conceded,
    });
  };

  const availablePlayers = players.filter((p) => !existingPlayerIds.includes(p.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{stat ? "Editar Estadística" : "Agregar Estadística"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Jugador</Label>
            <Select 
                value={formData.player_id} 
                onValueChange={(v) => setFormData({ ...formData, player_id: v })}
                disabled={!!stat}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar jugador" />
              </SelectTrigger>
              <SelectContent>
                {availablePlayers.map((p) => {
                  const team = teams.find((t) => t.id === p.team_id);
                  return (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name} (#{p.number}) - {team?.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Goles</Label>
              <Input type="number" min="0" value={formData.goals_scored} onChange={(e) => setFormData({ ...formData, goals_scored: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>Asistencias</Label>
              <Input type="number" min="0" value={formData.assists} onChange={(e) => setFormData({ ...formData, assists: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>Remates</Label>
              <Input type="number" min="0" value={formData.shots_on_goal} onChange={(e) => setFormData({ ...formData, shots_on_goal: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>Pases Completados</Label>
              <Input type="number" min="0" value={formData.passes_completed} onChange={(e) => setFormData({ ...formData, passes_completed: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>Entradas (Tackles)</Label>
              <Input type="number" min="0" value={formData.tackles} onChange={(e) => setFormData({ ...formData, tackles: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>Intercepciones</Label>
              <Input type="number" min="0" value={formData.interceptions} onChange={(e) => setFormData({ ...formData, interceptions: parseInt(e.target.value) || 0 })} />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}

          <DialogFooter className="pt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting || !formData.player_id}>
              {isSubmitting ? "Guardando..." : "Guardar Estadísticas"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
