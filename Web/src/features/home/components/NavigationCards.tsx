import { NavigationCard } from "./NavigationCard";
import { Calendar, Users, User, Megaphone, Flag, Landmark } from "lucide-react";

const navigationItems = [
  {
    icon: Calendar,
    title: "Temporadas",
    description:
      "Gestiona las diferentes temporadas de la liga y su configuración",
    to: "/seasons",
  },
  {
    icon: Users,
    title: "Equipos",
    description: "Administra los equipos participantes de la liga",
    to: "/teams",
  },
  {
    icon: User,
    title: "Jugadores",
    description: "Conoce y gestiona a los jugadores de cada equipo",
    to: "/players",
  },
  {
    icon: Megaphone,
    title: "Entrenadores",
    description: "Información sobre los entrenadores de los equipos",
    to: "/coaches",
  },
  {
    icon: Flag,
    title: "Partidos",
    description: "Gestiona los partidos y resultados de la temporada",
    to: "/matches",
  },
  {
    icon: Landmark,
    title: "Estadios",
    description: "Explora y administra las sedes de los encuentros",
    to: "/stadiums",
  },
];

export const NavigationCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
      {navigationItems.map((item) => (
        <NavigationCard
          key={item.title}
          icon={item.icon}
          title={item.title}
          description={item.description}
          to={item.to}
        />
      ))}
    </div>
  );
};
