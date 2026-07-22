import type {
  AdminScenarioValidationError,
  AdminScenarioValidationField,
} from "@/lib/types/scenario-library.types";

type AdminScenarioValidationErrorsProps = {
  errors: AdminScenarioValidationError[];
  field: AdminScenarioValidationField;
};

export function AdminScenarioValidationErrors({
  errors,
  field,
}: AdminScenarioValidationErrorsProps) {
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
