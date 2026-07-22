import { AdminAccessManager } from "@/components/admin/access/AdminAccessManager";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";

export function AdminAccessPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Accesos" title="Gestion de accesos">
        Concede, revoca o reactiva enrollments de alumnos autorizados sin
        eliminar historial administrativo.
      </AdminPageHeader>

      <AdminAccessManager />
    </div>
  );
}
