import type { AcademyNavItem, Course } from "@/types/academy";

export const academyNavigation: AcademyNavItem[] = [
  { label: "Inicio", href: "/academy" },
  { label: "Mi programa", href: "/academy/programa" },
  { label: "Progreso", href: "/academy" },
  { label: "Configuración", href: "/academy" },
];

export const provisionalCourse: Course = {
  id: "invictus-provisional",
  title: "Invictus Trading Academy",
  description:
    "Estructura provisional de aprendizaje. Los contenidos se definirán en una fase posterior.",
  modules: Array.from({ length: 7 }, (_, index) => ({
    id: String(index + 1),
    number: index + 1,
    title: `Módulo ${index + 1}`,
    description: "Contenido pendiente de definición",
    status: "No iniciado",
    video: {
      id: `modulo-${index + 1}-video`,
      title: `Video principal del Módulo ${index + 1}`,
      placeholder: "Área reservada para el video del módulo.",
    },
    resources: [],
  })),
};

export function getProvisionalCourse() {
  return provisionalCourse;
}

export function getAcademyModule(moduleId: string) {
  return provisionalCourse.modules.find(
    (academyModule) => academyModule.id === moduleId,
  );
}
