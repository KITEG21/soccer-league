import { z } from "zod";
import { parseISO, isAfter } from "date-fns";

export const seasonSchema = z.object({
  start_date: z.string().min(1, "La fecha de inicio es requerida"),
  end_date: z.string().min(1, "La fecha de fin es requerida"),
}).refine((data) => {
  try {
    const start = parseISO(data.start_date);
    const end = parseISO(data.end_date);
    return isAfter(end, start);
  } catch (e) {
    return false;
  }
}, {
  message: "La fecha de fin debe ser posterior a la fecha de inicio",
  path: ["end_date"],
});

export type SeasonFormValues = z.infer<typeof seasonSchema>;
