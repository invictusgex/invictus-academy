import type {
  AcademyContentStatus,
  AcademyResourceType,
  ModuleAvailability,
} from "@/types/academy";

export type AcademyModuleContentRow = {
  id: string;
  product_id: string;
  module_key: string;
  module_order: number;
  title: string;
  description: string;
  overview: string;
  learning_objectives: unknown;
  estimated_duration_minutes: number | null;
  thumbnail_url: string | null;
  availability: ModuleAvailability;
  status: AcademyContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AcademyModuleVideoRow = {
  id: string;
  module_id: string;
  video_key: string;
  video_order: number;
  title: string;
  description: string;
  provider: string | null;
  provider_video_id: string | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  placeholder: string;
  status: AcademyContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AcademyResourceRow = {
  id: string;
  module_id: string;
  resource_key: string;
  resource_order: number;
  title: string;
  description: string;
  resource_type: AcademyResourceType;
  url: string | null;
  storage_path: string | null;
  metadata: unknown;
  status: AcademyContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AcademyContentProgramRows = {
  modules: AcademyModuleContentRow[];
  resources: AcademyResourceRow[];
  videos: AcademyModuleVideoRow[];
};
