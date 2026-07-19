import type { AcademyLesson, AcademyModule, AcademyNavItem } from "@/types/academy";

export const academyNavigation: AcademyNavItem[] = [
  { label: "Inicio", href: "/academy" },
  { label: "Mi programa", href: "/academy/programa" },
  { label: "Progreso", href: "/academy" },
  { label: "Configuración", href: "/academy" },
];

export const academyModules: AcademyModule[] = Array.from(
  { length: 7 },
  (_, index) => ({
    id: String(index + 1),
    moduleNumber: index + 1,
    title: `Módulo ${index + 1}`,
    description: "Contenido pendiente de definición",
    status: "No iniciado",
  }),
);

export const academyLessons: AcademyLesson[] = Array.from(
  { length: 10 },
  (_, index) => ({
    id: String(index + 1),
    lessonNumber: index + 1,
    title: `Clase ${index + 1}`,
  }),
);

export function getAcademyModule(moduleId: string) {
  return academyModules.find((module) => module.id === moduleId);
}

export function getAcademyLesson(lessonId: string) {
  return academyLessons.find((lesson) => lesson.id === lessonId);
}
