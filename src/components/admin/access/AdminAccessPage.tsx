import { AdminAccessManager } from "@/components/admin/access/AdminAccessManager";

export function AdminAccessPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Accesos
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Gestión de accesos
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
          Concede, revoca o reactiva enrollments de alumnos autorizados sin
          eliminar historial administrativo.
        </p>
      </section>

      <AdminAccessManager />
    </div>
  );
}
