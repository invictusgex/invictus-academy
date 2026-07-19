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

export type Module = {
  id: string;
  number: number;
  title: string;
  description: string;
  status: "No iniciado";
  video: ModuleVideo;
  resources: ModuleResource[];
};

export type Course = {
  id: string;
  title: string;
  description: string;
  modules: Module[];
};
