import { NavigationCard } from "./NavigationCard";
import { 
  Trophy, 
  History, 
  CalendarDays, 
  Award, 
  TrendingUp, 
  ClipboardCheck, 
  Star 
} from "lucide-react";

const reportItems = [
  {
    icon: Trophy,
    title: "Tabla de Posiciones",
    description:
      "Visualiza el rendimiento de los equipos en la temporada actual, incluyendo puntos, goles y posición en la tabla.",
    to: "/reports/standings",
  },
  {
    icon: History,
    title: "Enfrentamientos Directos",
    description:
      "Compara el historial cara a cara entre dos equipos, analizando resultados previos y estadísticas compartidas.",
    to: "/reports/head-to-head",
  },
  {
    icon: CalendarDays,
    title: "Calendario y Sedes",
    description:
      "Consulta la programación detallada de partidos por fecha, filtrando por estadio para planificar la asistencia.",
    to: "/reports/schedule",
  },
  {
    icon: Award,
    title: "Ranking de Experiencia",
    description:
      "Descubre a los directores técnicos con mayor trayectoria en la liga, ordenados por sus años de carrera profesional.",
    to: "/reports/coach-experience",
  },
  {
    icon: TrendingUp,
    title: "Asistencia a Estadios",
    description:
      "Análisis estadístico de la afluencia de público en cada sede, permitiendo identificar los escenarios con mayor convocatoria.",
    to: "/reports/attendance",
  },
  {
    icon: ClipboardCheck,
    title: "Estado del Equipo",
    description:
      "Resumen exhaustivo de la situación de un club específico, abarcando desde resultados recientes hasta disponibilidad de plantilla.",
    to: "/reports/team-status",
  },
  {
    icon: Star,
    title: "Equipo Ideal",
    description:
      "La alineación de ensueño de la temporada, conformada por los jugadores con el desempeño más destacado en sus posiciones.",
    to: "/reports/all-star",
  },
];

export const ReportCards = () => {
  return (
    <div className="space-y-6 mt-12">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Reportes y Estadísticas
        </h2>
        <p className="text-muted-foreground">
          Análisis detallado y datos clave para el seguimiento de la competición
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportItems.map((item) => (
          <NavigationCard
            key={item.title}
            icon={item.icon}
            title={item.title}
            description={item.description}
            to={item.to}
          />
        ))}
      </div>
    </div>
  );
};
