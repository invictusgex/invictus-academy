import { notFound } from "next/navigation";

import { AcademyShell } from "@/components/layout/academy-shell";
import { LessonCard } from "@/features/academy/lesson-card";
import {
  academyLessons,
  getAcademyModule,
} from "@/lib/academy-content";

type ModulePageProps = {
  params: Promise<{
    moduleId: string;
  }>;
};

export default async function AcademyModulePage({ params }: ModulePageProps) {
  const { moduleId } = await params;
  const academyModule = getAcademyModule(moduleId);

  if (!academyModule) {
    notFound();
  }

  return (
    <AcademyShell>
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          {academyModule.title}
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          {academyModule.title}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
          Contenido pendiente de definición
        </p>
      </section>

      <section className="mt-6">
        <h3 className="text-xl font-semibold text-white">Clases</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {academyLessons.map((lesson) => (
            <LessonCard
              key={lesson.lessonNumber}
              lesson={lesson}
              moduleId={academyModule.id}
            />
          ))}
        </div>
      </section>
    </AcademyShell>
  );
}
