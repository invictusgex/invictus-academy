type AdminLoadingSkeletonProps = {
  rows?: number;
};

export function AdminLoadingSkeleton({ rows = 4 }: AdminLoadingSkeletonProps) {
  return (
    <div className="grid gap-3 p-5" role="status">
      <span className="sr-only">Cargando contenido administrativo</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          className="h-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)]"
          key={index}
        />
      ))}
    </div>
  );
}
