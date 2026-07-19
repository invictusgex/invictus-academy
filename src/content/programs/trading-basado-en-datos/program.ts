import type { Course } from "@/types/academy";

import { module01 } from "./modules/module-01";
import { module02 } from "./modules/module-02";
import { module03 } from "./modules/module-03";
import { module04 } from "./modules/module-04";
import { module05 } from "./modules/module-05";
import { module06 } from "./modules/module-06";
import { module07 } from "./modules/module-07";

export const academyProgram: Course = {
  id: "invictus-provisional",
  title: "Trading Basado en Datos",
  description:
    "Programa de formación profesional orientado a interpretar estructura, liquidez, volumen, Order Flow y exposición de gamma para construir decisiones basadas en evidencia.",
  modules: [
    module01,
    module02,
    module03,
    module04,
    module05,
    module06,
    module07,
  ],
};

export function getAcademyProgram() {
  return academyProgram;
}

export function getAcademyModules() {
  return academyProgram.modules;
}

export function getAcademyModule(moduleId: string) {
  return getAcademyModules().find(
    (academyModule) => academyModule.id === moduleId,
  );
}
