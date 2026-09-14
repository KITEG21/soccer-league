import { format, parseISO } from "date-fns";
import type { Season } from "../types";

export const getSeasonLabel = (season: Season) => {
  if (season.start_date && season.end_date) {
    try {
      const start = format(parseISO(season.start_date), "dd/MM/yyyy");
      const end = format(parseISO(season.end_date), "dd/MM/yyyy");
      return `${start} - ${end}`;
    } catch {
      return `Temporada ${season.id}`;
    }
  }
  return `Temporada ${season.id}`;
};
