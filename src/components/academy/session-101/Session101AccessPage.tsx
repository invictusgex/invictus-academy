import Link from "next/link";

import { academyWorkflowConfig } from "@/config/academy-workflow";
import {
  StudentCard,
  StudentContentGrid,
  StudentPageHeader,
  StudentSection,
  StudentStatCard,
  StudentStatusBadge,
} from "@/components/student";
import type {
  CompletionRuleResult,
  LearningWorkflowEvaluation,
} from "@/lib/types/learning-workflow.types";

type Session101AccessPageProps = {
  workflow: LearningWorkflowEvaluation | null;
};

const ruleCtas: Record<string, { href: string; label: string }> = {
  modules_completed: academyWorkflowConfig.session101.ctas.modules,
  required_forms: academyWorkflowConfig.session101.ctas.requiredForms,
  trading_days: academyWorkflowConfig.session101.ctas.tradingDays,
};

function formatRuleValue(value: CompletionRuleResult["currentValue"]) {
  if (typeof value === "boolean") {
    return value ? "Si" : "No";
  }

  return value === null ? "0" : String(value);
}

function getRuleCaption(rule: CompletionRuleResult) {
  return `${formatRuleValue(rule.currentValue)} / ${formatRuleValue(
    rule.requiredValue,
  )}`;
}

function RequirementCard({ rule }: { rule: CompletionRuleResult }) {
  const cta = ruleCtas[rule.key] ?? academyWorkflowConfig.session101.ctas.modules;

  return (
    <StudentCard className="h-full">
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
              Requisito
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">
              {rule.label}
            </h3>
          </div>
          <StudentStatusBadge tone={rule.satisfied ? "complete" : "warning"}>
            {rule.satisfied ? "Completado" : "Pendiente"}
          </StudentStatusBadge>
        </div>
        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
          Progreso actual: {getRuleCaption(rule)}
        </p>
        {!rule.satisfied ? (
          <Link
            className="mt-auto inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-fit motion-reduce:transition-none"
            href={cta.href}
          >
            {cta.label}
          </Link>
        ) : null}
      </div>
    </StudentCard>
  );
}

function LockedSession101({ workflow }: { workflow: LearningWorkflowEvaluation | null }) {
  const rules = workflow?.rules ?? [];

  return (
    <div className="space-y-6">
      <StudentPageHeader
        actions={<StudentStatusBadge tone="warning">Bloqueada</StudentStatusBadge>}
        eyebrow="Session 101"
        title="Sesión 101 bloqueada"
      >
        Completa los requisitos academicos del programa antes de acceder a las
        instrucciones de la Sesion 101.
      </StudentPageHeader>

      <StudentSection
        description="Este estado se calcula desde el Learning Workflow actual. No se persiste como desbloqueo separado."
        title="Requisitos pendientes"
      >
        {rules.length > 0 ? (
          <StudentContentGrid columns={3}>
            {rules.map((rule) => (
              <RequirementCard key={rule.key} rule={rule} />
            ))}
          </StudentContentGrid>
        ) : (
          <StudentCard>
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              No encontramos un enrollment activo para evaluar tus requisitos.
              Vuelve al dashboard para revisar tu acceso.
            </p>
            <Link
              className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-white/[0.03] sm:w-fit motion-reduce:transition-none"
              href="/academy"
            >
              Volver al dashboard
            </Link>
          </StudentCard>
        )}
      </StudentSection>
    </div>
  );
}

function UnlockedSession101({ workflow }: { workflow: LearningWorkflowEvaluation }) {
  const content = academyWorkflowConfig.session101.unlocked;

  return (
    <div className="space-y-6">
      <StudentPageHeader
        actions={
          <StudentStatusBadge tone="complete">
            {content.statusLabel}
          </StudentStatusBadge>
        }
        eyebrow="Session 101"
        title={content.title}
      >
        {content.description}
      </StudentPageHeader>

      <StudentSection title="Preparación">
        <StudentContentGrid columns={3}>
          <StudentStatCard
            caption="Módulos publicados completados"
            label="Módulos"
            value={`${workflow.completedModules}/${workflow.publishedModules}`}
          />
          <StudentStatCard
            caption="Formularios obligatorios enviados"
            label="Formularios"
            value={`${workflow.submittedRequiredForms}/${workflow.requiredForms}`}
          />
          <StudentStatCard
            caption="Fechas unicas registradas"
            label="Trading days"
            value={`${workflow.tradingDays}/${workflow.requiredTradingDays}`}
          />
        </StudentContentGrid>
      </StudentSection>

      <StudentSection
        description="Usa estás notas como checklist antes de coordinar la llamada."
        title="Instrucciones"
      >
        <StudentCard>
          <ol className="grid gap-4 text-sm leading-6 text-[var(--color-text-secondary)]">
            {content.instructions.map((instruction, index) => (
              <li className="flex min-w-0 gap-3" key={instruction}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-cyan)] text-xs font-bold text-[var(--color-cyan)]">
                  {index + 1}
                </span>
                <span className="min-w-0 break-words">{instruction}</span>
              </li>
            ))}
          </ol>
        </StudentCard>
      </StudentSection>
    </div>
  );
}

export function Session101AccessPage({ workflow }: Session101AccessPageProps) {
  if (!workflow?.requirementsSatisfied) {
    return <LockedSession101 workflow={workflow} />;
  }

  return <UnlockedSession101 workflow={workflow} />;
}
