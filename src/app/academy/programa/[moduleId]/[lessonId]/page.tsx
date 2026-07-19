import Link from "next/link";
import { notFound } from "next/navigation";

import { AcademyShell } from "@/components/layout/academy-shell";
import {
  academyLessons,
  getAcademyLesson,
  getAcademyModule,
} from "@/lib/academy-content";

type LessonPageProps = {
  params: Promise<{
    moduleId: string;
    lessonId: string;
  }>;
};

export default async function AcademyLessonPage({ params }: LessonPageProps) {
  const { moduleId, lessonId } = await params;
  const academyModule = getAcademyModule(moduleId);
  const lesson = getAcademyLesson(lessonId);

  if (!academyModule || !lesson) {
    notFound();
  }

  const previousLesson = academyLessons[lesson.lessonNumber - 2];
  const nextLesson = academyLessons[lesson.lessonNumber];

  return (
    <AcademyShell>
      <section>
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          {academyModule.title}
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          Título
        </h2>
        <p className="mt-3 text-lg text-[var(--color-text-secondary)]">
          {lesson.title}
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-card-bg)] p-8 text-center">
          <p className="text-lg font-semibold text-white">
            Área reservada para el reproductor de video.
          </p>
        </div>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
          Aquí se mostrará el contenido audiovisual y los recursos de la clase.
        </p>
      </section>

      <nav
        aria-label="Navegación entre clases"
        className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        {previousLesson ? (
          <Link
            href={`/academy/programa/${academyModule.id}/${previousLesson.id}`}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)]"
          >
            Clase anterior
          </Link>
        ) : (
          <span />
        )}
        {nextLesson ? (
          <Link
            href={`/academy/programa/${academyModule.id}/${nextLesson.id}`}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)]"
          >
            Clase siguiente
          </Link>
        ) : null}
      </nav>
    </AcademyShell>
  );
}
