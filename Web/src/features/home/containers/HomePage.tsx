import { Carousel } from "../components/Carousel";
import { NavigationCards } from "../components/NavigationCards";
import { ReportCards } from "../components/ReportCards";

const carouselSlides = [
  {
    id: "stadiums",
    title: "Aventúrate en un tour por los estadios de la temporada",
    description:
      "Descubre los impresionantes escenarios donde se jugará la liga",
    backgroundImage:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920&q=80",
    link: "/stadiums",
  },
  {
    id: "players",
    title: "Conoce a los mejores jugadores de la temporada",
    description:
      "Explora las estadísticas y trayectorias de las estrellas del fútbol",
    backgroundImage:
      "https://images.unsplash.com/photo-1739550635585-484633b21450?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0",
    link: "/players",
  },
  {
    id: "teams",
    title: "Los equipos que harán más interesante esta temporada",
    description: "Conoce ahora a los clubes que lucharán por el título",
    backgroundImage:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80",
    link: "/teams",
  },
];

export const HomePage = () => {
  return (
    <div className="space-y-8">
      <Carousel slides={carouselSlides} autoPlayInterval={6000} />
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Explora el Sistema
        </h2>
        <p className="text-muted-foreground">
          Accede rápidamente a todas las secciones de la liga
        </p>
      </div>
      <NavigationCards />
      <ReportCards />
    </div>
  );
};
