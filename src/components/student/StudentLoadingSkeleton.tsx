import { classNames } from "@/utils/class-names";

type StudentLoadingSkeletonProps = {
  columns?: 2 | 3 | 4;
  rows?: number;
};

export function StudentLoadingSkeleton({
  columns = 3,
  rows = 3,
}: StudentLoadingSkeletonProps) {
  return (
    <div
      className={classNames(
        "grid gap-4",
        columns === 2 && "md:grid-cols-2",
        columns === 3 && "md:grid-cols-2 xl:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 xl:grid-cols-4",
      )}
      role="status"
    >
      <span className="sr-only">Cargando contenido del alumno</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          className="min-h-36 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)]"
          key={index}
        />
      ))}
    </div>
  );
}
