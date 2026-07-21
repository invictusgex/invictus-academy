import type {
  AcademyContentStatus,
  AcademyResourceType,
  ModuleAvailability,
} from "@/types/academy";

export const adminContentAvailabilityValues = [
  "available",
  "coming-soon",
] as const satisfies readonly ModuleAvailability[];

export const adminContentStatusValues = [
  "draft",
  "published",
  "archived",
] as const satisfies readonly AcademyContentStatus[];

export type AdminContentEditableModuleData = {
  availability: ModuleAvailability;
  description: string;
  estimatedDurationMinutes: number | null;
  learningObjectives: string[];
  overview: string;
  status: AcademyContentStatus;
  title: string;
};

export type AdminContentModuleValidationField =
  | "availability"
  | "description"
  | "estimatedDurationMinutes"
  | "general"
  | "learningObjectives"
  | "overview"
  | "status"
  | "title";

export type AdminContentModuleValidationError = {
  field: AdminContentModuleValidationField;
  message: string;
};

export type AdminContentModuleUpdateResult =
  | {
      module: AdminContentModule;
      ok: true;
    }
  | {
      errors: AdminContentModuleValidationError[];
      ok: false;
    };

export type AdminContentVideo = {
  durationSeconds: number | null;
  id: string;
  moduleId: string;
  position: number;
  provider: string | null;
  providerVideoId: string | null;
  status: AcademyContentStatus;
  thumbnailUrl: string | null;
  title: string;
};

export type AdminContentResource = {
  description: string;
  id: string;
  moduleId: string;
  position: number;
  resourceType: AcademyResourceType;
  status: AcademyContentStatus;
  title: string;
  url: string | null;
};

export type AdminContentModule = {
  availability: ModuleAvailability;
  description: string;
  estimatedDurationMinutes: number | null;
  id: string;
  learningObjectives: string[];
  overview: string;
  position: number;
  publishedAt: string | null;
  resourceCount: number;
  resources: AdminContentResource[];
  status: AcademyContentStatus;
  title: string;
  videoCount: number;
  videos: AdminContentVideo[];
};

export type AdminContentSummary = {
  archivedModules: number;
  draftModules: number;
  moduleCount: number;
  publishedModules: number;
  resourceCount: number;
  videoCount: number;
};

export type AdminContentProgram = {
  modules: AdminContentModule[];
  summary: AdminContentSummary;
};

export type AdminContentModuleDetail = {
  module: AdminContentModule | null;
};
