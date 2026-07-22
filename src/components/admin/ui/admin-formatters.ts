export function formatAdminDate(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value.includes("T") ? value : `${value}T00:00:00`));
}

export function formatAdminDateTime(value: string | null) {
  if (!value) {
    return "Sin registro";
  }

  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value.includes("T") ? value : `${value}T00:00:00`));
}

export function formatEnrollmentStatus(status: string | null | undefined) {
  if (status === "active") {
    return "Activo";
  }

  if (status === "revoked") {
    return "Revocado";
  }

  if (status === "expired") {
    return "Vencido";
  }

  if (status === "inactive") {
    return "Inactivo";
  }

  return "Sin acceso";
}
