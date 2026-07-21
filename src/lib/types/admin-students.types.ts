export type AdminStudentEnrollmentStatus = "active" | "revoked" | "expired";

export type AdminStudentCourse = {
  id: string;
  slug: string;
  status: string;
  title: string;
};

export type AdminStudentEnrollment = {
  course: AdminStudentCourse | null;
  createdAt: string;
  id: string;
  productId: string;
  startsAt: string;
  status: AdminStudentEnrollmentStatus;
  updatedAt: string;
};

export type AdminStudentProgressSummary = {
  completedModules: number;
  lastActivityAt: string | null;
  percentage: number;
  productId: string;
  status: "No iniciado" | "En progreso" | "Completado";
  totalModules: number;
};

export type AdminStudentModuleProgress = {
  lastActivityAt: string | null;
  moduleKey: string;
  percentage: number;
  status: string;
};

export type AdminStudent = {
  courses: AdminStudentEnrollment[];
  createdAt: string;
  email: string | null;
  enrollments: AdminStudentEnrollment[];
  fullName: string | null;
  id: string;
  lastEnrollmentAt: string | null;
  moduleProgress: AdminStudentModuleProgress[];
  progress: AdminStudentProgressSummary[];
};

export type AdminStudentsSortBy = "createdAt" | "email" | "name";

export type AdminStudentsListInput = {
  page?: number;
  pageSize?: number;
  query?: string;
  sortBy?: AdminStudentsSortBy;
  sortDirection?: "asc" | "desc";
};

export type AdminStudentsListResult = {
  page: number;
  pageSize: number;
  students: AdminStudent[];
  total: number;
  totalPages: number;
};
