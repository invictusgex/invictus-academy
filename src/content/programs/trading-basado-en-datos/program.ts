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
  title: "Invictus Trading Academy",
  description:
    "Estructura provisional de aprendizaje. Los contenidos se definirán en una fase posterior.",
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
