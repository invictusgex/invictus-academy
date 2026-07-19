import Link from "next/link";
import { notFound } from "next/navigation";

import { AcademyShell } from "@/components/layout/academy-shell";
import { LessonNavigation } from "@/features/academy/lesson-navigation";
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
      <nav aria-label="Migas de pan" className="mb-5 text-sm">
        <ol className="flex flex-wrap items-center gap-2 text-[var(--color-text-muted)]">
          <li>
            <Link
              href="/academy/programa"
              className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
            >
              Programa
            </Link>
          </li>
          <li aria-hidden="true">&gt;</li>
          <li>
            <Link
              href={`/academy/programa/${academyModule.id}`}
              className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
            >
              {academyModule.title}
            </Link>
          </li>
          <li aria-hidden="true">&gt;</li>
          <li aria-current="page" className="text-white">
            {lesson.title}
          </li>
        </ol>
      </nav>

      <section className="mb-6">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          {academyModule.title}
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          {lesson.title}
        </h1>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div>
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
            <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-card-bg)] p-8 text-center sm:min-h-96">
              <p className="text-lg font-semibold text-white">
                Área reservada para el reproductor de video.
              </p>
            </div>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
              Aquí se mostrará el contenido audiovisual y los recursos de la
              clase.
            </p>
          </section>

          <nav
            aria-label="Navegación entre clases"
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            {previousLesson ? (
              <Link
                href={`/academy/programa/${academyModule.id}/${previousLesson.id}`}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
              >
                Clase anterior: {previousLesson.title}
              </Link>
            ) : null}
            {nextLesson ? (
              <Link
                href={`/academy/programa/${academyModule.id}/${nextLesson.id}`}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
              >
                Clase siguiente: {nextLesson.title}
              </Link>
            ) : null}
          </nav>
        </div>

        <LessonNavigation
          lessons={academyLessons}
          academyModule={academyModule}
          currentLessonId={lesson.id}
        />
      </div>
    </AcademyShell>
  );
}
