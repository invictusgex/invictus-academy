import Link from "next/link";

import { adminStudentsConfig } from "@/config/admin-students";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import {
  formatAdminDate,
  formatAdminDateTime,
  formatEnrollmentStatus,
} from "@/components/admin/ui/admin-formatters";
import type {
  AdminStudentEnrollmentDetail,
  AdminStudentManagementDetail,
} from "@/lib/types/admin-student-management.types";

type AdminStudentDetailPageProps = {
  detail: AdminStudentManagementDetail;
};

function getDisplayName(fullName: string | null) {
  return fullName?.trim() || "Alumno sin nombre";
}

function getRuleLabel(key: string, fallback: string) {
  return (
    adminStudentsConfig.workflowLabels[
      key as keyof typeof adminStudentsConfig.workflowLabels
    ] ?? fallback
  );
}

function formatMoney(amountMinor: number | null, currency: string) {
  if (amountMinor === null) {
    return "Sin importe";
  }

  return new Intl.NumberFormat("es", {
    currency,
    style: "currency",
  }).format(amountMinor / 100);
}

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(Math.round(sizeBytes / 1024), 1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusTone(status: string) {
  if (status === "active" || status === "paid" || status === "Completado") {
    return "success";
  }

  if (
    status === "revoked" ||
    status === "failed" ||
    status === "canceled" ||
    status === "disputed"
  ) {
    return "danger";
  }

  if (status === "expired" || status === "pending") {
    return "warning";
  }

  return "neutral";
}

function MentorshipPreparationSection({
  detail,
}: {
  detail: AdminStudentEnrollmentDetail;
}) {
  const preparation = detail.mentorshipPreparation;

  if (!preparation) {
    return null;
  }

  return (
    <section className="mt-5 min-w-0 rounded-xl border border-[var(--color-border)] p-4">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h4 className="text-base font-semibold text-white">
            Preparación de mentoría
          </h4>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Consulta el recorrido del participante antes de su sesión
            individual.
          </p>
        </div>
        <AdminStatusBadge
          tone={preparation.requirementsSatisfied ? "success" : "warning"}
        >
          {preparation.status}
        </AdminStatusBadge>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg bg-black/20 p-3">
          <dt className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
            Programa
          </dt>
          <dd className="mt-2 break-words text-sm font-semibold text-white">
            {detail.enrollment.course?.title ?? "Producto sin titulo"}
          </dd>
        </div>
        <div className="rounded-lg bg-black/20 p-3">
          <dt className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
            Progreso
          </dt>
          <dd className="mt-2 text-sm font-semibold text-white">
            {preparation.completionPercent}% · {preparation.completedModules}/
            {preparation.publishedModules} módulos
          </dd>
        </div>
        <div className="rounded-lg bg-black/20 p-3">
          <dt className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
            Reflexiónes
          </dt>
          <dd className="mt-2 text-sm font-semibold text-white">
            {preparation.moduleReflectionCount} módulos ·{" "}
            {preparation.totalAttachments} imágenes
          </dd>
        </div>
        <div className="rounded-lg bg-black/20 p-3">
          <dt className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
            Practica
          </dt>
          <dd className="mt-2 text-sm font-semibold text-white">
            {preparation.tradingDays}/{preparation.requiredTradingDays} días
          </dd>
        </div>
      </dl>

      <div className="mt-5 grid gap-4">
        {preparation.modules.map((moduleItem) => (
          <article
            className="min-w-0 rounded-lg border border-[var(--color-border)] bg-black/20 p-4"
            key={moduleItem.moduleKey}
          >
            <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
                  Modulo {moduleItem.order}
                </p>
                <h5 className="mt-2 break-words text-sm font-semibold text-white">
                  {moduleItem.title}
                </h5>
                <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                  Ultima actualizacion:{" "}
                  {formatAdminDateTime(moduleItem.reflectionUpdatedAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <AdminStatusBadge
                  tone={moduleItem.completed ? "success" : "warning"}
                >
                  {moduleItem.completed ? "Completado" : "Pendiente"}
                </AdminStatusBadge>
                <AdminStatusBadge
                  tone={moduleItem.hasReflection ? "success" : "warning"}
                >
                  {moduleItem.hasReflection
                    ? "Con reflexión"
                    : "Sin reflexión"}
                </AdminStatusBadge>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-[var(--color-border)] p-3">
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--color-text-secondary)]">
                {moduleItem.reflectionContent ??
                  "El participante todavía no documento una reflexión en este módulo."}
              </p>
            </div>

            <div className="mt-4 flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
                  Imágenes adjuntas
                </p>
                <div className="mt-3 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {moduleItem.attachments.map((attachment) => (
                    <figure
                      className="min-w-0 overflow-hidden rounded-lg border border-[var(--color-border)] bg-black/30"
                      key={attachment.id}
                    >
                      {attachment.signedUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt={`Adjunto ${attachment.originalName}`}
                          className="aspect-video w-full object-cover"
                          src={attachment.signedUrl}
                        />
                      ) : (
                        <div className="flex aspect-video items-center justify-center px-3 text-center text-xs text-[var(--color-text-muted)]">
                          Vista no disponible
                        </div>
                      )}
                      <figcaption className="min-w-0 p-2 text-xs text-[var(--color-text-secondary)]">
                        <span className="block truncate">
                          {attachment.originalName}
                        </span>
                        <span>{formatFileSize(attachment.sizeBytes)}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
                {moduleItem.attachments.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                    No hay imágenes adjuntas en este modulo.
                  </p>
                ) : null}
              </div>

              <Link
                className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-white/[0.03] sm:w-auto"
                href={`/admin/content/modules/${moduleItem.moduleId}`}
              >
                Ver contenido
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-[var(--color-border)] p-4">
        <h5 className="text-sm font-semibold text-white">
          Puntos pendientes antes de la mentoría
        </h5>
        {preparation.pendingItems.length > 0 ? (
          <ul className="mt-3 grid gap-2 text-sm text-[var(--color-text-secondary)]">
            {preparation.pendingItems.map((item) => (
              <li className="break-words" key={item}>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            No hay puntos pendientes objetivos registrados.
          </p>
        )}
      </div>
    </section>
  );
}

function EnrollmentDetailCard({
  detail,
}: {
  detail: AdminStudentEnrollmentDetail;
}) {
  const moduleProgress = detail.workflow
    ? `${detail.workflow.completedModules}/${detail.workflow.publishedModules}`
    : "Sin workflow";

  return (
    <article className="min-w-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="break-words text-lg font-semibold text-white">
            {detail.enrollment.course?.title ?? "Producto sin titulo"}
          </h3>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Enrollment: {formatAdminDateTime(detail.enrollment.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminStatusBadge tone={getStatusTone(detail.enrollment.status)}>
            {formatEnrollmentStatus(detail.enrollment.status)}
          </AdminStatusBadge>
          <AdminStatusBadge
            tone={detail.session101.unlocked ? "success" : "warning"}
          >
            {`Sesión 101 ${detail.session101.label}`}
          </AdminStatusBadge>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[var(--color-border)] p-4">
          <dt className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
            Modulos
          </dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {moduleProgress}
          </dd>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] p-4">
          <dt className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
            Formularios
          </dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {detail.formSubmissions.length}/{detail.formDefinitions.length}
          </dd>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] p-4">
          <dt className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
            Trading days
          </dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {detail.tradingDays.length}
          </dd>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] p-4">
          <dt className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
            Compras
          </dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {detail.purchases.length}
          </dd>
        </div>
      </dl>

      <MentorshipPreparationSection detail={detail} />

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-[var(--color-border)] p-4">
          <h4 className="text-sm font-semibold text-white">
            Learning Workflow
          </h4>
          <div className="mt-4 grid gap-3">
            {detail.rules.map((rule) => (
              <div
                className="flex min-w-0 flex-col gap-2 rounded-lg bg-black/20 p-3 sm:flex-row sm:items-center sm:justify-between"
                key={rule.key}
              >
                <span className="min-w-0 break-words text-sm text-white">
                  {getRuleLabel(rule.key, rule.label)}
                </span>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {String(rule.currentValue ?? 0)} /{" "}
                  {String(rule.requiredValue ?? 0)}
                </span>
              </div>
            ))}
            {detail.rules.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">
                No hay evaluacion de workflow para este enrollment.
              </p>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-[var(--color-border)] p-4">
          <h4 className="text-sm font-semibold text-white">
            Formularios requeridos
          </h4>
          <div className="mt-4 grid gap-3">
            {detail.formDefinitions.map((definition) => {
              const submission = detail.formSubmissions.find(
                (currentSubmission) =>
                  currentSubmission.formDefinitionId === definition.id,
              );

              return (
                <div
                  className="min-w-0 rounded-lg bg-black/20 p-3"
                  key={definition.id}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="break-words text-sm font-medium text-white">
                      {definition.title}
                    </span>
                    <AdminStatusBadge tone={submission ? "success" : "warning"}>
                      {submission ? "Enviado" : "Pendiente"}
                    </AdminStatusBadge>
                  </div>
                  <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                    {submission
                      ? `Enviado: ${formatAdminDateTime(submission.submittedAt)}`
                      : "Sin submission"}
                  </p>
                </div>
              );
            })}
            {detail.formDefinitions.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">
                No hay formularios requeridos publicados para este producto.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-[var(--color-border)] p-4">
          <h4 className="text-sm font-semibold text-white">Dias de trading</h4>
          <div className="mt-4 grid gap-2">
            {detail.tradingDays.map((day) => (
              <div
                className="min-w-0 rounded-lg bg-black/20 p-3 text-sm"
                key={day.id}
              >
                <p className="font-medium text-white">
                  {formatAdminDate(day.tradingDate)}
                </p>
                <p className="mt-1 break-words text-[var(--color-text-secondary)]">
                  {day.notes ?? "Sin notas"}
                </p>
              </div>
            ))}
            {detail.tradingDays.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">
                No hay días de trading registrados.
              </p>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-[var(--color-border)] p-4">
          <h4 className="text-sm font-semibold text-white">Purchases</h4>
          <div className="mt-4 grid gap-2">
            {detail.purchases.map((purchase) => (
              <div
                className="min-w-0 rounded-lg bg-black/20 p-3 text-sm"
                key={purchase.id}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="break-all font-medium text-white">
                    {purchase.purchaseNumber}
                  </span>
                  <AdminStatusBadge tone={getStatusTone(purchase.status)}>
                    {purchase.status}
                  </AdminStatusBadge>
                </div>
                <p className="mt-2 text-[var(--color-text-secondary)]">
                  {formatMoney(purchase.amountTotalMinor, purchase.currency)} -
                  {" "}
                  {formatAdminDateTime(purchase.createdAt)}
                </p>
              </div>
            ))}
            {detail.purchases.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">
                No hay purchases relacionados con este producto.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export function AdminStudentDetailPage({
  detail,
}: AdminStudentDetailPageProps) {
  const student = detail.student;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={
          <Link
            className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-white/[0.03] sm:w-auto"
            href="/admin/students"
          >
            Volver al listado
          </Link>
        }
        eyebrow="Alumno"
        title={getDisplayName(student.fullName)}
      >
        Vista server-side de perfil, enrollments, progreso academico, workflow,
        formularios, trading days y purchases.
      </AdminPageHeader>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-white">Perfil basico</h2>
        <dl className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4">
            <dt className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
              Email
            </dt>
            <dd className="mt-2 break-all text-sm text-white">
              {student.email ?? "No disponible"}
            </dd>
          </div>
          <div className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4">
            <dt className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
              Alta
            </dt>
            <dd className="mt-2 text-sm text-white">
              {formatAdminDateTime(student.createdAt)}
            </dd>
          </div>
          <div className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4">
            <dt className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
              Ultimo enrollment
            </dt>
            <dd className="mt-2 text-sm text-white">
              {formatAdminDateTime(student.lastEnrollmentAt)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-white">
          Estado academico y comercial
        </h2>
        <div className="mt-5 grid gap-5">
          {detail.enrollmentDetails.map((enrollmentDetail) => (
            <EnrollmentDetailCard
              detail={enrollmentDetail}
              key={enrollmentDetail.enrollment.id}
            />
          ))}
          {detail.enrollmentDetails.length === 0 ? (
            <AdminEmptyState
              description="Este alumno todavía no tiene enrollments asociados."
              title="Sin enrollments"
            />
          ) : null}
        </div>
      </section>

      {detail.purchases.length > 0 ? (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-white">
            Purchases del alumno
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {detail.purchases.map((purchase) => (
              <article
                className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4"
                key={purchase.id}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="break-all text-sm font-semibold text-white">
                    {purchase.purchaseNumber}
                  </h3>
                  <AdminStatusBadge tone={getStatusTone(purchase.status)}>
                    {purchase.status}
                  </AdminStatusBadge>
                </div>
                <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                  {formatMoney(purchase.amountTotalMinor, purchase.currency)} -
                  {" "}
                  {formatAdminDateTime(purchase.createdAt)}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
