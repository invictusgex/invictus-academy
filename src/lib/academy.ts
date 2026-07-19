export {
  getAcademyModule,
  getAcademyModules,
  getAcademyProgram,
} from "@/content/programs/trading-basado-en-datos";

import type { AcademyNavItem } from "@/types/academy";

export const academyNavigation: AcademyNavItem[] = [
  { label: "Inicio", href: "/academy" },
  { label: "Mi programa", href: "/academy/programa" },
  { label: "Progreso", href: "/academy" },
  { label: "Configuración", href: "/academy" },
];
