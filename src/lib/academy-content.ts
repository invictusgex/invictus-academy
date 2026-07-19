import type { AcademyModule, AcademyNavItem } from "@/types/academy";

export const academyNavigation: AcademyNavItem[] = [
  { label: "Inicio", href: "/academy" },
  { label: "Mi programa", href: "/academy" },
  { label: "Progreso", href: "/academy" },
  { label: "Configuración", href: "/academy" },
];

export const academyModules: AcademyModule[] = Array.from(
  { length: 7 },
  (_, index) => ({
    moduleNumber: index + 1,
    title: `Módulo ${index + 1}`,
    description: "Contenido pendiente de definición",
    status: "No iniciado",
  }),
);
