import type { Module } from "@/types/academy";

export const module01: Module = {
  id: "1",
  number: 1,
  title: "Módulo 1",
  description: "Contenido pendiente de definición",
  overview:
    "En este módulo desarrollarás los conceptos fundamentales correspondientes a esta etapa del programa.",
  learningObjectives: [
    "Objetivo de aprendizaje 1",
    "Objetivo de aprendizaje 2",
    "Objetivo de aprendizaje 3",
    "Objetivo de aprendizaje 4",
  ],
  availability: "available",
  videos: [
    {
      id: "modulo-1-video",
      title: "Fundamentos del Mercado Basado en Datos",
      description:
        "Contenido exclusivo para alumnos de Invictus GEX Academy.\n\nQueda prohibida su distribución, reproducción o comercialización sin autorización expresa.\n\n© Invictus GEX. Todos los derechos reservados.",
      placeholder: "",
      provider: "youtube",
      providerVideoId: "qu3VkXQMbfQ",
    },
  ],
  resources: [],
};
