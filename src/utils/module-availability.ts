import type { ModuleAvailability } from "@/types/academy";

export function formatModuleAvailabilityLabel(
  availability: ModuleAvailability,
) {
  return availability === "available" ? "Disponible" : "Próximamente";
}
