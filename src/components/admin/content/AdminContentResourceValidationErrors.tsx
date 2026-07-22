import type {
  AdminContentResourceValidationError,
  AdminContentResourceValidationField,
} from "@/lib/types/admin-content.types";

type AdminContentResourceValidationErrorsProps = {
  errors: AdminContentResourceValidationError[];
  field: AdminContentResourceValidationField;
};

export function AdminContentResourceValidationErrors({
  errors,
  field,
}: AdminContentResourceValidationErrorsProps) {
  const fieldErrors = errors.filter((error) => error.field === field);

  if (fieldErrors.length === 0) {
    return null;
  }

  return (
    <ul className="grid gap-1 text-sm text-red-200">
      {fieldErrors.map((error) => (
        <li key={error.message}>{error.message}</li>
      ))}
    </ul>
  );
}
