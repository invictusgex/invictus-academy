import {
  AdminStudentsRepository,
  type AdminStudentEnrollmentRow,
  type AdminStudentModuleProgressRow,
  type AdminStudentProductRow,
  type AdminStudentProfileRow,
} from "@/lib/repositories/admin-students.repository";
import type {
  AdminStudent,
  AdminStudentCourse,
  AdminStudentEnrollment,
  AdminStudentModuleProgress,
  AdminStudentProgressSummary,
  AdminStudentsListInput,
  AdminStudentsListResult,
  AdminStudentsSortBy,
} from "@/lib/types/admin-students.types";
import { getAcademyProgram } from "@/lib/academy";

const defaultPageSize = 10;

function normalizePage(value: number | undefined) {
  return value && value > 0 ? Math.floor(value) : 1;
}

function normalizePageSize(value: number | undefined) {
  if (!value || value < 1) {
    return defaultPageSize;
  }

  return Math.min(Math.floor(value), 50);
}

function mapSortBy(sortBy: AdminStudentsSortBy | undefined) {
  if (sortBy === "email") {
    return "email";
  }

  if (sortBy === "name") {
    return "full_name";
  }

  return "created_at";
}

function normalizeProduct(
  product: AdminStudentProductRow | AdminStudentProductRow[] | null,
): AdminStudentCourse | null {
  const currentProduct = Array.isArray(product) ? product[0] : product;

  if (!currentProduct) {
    return null;
  }

  return {
    id: currentProduct.id,
    slug: currentProduct.slug,
    status: currentProduct.status,
    title: currentProduct.title,
  };
}

function mapEnrollment(row: AdminStudentEnrollmentRow): AdminStudentEnrollment {
  return {
    course: normalizeProduct(row.products),
    createdAt: row.created_at,
    id: row.id,
    productId: row.product_id,
    startsAt: row.starts_at,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

function mapModuleProgress(
  row: AdminStudentModuleProgressRow,
): AdminStudentModuleProgress {
  return {
    lastActivityAt: row.last_seen_at ?? row.updated_at,
    moduleKey: row.module_key,
    percentage: row.progress_percent,
    status: row.status,
  };
}

function getTotalModules(
  course: AdminStudentCourse | null,
  academyModuleCount: number,
) {
  if (course?.slug === "trading-basado-en-datos") {
    return academyModuleCount;
  }

  return 0;
}

function getProgressStatus(percentage: number): AdminStudentProgressSummary["status"] {
  if (percentage >= 100) {
    return "Completado";
  }

  if (percentage > 0) {
    return "En progreso";
  }

  return "No iniciado";
}

function getLatestDate(values: Array<string | null>) {
  return values.reduce<string | null>((latest, value) => {
    if (!value) {
      return latest;
    }

    if (!latest) {
      return value;
    }

    return new Date(value).getTime() > new Date(latest).getTime()
      ? value
      : latest;
  }, null);
}

function buildProgressSummaries(
  enrollments: AdminStudentEnrollment[],
  moduleProgressRows: AdminStudentModuleProgressRow[],
  academyModuleCount: number,
) {
  return enrollments.map<AdminStudentProgressSummary>((enrollment) => {
    const progressRows = moduleProgressRows.filter(
      (progressRow) => progressRow.product_id === enrollment.productId,
    );
    const totalModules = getTotalModules(enrollment.course, academyModuleCount);
    const completedModules = progressRows.filter(
      (progressRow) => progressRow.progress_percent >= 100,
    ).length;
    const progressSum = progressRows.reduce(
      (total, progressRow) => total + progressRow.progress_percent,
      0,
    );
    const percentage =
      totalModules > 0 ? Math.round(progressSum / totalModules) : 0;
    const lastActivityAt = getLatestDate(
      progressRows.map(
        (progressRow) => progressRow.last_seen_at ?? progressRow.updated_at,
      ),
    );

    return {
      completedModules,
      lastActivityAt,
      percentage: Math.max(0, Math.min(100, percentage)),
      productId: enrollment.productId,
      status: getProgressStatus(percentage),
      totalModules,
    };
  });
}

function buildStudent(
  profile: AdminStudentProfileRow,
  enrollmentRows: AdminStudentEnrollmentRow[],
  progressRows: AdminStudentModuleProgressRow[],
  academyModuleCount: number,
): AdminStudent {
  const enrollments = enrollmentRows.map(mapEnrollment);
  const moduleProgress = progressRows.map(mapModuleProgress);

  return {
    courses: enrollments,
    createdAt: profile.created_at,
    email: profile.email,
    enrollments,
    fullName: profile.full_name,
    id: profile.id,
    lastEnrollmentAt: getLatestDate(
      enrollments.map((enrollment) => enrollment.createdAt),
    ),
    moduleProgress,
    progress: buildProgressSummaries(
      enrollments,
      progressRows,
      academyModuleCount,
    ),
  };
}

export const AdminStudentsService = {
  async listStudents(
    input: AdminStudentsListInput = {},
  ): Promise<AdminStudentsListResult> {
    const page = normalizePage(input.page);
    const pageSize = normalizePageSize(input.pageSize);
    const from = (page - 1) * pageSize;
    const sortDirection = input.sortDirection === "asc" ? "asc" : "desc";
    const { count, profiles } = await AdminStudentsRepository.listProfiles({
      from,
      pageSize,
      query: input.query?.trim() ?? "",
      sortBy: mapSortBy(input.sortBy),
      sortDirection,
    });
    const profileIds = profiles.map((profile) => profile.id);
    const [enrollments, moduleProgress] = await Promise.all([
      AdminStudentsRepository.listEnrollments(profileIds),
      AdminStudentsRepository.listModuleProgress(profileIds),
    ]);
    const academyProgram = await getAcademyProgram();
    const academyModuleCount = academyProgram.modules.length;
    const students = profiles.map((profile) =>
      buildStudent(
        profile,
        enrollments.filter((enrollment) => enrollment.profile_id === profile.id),
        moduleProgress.filter(
          (progressRow) => progressRow.profile_id === profile.id,
        ),
        academyModuleCount,
      ),
    );

    return {
      page,
      pageSize,
      students,
      total: count,
      totalPages: Math.max(1, Math.ceil(count / pageSize)),
    };
  },

  async searchStudents(query: string) {
    return AdminStudentsService.listStudents({ query });
  },

  async getStudent(userId: string): Promise<AdminStudent | null> {
    const profile = await AdminStudentsRepository.getProfile(userId);

    if (!profile) {
      return null;
    }

    const [enrollments, moduleProgress] = await Promise.all([
      AdminStudentsRepository.listEnrollments([userId]),
      AdminStudentsRepository.listModuleProgress([userId]),
    ]);
    const academyProgram = await getAcademyProgram();

    return buildStudent(
      profile,
      enrollments,
      moduleProgress,
      academyProgram.modules.length,
    );
  },
};
