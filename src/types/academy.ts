export type AcademyNavItem = {
  label: string;
  href: string;
};

export type ModuleVideo = {
  description?: string;
  durationSeconds?: number | null;
  id: string;
  placeholder: string;
  provider?: string | null;
  providerVideoId?: string | null;
  status?: AcademyContentStatus;
  thumbnailUrl?: string | null;
  title: string;
};

export type ModuleResource = {
  description?: string;
  id: string;
  resourceType?: AcademyResourceType;
  status?: AcademyContentStatus;
  storagePath?: string | null;
  title: string;
  url?: string | null;
};

export type AcademyContentStatus = "draft" | "published" | "archived";

export type AcademyResourceType =
  | "pdf"
  | "link"
  | "template"
  | "downloadable"
  | "other";

export type ModuleAvailability = "available" | "coming-soon";

export type VideoProgressStatus =
  | "not-started"
  | "in-progress"
  | "completed";

export type StoredVideoProgress = {
  status: VideoProgressStatus;
  updatedAt: string;
};

export type AcademyProgressState = {
  version: 1;
  programs: Record<
    string,
    {
      modules: Record<
        string,
        {
          videos: Record<string, StoredVideoProgress>;
        }
      >;
    }
  >;
};

export type Module = {
  createdAt?: string;
  id: string;
  estimatedDurationMinutes?: number | null;
  number: number;
  title: string;
  description: string;
  overview: string;
  learningObjectives: string[];
  availability: ModuleAvailability;
  status?: AcademyContentStatus;
  thumbnailUrl?: string | null;
  updatedAt?: string;
  videos: ModuleVideo[];
  resources: ModuleResource[];
};

export type Course = {
  id: string;
  title: string;
  description: string;
  modules: Module[];
};
