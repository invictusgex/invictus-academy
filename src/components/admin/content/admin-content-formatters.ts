import type {
  AcademyContentStatus,
  AcademyResourceType,
  ModuleAvailability,
} from "@/types/academy";

export function formatContentStatus(status: AcademyContentStatus) {
  if (status === "published") {
    return "Publicado";
  }

  if (status === "archived") {
    return "Archivado";
  }

  return "Borrador";
}

export function formatAvailability(availability: ModuleAvailability) {
  if (availability === "available") {
    return "Disponible";
  }

  return "Proximamente";
}

export function formatResourceType(resourceType: AcademyResourceType) {
  const labels: Record<AcademyResourceType, string> = {
    downloadable: "Descargable",
    link: "Enlace",
    other: "Otro",
    pdf: "PDF",
    template: "Plantilla",
  };

  return labels[resourceType];
}

export function formatDurationMinutes(value: number | null) {
  if (value === null) {
    return "Sin duracion";
  }

  if (value === 1) {
    return "1 min";
  }

  return `${value} min`;
}

export function formatDurationSeconds(value: number | null) {
  if (value === null) {
    return "Sin duracion";
  }

  const minutes = Math.floor(value / 60);
  const seconds = value % 60;

  if (minutes === 0) {
    return `${seconds} s`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
