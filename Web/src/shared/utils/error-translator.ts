export const errorTranslations: Record<string, string> = {
  "validation error": "Error de validación",
  "date range conflict": "Conflicto en el rango de fechas",
  "entity in use, cannot delete": "Entidad en uso, no se puede eliminar",
  "resource not found": "Recurso no encontrado",
  "invalid request": "Solicitud inválida",
  "internal server error": "Error interno del servidor",

  name: "Nombre",
  start_date: "Fecha de inicio",
  end_date: "Fecha de fin",
  date_range: "Rango de fechas",
  number: "Número / Dorsal",
  experience_years: "Años de experiencia",
  years_in_team: "Años en el equipo",
  delete: "Eliminar",

  "overlaps with existing record": "se solapa con un registro existente",
  "cannot delete": "no se puede eliminar",
  "because it is referenced by": "porque tiene referencias en",
  "match(es)": "partido(s)",
  "footballer(s)": "futbolista(s)",
  "is already used in this team by": "ya está siendo usado en este equipo por",
  "cannot be less than": "no puede ser menor que",
  "falls outside new date range": "cae fuera del nuevo rango de fechas",
};

export function translateError(message: string): string {
  if (!message) return "Ha ocurrido un error inesperado";

  const directTranslation = errorTranslations[message.toLowerCase()];
  if (directTranslation) return directTranslation;

  let translated = message;

  Object.entries(errorTranslations).forEach(([key, value]) => {
    if (key.length > 5) {
      const regex = new RegExp(key, "gi");
      translated = translated.replace(regex, value);
    }
  });

  translated = translated.replace(/ID: \d+/g, (match) =>
    match.replace("ID", "ID"),
  );

  return translated;
}
