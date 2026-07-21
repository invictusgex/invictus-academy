import type {
  AdminContentVideoValidationError,
  AdminContentVideoValidationField,
} from "@/lib/types/admin-content.types";

type AdminContentVideoValidationErrorsProps = {
  errors: AdminContentVideoValidationError[];
  field?: AdminContentVideoValidationField;
};

export function AdminContentVideoValidationErrors({
  errors,
  field,
}: AdminContentVideoValidationErrorsProps) {
  const visibleErrors = field
    ? errors.filter((error) => error.field === field)
    : errors;

  if (visibleErrors.length === 0) {
    return null;
  }

  return (
    <ul className="mt-2 grid gap-1 text-sm text-red-200">
      {visibleErrors.map((error) => (
        <li key={`${error.field}-${error.message}`}>{error.message}</li>
      ))}
    </ul>
  );
}
