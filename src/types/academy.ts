export type AcademyNavItem = {
  label: string;
  href: string;
};

export type AcademyModule = {
  id: string;
  moduleNumber: number;
  title: string;
  description: string;
  status: "No iniciado";
};

export type AcademyLesson = {
  id: string;
  lessonNumber: number;
  title: string;
};
