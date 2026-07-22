"use client";

import Link from "next/link";

import { AdminScenarioForm } from "@/components/admin/scenarios/AdminScenarioForm";

export function AdminScenarioCreatePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <Link
          className="text-sm font-semibold text-[var(--color-cyan)] transition hover:text-white"
          href="/admin/scenarios"
        >
          Volver a escenarios
        </Link>
        <p className="mt-6 text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Biblioteca de Escenarios
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Nuevo escenario
        </h1>
      </section>

      <AdminScenarioForm mode="create" />
    </div>
  );
}
