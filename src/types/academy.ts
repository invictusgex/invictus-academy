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

export type Module = {
  id: string;
  number: number;
  title: string;
  description: string;
  overview: string;
  learningObjectives: string[];
  availability: ModuleAvailability;
  video: ModuleVideo;
  resources: ModuleResource[];
};

export type Course = {
  id: string;
  title: string;
  description: string;
  modules: Module[];
};
