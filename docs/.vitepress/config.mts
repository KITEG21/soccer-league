import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "es",
  title: "SoccerLeague",
  description: "Documentación técnica y guía visual de SoccerLeague.",
  srcExclude: ["README.md", "Project Specifications.md", "database-diagram.md", "reportes-explicacion.md"],
  cleanUrls: true,
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }]],
  themeConfig: {
    logo: { src: "/favicon.svg", alt: "SoccerLeague" },
    siteTitle: "SoccerLeague · Docs",
    nav: [
      { text: "Guía", link: "/guia/introduccion" },
      { text: "Diseño", link: "/identidad-visual" },
    ],
    sidebar: [
      { text: "Proyecto", items: [
        { text: "Introducción", link: "/guia/introduccion" },
        { text: "Instalación y configuración", link: "/guia/instalacion" },
        { text: "Arquitectura", link: "/guia/arquitectura" },
      ] },
      { text: "Diseño", items: [
        { text: "Identidad visual y colores", link: "/identidad-visual" },
      ] },
      { text: "Documentación", items: [
        { text: "Cómo documentar", link: "/guia/documentar" },
      ] },
    ],
    search: {
      provider: "local",
      options: { translations: {
        button: { buttonText: "Buscar", buttonAriaLabel: "Buscar en la documentación" },
        modal: {
          displayDetails: "Mostrar detalles",
          resetButtonTitle: "Limpiar búsqueda",
          backButtonTitle: "Cerrar búsqueda",
          noResultsText: "No se encontraron resultados para",
          footer: { selectText: "seleccionar", navigateText: "navegar", closeText: "cerrar" },
        },
      } },
    },
    outline: { level: [2, 3], label: "En esta página" },
    docFooter: { prev: "Anterior", next: "Siguiente" },
    sidebarMenuLabel: "Menú",
    returnToTopLabel: "Volver arriba",
    darkModeSwitchLabel: "Apariencia",
    lightModeSwitchTitle: "Cambiar a tema claro",
    darkModeSwitchTitle: "Cambiar a tema oscuro",
    skipToContentLabel: "Ir al contenido",
    footer: { message: "Guía técnica y visual del proyecto SoccerLeague." },
  },
});
