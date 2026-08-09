import { headers } from "next/headers";

import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { SystemVersionCopyButton } from "@/components/admin/system/SystemVersionCopyButton";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import {
  formatSystemEnvironment,
  formatSystemVersionForClipboard,
  formatVersionStatusLabel,
  getSystemVersionStatus,
  type VersionComparisonStatus,
} from "@/lib/services/system-version.service";

const adminCards = [
  {
    title: "Alumnos",
    description: "Consulta y seguimiento administrativo de alumnos.",
  },
  {
    title: "Enrollments",
    description: "Preparado para revisar accesos al programa.",
  },
  {
    title: "Productos",
    description: "Base futura para administrar productos formativos.",
  },
  {
    title: "Progreso",
    description: "Vista futura para supervisar avance académico.",
  },
];

function getVersionStatusTone(status: VersionComparisonStatus) {
  if (status === "up_to_date") {
    return "success";
  }

  if (status === "update_pending" || status === "deployed_version_unknown") {
    return "warning";
  }

  return "neutral";
}

export default async function AdminPage() {
  await requireAdminServerContext();

  const requestHeaders = await headers();
  const systemStatus = await getSystemVersionStatus(
    requestHeaders.get("host") ?? undefined,
  );
  const copyValue = formatSystemVersionForClipboard(systemStatus);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Resumen administrativo
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Panel administrativo
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
          Gestión de alumnos, accesos y productos de Invictus GEX.
        </p>
      </section>

      <section
        aria-labelledby="system-status-heading"
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 sm:p-6"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
              Estado del sistema
            </p>
            <h2
              className="mt-3 text-2xl font-semibold text-white"
              id="system-status-heading"
            >
              Versión de la aplicación
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Información de despliegue para confirmar qué versión de Invictus
              GEX está ejecutando esta instancia.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <AdminStatusBadge tone={getVersionStatusTone(systemStatus.status)}>
              {formatVersionStatusLabel(systemStatus.status)}
            </AdminStatusBadge>
            <SystemVersionCopyButton value={copyValue} />
          </div>
        </div>

        <dl className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
            <dt className="text-xs font-semibold tracking-[0.16em] text-[var(--color-text-muted)] uppercase">
              Estado
            </dt>
            <dd className="mt-2 text-base font-semibold text-white">
              {formatSystemEnvironment(systemStatus.deployed.environment)}
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
            <dt className="text-xs font-semibold tracking-[0.16em] text-[var(--color-text-muted)] uppercase">
              Versión
            </dt>
            <dd className="mt-2 text-base font-semibold text-white">
              {systemStatus.deployed.version}
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
            <dt className="text-xs font-semibold tracking-[0.16em] text-[var(--color-text-muted)] uppercase">
              Commit desplegado
            </dt>
            <dd className="mt-2 break-all text-base font-semibold text-white">
              {systemStatus.deployed.commit}
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
            <dt className="text-xs font-semibold tracking-[0.16em] text-[var(--color-text-muted)] uppercase">
              Último en GitHub
            </dt>
            <dd className="mt-2 break-all text-base font-semibold text-white">
              {systemStatus.github?.shortSha ?? "No configurado"}
            </dd>
            {systemStatus.github?.message ? (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                {systemStatus.github.message}
              </p>
            ) : null}
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
            <dt className="text-xs font-semibold tracking-[0.16em] text-[var(--color-text-muted)] uppercase">
              Construido
            </dt>
            <dd className="mt-2 break-words text-base font-semibold text-white">
              {systemStatus.deployed.buildTime}
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
            <dt className="text-xs font-semibold tracking-[0.16em] text-[var(--color-text-muted)] uppercase">
              Dominio
            </dt>
            <dd className="mt-2 break-all text-base font-semibold text-white">
              {systemStatus.deployed.domain}
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
            <dt className="text-xs font-semibold tracking-[0.16em] text-[var(--color-text-muted)] uppercase">
              Verificado
            </dt>
            <dd className="mt-2 break-words text-base font-semibold text-white">
              {systemStatus.checkedAt}
            </dd>
            {systemStatus.error ? (
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                GitHub no respondió correctamente. La versión desplegada local
                sigue visible.
              </p>
            ) : null}
          </div>
        </dl>
      </section>

      <section
        aria-label="Áreas administrativas provisionales"
        className="grid gap-4 md:grid-cols-2"
      >
        {adminCards.map((card) => (
          <article
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 sm:p-6"
            key={card.title}
          >
            <h2 className="text-xl font-semibold text-white">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              {card.description}
            </p>
            <p className="mt-5 text-xs font-semibold tracking-[0.16em] text-[var(--color-text-muted)] uppercase">
              Próximamente
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
