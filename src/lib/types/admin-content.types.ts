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

export const adminContentVideoProviderValues = [
  "youtube",
  "vimeo",
  "bunny",
  "external",
] as const;

export type AdminContentVideoProvider =
  (typeof adminContentVideoProviderValues)[number];

export const adminContentResourceTypeValues = [
  "pdf",
  "link",
  "template",
  "downloadable",
  "other",
] as const satisfies readonly AcademyResourceType[];

export type AdminContentEditableModuleData = {
  availability: ModuleAvailability;
  description: string;
  estimatedDurationMinutes: number | null;
  learningObjectives: string[];
  overview: string;
  status: AcademyContentStatus;
  thumbnailUrl: string;
  title: string;
};

export type AdminContentEditableVideoData = {
  durationSeconds: number | null;
  position: number | null;
  provider: AdminContentVideoProvider;
  providerVideoId: string;
  status: AcademyContentStatus;
  thumbnailUrl: string;
  title: string;
};

export type AdminContentEditableResourceData = {
  description: string;
  position: number | null;
  resourceType: AcademyResourceType;
  status: AcademyContentStatus;
  storagePath: string;
  title: string;
  url: string;
};

export type AdminContentModuleValidationField =
  | "availability"
  | "description"
  | "estimatedDurationMinutes"
  | "general"
  | "learningObjectives"
  | "overview"
  | "status"
  | "thumbnailUrl"
  | "title";

export type AdminContentVideoValidationField =
  | "durationSeconds"
  | "general"
  | "position"
  | "provider"
  | "providerVideoId"
  | "status"
  | "thumbnailUrl"
  | "title";

export type AdminContentResourceValidationField =
  | "description"
  | "general"
  | "position"
  | "resourceType"
  | "status"
  | "storagePath"
  | "title"
  | "url";

export type AdminContentModuleValidationError = {
  field: AdminContentModuleValidationField;
  message: string;
};

export type AdminContentVideoValidationError = {
  field: AdminContentVideoValidationField;
  message: string;
};

export type AdminContentResourceValidationError = {
  field: AdminContentResourceValidationField;
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

export type AdminContentVideoMutationResult =
  | {
      module: AdminContentModule;
      ok: true;
    }
  | {
      errors: AdminContentVideoValidationError[];
      ok: false;
    };

export type AdminContentResourceMutationResult =
  | {
      module: AdminContentModule;
      ok: true;
    }
  | {
      errors: AdminContentResourceValidationError[];
      ok: false;
    };

export type AdminContentVideo = {
  durationSeconds: number | null;
  id: string;
  moduleId: string;
  position: number;
  provider: AdminContentVideoProvider | null;
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
  storagePath: string | null;
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
  thumbnailUrl: string | null;
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
