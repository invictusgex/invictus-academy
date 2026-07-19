export type AcademyNavItem = {
  label: string;
  href: string;
};

export type ModuleVideo = {
  id: string;
  title: string;
  placeholder: string;
};

export type ModuleResource = {
  id: string;
  title: string;
};

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
  id: string;
  number: number;
  title: string;
  description: string;
  overview: string;
  learningObjectives: string[];
  availability: ModuleAvailability;
  videos: ModuleVideo[];
  resources: ModuleResource[];
};

export type Course = {
  id: string;
  title: string;
  description: string;
  modules: Module[];
};
