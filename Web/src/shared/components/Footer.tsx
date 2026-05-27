import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Globe, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/shared/contexts/AuthContext";

const creators = [
  {
    name: "Br4voCode",
    github: "https://github.com/Br4voCode",
    avatar: "https://avatars.githubusercontent.com/u/196562378?s=400&u=9098ee191aaa9324fda32b6c9b3172c979484207&v=4",
    initials: "BC",
  },
  {
    name: "KITEG21",
    github: "https://github.com/KITEG21",
    avatar: "https://avatars.githubusercontent.com/u/150097269?v=4",
    initials: "K",
  },
  {
    name: "hasielrb",
    github: "https://github.com/hasielrb",
    avatar: "https://avatars.githubusercontent.com/u/198116826?v=4",
    initials: "H",
  },
];

const footerLinks = [
  {
    title: "Navegación",
    links: [
      { label: "Inicio", to: "/" },
      { label: "Temporadas", to: "/seasons" },
      { label: "Equipos", to: "/teams" },
      { label: "Jugadores", to: "/players" },
    ],
  },
  {
    title: "Reportes",
    links: [
      { label: "Posiciones", to: "/reports/standings" },
      { label: "Estadísticas", to: "/reports/attendance" },
      { label: "Equipo Ideal", to: "/reports/all-star" },
    ],
  },
];

export const Footer = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <footer className="mt-auto border-t border-border/40 bg-card/30 backdrop-blur-md relative overflow-hidden animate-in fade-in slide-in-from-bottom-20 duration-1000">
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      
      <div className="container mx-auto px-6 py-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black tracking-tighter text-foreground mb-4">
                SOCCER<span className="text-primary">LEAGUE</span>
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                La plataforma definitiva para la gestión profesional de torneos de fútbol. 
                Estadísticas precisas, gestión de plantillas y reportes en tiempo real.
              </p>
            </div>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                <Trophy size={18} />
              </a>
              <a href="#" className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                <Globe size={18} />
              </a>
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-muted-foreground hover:text-primary text-sm transition-colors flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">Equipo de Desarrollo</h4>
            <div className="flex -space-x-4 hover:space-x-1 transition-all duration-500">
              {creators.map((creator) => (
                <a
                  key={creator.name}
                  href={creator.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group ring-4 ring-background rounded-full transition-all hover:scale-125 hover:z-20 hover:rotate-3 shadow-xl"
                  title={creator.name}
                >
                  <Avatar className="h-14 w-14 border-2 border-primary/20 bg-background">
                    <AvatarImage src={creator.avatar} alt={creator.name} />
                    <AvatarFallback className="font-bold">{creator.initials}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap shadow-xl pointer-events-none uppercase tracking-tighter">
                    {creator.name}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border/40 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center w-full">
            <p className="text-sm font-medium  text-foreground">
              © {new Date().getFullYear()} Soccer League Manager.
            </p>
            <p className="text-xs text-muted-foreground">
              Construido con <span className="text-red-500 animate-pulse">❤️</span> por apasionados del fútbol.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
