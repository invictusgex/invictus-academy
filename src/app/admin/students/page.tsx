import { AdminStudentsPage } from "@/components/admin/students/AdminStudentsPage";
import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { AdminStudentManagementService } from "@/lib/services/admin-student-management.service";
import type { AdminStudentsSortBy } from "@/lib/types/admin-students.types";

type AdminStudentsRouteProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

function getPage(value: string | undefined) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function getSortBy(value: string | undefined): AdminStudentsSortBy {
  return value === "email" || value === "name" ? value : "createdAt";
}

export default async function AdminStudentsRoute({
  searchParams,
}: AdminStudentsRouteProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const page = getPage(getSearchParam(resolvedSearchParams, "page"));
  const query = getSearchParam(resolvedSearchParams, "query")?.trim() ?? "";
  const sortBy = getSortBy(getSearchParam(resolvedSearchParams, "sortBy"));
  const { supabase } = await requireAdminServerContext();
  const result = await AdminStudentManagementService.listStudents(
    {
      page,
      query,
      sortBy,
    },
    supabase,
  );

  return (
    <AdminStudentsPage
      query={query}
      result={result}
      sortBy={sortBy}
    />
  );
}
