import type { AcademyNavItem } from "@/types/academy";
import { liveRoom } from "@/content/live-room";
import { AcademyContentService } from "@/lib/services/academy-content.service";

export const getAcademyProgram = AcademyContentService.getProgram;
export const getAcademyModules = AcademyContentService.getModules;
export const getAcademyModule = AcademyContentService.getModule;
export const getAcademyModuleVideos = AcademyContentService.getModuleVideos;
export const getAcademyModuleResources =
  AcademyContentService.getModuleResources;

export const academyNavigation: AcademyNavItem[] = [
  { label: "Mi mentoría", href: "/academy" },
  { label: "Agenda de sesiones", href: "/academy/mentoria" },
  { label: "Inicio", href: "/" },
  { label: "Sala en vivo", href: liveRoom.publicHref },
];
