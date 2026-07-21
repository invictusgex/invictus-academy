"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { AdminEnrollmentsService } from "@/lib/services/admin-enrollments.service";
import { AdminStudentsService } from "@/lib/services/admin-students.service";
import type {
  AdminAssignableProduct,
  AdminEnrollment,
} from "@/lib/types/admin-enrollments.types";
import type { AdminStudent } from "@/lib/types/admin-students.types";

type AdminAccessManagerProps = {
  initialStudentId?: string;
  initialStudentLabel?: string;
  showSearch?: boolean;
};

type MutationIntent =
  | {
      enrollmentId: string;
      type: "reactivate" | "revoke" | "update-expiration";
    }
  | {
      productId: string;
      type: "grant";
    };

function formatDate(value: string | null) {
  if (!value) {
    return "Sin vencimiento";
  }

  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getDateInputValue(value: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function getStudentLabel(student: AdminStudent) {
  const name = student.fullName?.trim() || "Alumno sin nombre";

  return student.email ? `${name} · ${student.email}` : name;
}

function getTomorrowInputValue() {
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  return tomorrow.toISOString().slice(0, 10);
}

function toExpirationIso(value: string) {
  if (!value) {
    return null;
  }

  return new Date(`${value}T23:59:59`).toISOString();
}

export function AdminAccessManager({
  initialStudentId,
  initialStudentLabel,
  showSearch = true,
}: AdminAccessManagerProps) {
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([]);
  const [error, setError] = useState("");
  const [expirationByProduct, setExpirationByProduct] = useState<
    Record<string, string>
  >({});
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [mutation, setMutation] = useState<MutationIntent | null>(null);
  const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);
  const [products, setProducts] = useState<AdminAssignableProduct[]>([]);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AdminStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState(
    initialStudentId ?? "",
  );
  const [selectedStudentLabel, setSelectedStudentLabel] = useState(
    initialStudentLabel ?? "",
  );
  const [success, setSuccess] = useState("");

  const minExpirationDate = useMemo(() => getTomorrowInputValue(), []);

  const refreshEnrollments = useCallback(
    async (userId = selectedStudentId) => {
      if (!userId) {
        setEnrollments([]);
        return;
      }

      setLoadingEnrollments(true);
      setError("");

      try {
        const nextEnrollments =
          await AdminEnrollmentsService.getStudentEnrollments(userId);

        setEnrollments(nextEnrollments);
        setExpirationByProduct((currentValues) => {
          const nextValues = { ...currentValues };

          nextEnrollments.forEach((enrollment) => {
            nextValues[enrollment.productId] = getDateInputValue(
              enrollment.expiresAt,
            );
          });

          return nextValues;
        });
      } catch {
        setError("No fue posible cargar los accesos del alumno.");
      } finally {
        setLoadingEnrollments(false);
      }
    },
    [selectedStudentId],
  );

  useEffect(() => {
    let isActive = true;
    const timeoutId = window.setTimeout(() => {
      async function loadProducts() {
        setLoadingProducts(true);

        try {
          const nextProducts =
            await AdminEnrollmentsService.listAssignableProducts();

          if (isActive) {
            setProducts(nextProducts);
          }
        } catch {
          if (isActive) {
            setError("No fue posible cargar los productos asignables.");
          }
        } finally {
          if (isActive) {
            setLoadingProducts(false);
          }
        }
      }

      void loadProducts();
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshEnrollments();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [refreshEnrollments]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError("");

    try {
      const result = await AdminStudentsService.searchStudents(normalizedQuery);

      setSearchResults(result.students);
    } catch {
      setError("No fue posible buscar alumnos.");
    } finally {
      setSearching(false);
    }
  }

  async function runMutation(intent: MutationIntent) {
    if (!selectedStudentId) {
      setError("Selecciona un alumno antes de modificar accesos.");
      return;
    }

    setMutation(intent);
    setError("");
    setSuccess("");

    const expiresAt =
      intent.type === "grant"
        ? toExpirationIso(expirationByProduct[intent.productId] ?? "")
        : toExpirationIso(
            expirationByProduct[
              enrollments.find(
                (enrollment) => enrollment.id === intent.enrollmentId,
              )?.productId ?? ""
            ] ?? "",
          );

    const result =
      intent.type === "grant"
        ? await AdminEnrollmentsService.grantAccess({
            expiresAt,
            productId: intent.productId,
            userId: selectedStudentId,
          })
        : intent.type === "revoke"
          ? await AdminEnrollmentsService.revokeAccess({
              enrollmentId: intent.enrollmentId,
            })
          : intent.type === "reactivate"
            ? await AdminEnrollmentsService.reactivateAccess({
                enrollmentId: intent.enrollmentId,
                expiresAt,
              })
            : await AdminEnrollmentsService.updateExpiration({
                enrollmentId: intent.enrollmentId,
                expiresAt,
              });

    setMutation(null);
    setPendingRevokeId(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess("Acceso actualizado correctamente.");
    await refreshEnrollments();
  }

  return (
    <div className="space-y-6">
      {showSearch ? (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 sm:p-6">
          <form
            className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]"
            onSubmit={handleSearch}
          >
            <label className="grid gap-2 text-sm font-medium text-white">
              Buscar alumno
              <input
                className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nombre o email"
                type="search"
                value={query}
              />
            </label>
            <button
              className="min-h-11 self-end rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={searching}
              type="submit"
            >
              {searching ? "Buscando..." : "Buscar"}
            </button>
          </form>

          {searchResults.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {searchResults.map((student) => (
                <button
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-4 py-3 text-left text-sm text-white transition hover:border-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
                  key={student.id}
                  onClick={() => {
                    setSelectedStudentId(student.id);
                    setSelectedStudentLabel(getStudentLabel(student));
                    setSuccess("");
                  }}
                  type="button"
                >
                  {getStudentLabel(student)}
                </button>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
              Accesos
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Gestión de enrollments
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              {selectedStudentLabel || "Selecciona un alumno para gestionar accesos."}
            </p>
          </div>
          {loadingProducts || loadingEnrollments ? (
            <p className="text-sm text-[var(--color-text-secondary)]">
              Cargando...
            </p>
          ) : null}
        </div>

        {error ? (
          <p className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 text-sm text-[var(--color-text-secondary)]">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 text-sm font-medium text-[var(--color-cyan)]">
            {success}
          </p>
        ) : null}

        {selectedStudentId ? (
          <div className="mt-6 grid gap-4">
            {products.map((product) => {
              const enrollment = enrollments.find(
                (currentEnrollment) =>
                  currentEnrollment.productId === product.id,
              );
              const expirationValue =
                expirationByProduct[product.id] ??
                getDateInputValue(enrollment?.expiresAt ?? null);
              const isMutating = Boolean(mutation);
              const isRevoking = pendingRevokeId === enrollment?.id;

              return (
                <article
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5"
                  key={product.id}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {product.title}
                      </h3>
                      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Estado:{" "}
                        <span className="font-semibold text-[var(--color-cyan)]">
                          {enrollment?.status ?? "Sin enrollment"}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        Inscripción: {formatDate(enrollment?.createdAt ?? null)}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        Vencimiento: {formatDate(enrollment?.expiresAt ?? null)}
                      </p>
                    </div>

                    <div className="grid gap-3 lg:min-w-72">
                      <label className="grid gap-2 text-sm font-medium text-white">
                        Vencimiento opcional
                        <input
                          className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
                          min={minExpirationDate}
                          onChange={(event) =>
                            setExpirationByProduct((currentValues) => ({
                              ...currentValues,
                              [product.id]: event.target.value,
                            }))
                          }
                          type="date"
                          value={expirationValue}
                        />
                      </label>

                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        {!enrollment ? (
                          <button
                            className="min-h-10 rounded-full bg-[var(--color-cyan)] px-4 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isMutating}
                            onClick={() =>
                              void runMutation({
                                productId: product.id,
                                type: "grant",
                              })
                            }
                            type="button"
                          >
                            Conceder acceso
                          </button>
                        ) : null}

                        {enrollment?.status === "active" ? (
                          <>
                            <button
                              className="min-h-10 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={isMutating}
                              onClick={() =>
                                void runMutation({
                                  enrollmentId: enrollment.id,
                                  type: "update-expiration",
                                })
                              }
                              type="button"
                            >
                              Cambiar vencimiento
                            </button>
                            <button
                              className="min-h-10 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={isMutating}
                              onClick={() => setPendingRevokeId(enrollment.id)}
                              type="button"
                            >
                              Revocar acceso
                            </button>
                          </>
                        ) : null}

                        {enrollment && enrollment.status !== "active" ? (
                          <button
                            className="min-h-10 rounded-full bg-[var(--color-cyan)] px-4 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isMutating}
                            onClick={() =>
                              void runMutation({
                                enrollmentId: enrollment.id,
                                type: "reactivate",
                              })
                            }
                            type="button"
                          >
                            Reactivar acceso
                          </button>
                        ) : null}
                      </div>

                      {isRevoking ? (
                        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            Esta acción revocará el acceso sin eliminar el
                            enrollment.
                          </p>
                          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                            <button
                              className="min-h-10 rounded-full bg-[var(--color-cyan)] px-4 text-sm font-semibold text-[var(--color-page-bg)] disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={isMutating}
                              onClick={() =>
                                void runMutation({
                                  enrollmentId: enrollment.id,
                                  type: "revoke",
                                })
                              }
                              type="button"
                            >
                              Confirmar revocación
                            </button>
                            <button
                              className="min-h-10 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white"
                              disabled={isMutating}
                              onClick={() => setPendingRevokeId(null)}
                              type="button"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
            {!loadingProducts && products.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">
                No hay productos activos asignables.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
